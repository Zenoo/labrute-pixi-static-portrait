import { Assets, Rectangle, Sprite, Texture } from 'pixi.js';
import type { Renderer } from 'pixi.js';
import type { Svg } from './common';
import { prepareSvg } from './prepareSvg';
import { createPlacementFilters } from './flashFilters';

// Base SVG textures are shared through Assets. Track ownership so pre-existing
// consumer textures are never unloaded by this package's eviction policy.
interface Base {
  promise: Promise<Texture>;
  texture?: Texture;
  borrowers: number;
  stamp: number;
  owned: boolean;
}

const bases = new Map<string, Base>();
// A new load waits for a previous unload of the same URL to finish.
const retiring = new Map<string, Promise<void>>();
let baseSequence = 0;

// Colored render textures belong to one renderer and are reference-counted per display.
interface Variant {
  texture: Texture;
  borrowers: number;
  stamp: number;
  bytes: number;
  frame?: Rectangle;
}

interface Cache {
  variants: Map<string, Variant>;
  sequence: number;
}

const caches = new WeakMap<Renderer, Cache>();
const maxIdleBytes = 32 * 1024 * 1024;

/** Evict least-recently-used bases only when no display is borrowing them. */
function pruneBases() {
  let bytes = [...bases.values()].reduce(
    (sum, v) =>
      sum + (v.texture ? v.texture.source.pixelWidth * v.texture.source.pixelHeight * 4 : 0),
    0,
  );
  for (const [source, base] of [...bases].sort((a, b) => a[1].stamp - b[1].stamp)) {
    if (base.borrowers || !base.texture || (bytes <= maxIdleBytes && bases.size <= 256)) {
      continue;
    }

    bases.delete(source);
    bytes -= base.texture.source.pixelWidth * base.texture.source.pixelHeight * 4;
    if (base.owned) {
      const unloading = Assets.unload(source)
        .catch(() => {})
        .then(() => {
          retiring.delete(source);
        });
      retiring.set(source, unloading);
    }
  }
}

function cacheFor(renderer: Renderer): Cache {
  let cache = caches.get(renderer);
  if (!cache) {
    cache = { variants: new Map(), sequence: 0 };
    caches.set(renderer, cache);
  }

  return cache;
}

/** Renderer-local variants can be destroyed immediately once their last lease ends. */
function prune(cache: Cache, all = false) {
  let bytes = [...cache.variants.values()].reduce((sum, v) => sum + v.bytes, 0);
  for (const [key, v] of [...cache.variants].sort((a, b) => a[1].stamp - b[1].stamp)) {
    if (v.borrowers || (!all && cache.variants.size <= 128 && bytes <= maxIdleBytes)) {
      continue;
    }

    cache.variants.delete(key);
    bytes -= v.bytes;
    v.texture.destroy(true);
  }
}

export function portraitCacheStats(renderer: Renderer) {
  const cache = cacheFor(renderer);
  const entries = [...cache.variants.values()];
  return {
    basePromises: bases.size,
    variants: entries.length,
    baseBytes: [...bases.values()].reduce(
      (sum, v) =>
        sum + (v.texture ? v.texture.source.pixelWidth * v.texture.source.pixelHeight * 4 : 0),
      0,
    ),
    borrowedBases: [...bases.values()].filter((v) => v.borrowers > 0).length,
    borrowedVariants: entries.filter((v) => v.borrowers > 0).length,
    variantBytes: entries.reduce((sum, v) => sum + v.bytes, 0),
  };
}

/** Clear idle renderer-owned variants before retiring a pooled renderer. Active borrowers survive. */
export function clearPortraitCache(renderer: Renderer): void {
  prune(cacheFor(renderer), true);
}

/** Coalesce matching asset requests while retaining a lease for each pending display. */
export async function loadPortraitTexture(svg: Svg, resolution: number, minimumPixels = 1) {
  const source = `data:image/svg+xml,${encodeURIComponent(
    prepareSvg(svg.svg, resolution, minimumPixels) + `<!-- portrait:${resolution} -->`,
  )}`;
  if (retiring.has(source)) {
    await retiring.get(source);
  }

  let base = bases.get(source);
  if (!base) {
    const owned = !Assets.cache.has(source);
    const promise = Assets.load<Texture>({
      src: source,
      data: { parseAsGraphicsContext: false, resolution },
    });
    base = {
      promise,
      borrowers: 0,
      stamp: ++baseSequence,
      owned,
    };
    bases.set(source, base);
    const entry = base;
    promise.then(
      (texture) => {
        entry.texture = texture;
      },
      () => {
        if (bases.get(source) === entry) {
          bases.delete(source);
        }
      },
    );
  }

  base.borrowers++;
  base.stamp = ++baseSequence;
  const entry = base;
  let texture: Texture;

  try {
    texture = await entry.promise;
  } catch (error) {
    entry.borrowers--;
    throw error;
  }

  if (texture.destroyed) {
    entry.borrowers--;
    bases.delete(source);
    return loadPortraitTexture(svg, resolution, minimumPixels);
  }

  let released = false;
  return {
    texture,
    release() {
      if (released) {
        return;
      }

      released = true;
      entry.borrowers--;
      entry.stamp = ++baseSequence;
      pruneBases();
    },
  };
}

/** Bake an additive color into a reusable texture without mutating the base SVG. */
export function borrowColoredTexture(
  renderer: Renderer,
  base: Texture,
  color: string,
  resolution: number,
) {
  const cache = cacheFor(renderer);
  const key = `${base.uid}:${color}:${resolution}`;
  let entry = cache.variants.get(key);
  if (!entry) {
    const sprite = new Sprite(base);
    const filters = createPlacementFilters({ name: 'color' }, color);
    sprite.filters = filters;
    let texture: Texture;

    try {
      texture = renderer.generateTexture({
        target: sprite,
        resolution,
        frame: new Rectangle(0, 0, Math.ceil(base.width), Math.ceil(base.height)),
        textureSourceOptions: { antialias: true },
      });
    } finally {
      sprite.destroy({ texture: false, textureSource: false });
      filters.forEach((filter) => filter.destroy());
    }

    entry = {
      texture,
      borrowers: 0,
      stamp: 0,
      bytes: texture.source.pixelWidth * texture.source.pixelHeight * 4,
    };
    cache.variants.set(key, entry);
  }

  entry.borrowers++;
  entry.stamp = ++cache.sequence;
  const borrowed = entry;
  let released = false;

  return {
    texture: entry.texture,
    release() {
      if (released) {
        return;
      }

      released = true;
      borrowed.borrowers--;
      borrowed.stamp = ++cache.sequence;
      prune(cache);
    },
  };
}

/** Cache a selected color region as a renderer-owned texture, including its group transform. */
export function borrowRegionTexture(
  renderer: Renderer,
  key: string,
  create: () => { texture: Texture; frame: Rectangle },
) {
  const cache = cacheFor(renderer);
  let entry = cache.variants.get(key);
  if (!entry) {
    const { texture, frame } = create();
    entry = {
      texture,
      frame,
      borrowers: 0,
      stamp: 0,
      bytes: texture.source.pixelWidth * texture.source.pixelHeight * 4,
    };
    cache.variants.set(key, entry);
  }

  entry.borrowers++;
  entry.stamp = ++cache.sequence;
  const borrowed = entry;
  let released = false;

  return {
    texture: entry.texture,
    frame: entry.frame!,
    release() {
      if (released) {
        return;
      }

      released = true;
      borrowed.borrowers--;
      borrowed.stamp = ++cache.sequence;
      prune(cache);
    },
  };
}
