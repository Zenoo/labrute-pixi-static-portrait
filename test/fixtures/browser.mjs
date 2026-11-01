import { autoDetectRenderer, Assets, Container, Rectangle } from 'pixi.js';
import {
  BruteDisplay,
  clearPortraitCache,
  portraitCacheStats,
  Symbol460,
} from 'labrute-pixi-static-portrait';
import { appearance } from '../appearance.mjs';
import { compare } from '../comparison.mjs';
const check = (value, message) => {
  if (!value) {
    throw new Error(message);
  }
};
window.runPortraitTests = async (mode) => {
  const renderer = await autoDetectRenderer({
    width: 800,
    height: 1000,
    resolution: 1,
    antialias: true,
    backgroundAlpha: 0,
    preference: 'webgl',
  });
  document.body.appendChild(renderer.canvas);
  const load = Assets.load.bind(Assets);
  let loads = 0;
  const baseTextures = new Set();
  const textures = new Set();
  Assets.load = async (request) => {
    loads++;
    const texture = await load(request);
    check(Assets.cache.get(request.src) === texture, 'Assets cache uses another Pixi runtime');
    baseTextures.add(texture.source);
    return texture;
  };
  const samples = [];
  try {
    if (mode === 'comparison') {
      const results = [];
      for (const gender of ['male', 'female']) {
        for (const facing of ['left', 'right']) {
          for (const body of [undefined, '11111111111', '00000000000']) {
            const input = appearance(gender, body);
            input.facing = facing;
            const result = await compare(renderer, input);
            check(result.report.occupied > 1000, 'Empty comparison');
            check(
              result.report.changedRatio < 0.15,
              `Source geometry differs: ${JSON.stringify(result.report)}`,
            );
            results.push({
              ...result.report,
              source: result.source.toDataURL(),
              actual: result.actual.toDataURL(),
              difference: result.difference.toDataURL(),
              overlay: result.overlay.toDataURL(),
            });
          }
        }
      }

      return { results };
    }

    for (let i = 0; i < 26; i++) {
      const start = performance.now();
      const input = appearance(i % 2 ? 'female' : 'male');
      const d = new BruteDisplay({ renderer, ...input });
      await d.ready;
      const ready = performance.now();
      check(d.container instanceof Container, 'Container identity differs');
      check(Symbol460.name === 'Symbol460', 'Named exports missing');
      const image = await renderer.extract.image({ target: d.container, format: 'png' });
      check(image.src.startsWith('data:image/png'), 'PNG extraction failed');
      const extracted = performance.now();
      d.svgs.forEach((s) => textures.add(s.texture.source));
      const bounds = d.container.getLocalBounds();
      d.destroy();
      samples.push({
        createMs: ready - start,
        extractMs: extracted - ready,
        totalMs: performance.now() - start,
        loads,
        bounds: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
      });
    }

    const cache = portraitCacheStats(renderer);
    const gpu = (renderer) => {
      const sources = Object.values(renderer.texture._managedTextures.items).filter(Boolean);
      return {
        sources: sources.length,
        estimatedRgbaBytes: sources.reduce((n, s) => n + s.pixelWidth * s.pixelHeight * 4, 0),
      };
    };
    const benchmark = {
      samples,
      textureSources: baseTextures.size + cache.variants,
      diagnosticTextureSources: textures.size,
      textureBytes: cache.baseBytes + cache.variantBytes,
      baseSources: baseTextures.size,
      cache,
      gpu: gpu(renderer),
      heap: performance.memory?.usedJSHeapSize,
    };
    if (mode === 'benchmark') {
      benchmark.profiles = [];
      for (const presentation of [false, true]) {
        const d = new BruteDisplay({
          renderer,
          ...appearance(),
          presentation,
        });
        await d.ready;
        const active = (n) => (n.visible ? [n, ...n.children.flatMap(active)] : []);
        const nodes = active(d.container);
        const start = performance.now();
        const px = renderer.extract.pixels(d.container);
        const end = performance.now();
        benchmark.profiles.push({
          presentation,
          pixelsMs: end - start,
          width: px.width,
          height: px.height,
          filters: nodes
            .filter((n) => n.filters?.length)
            .map((n) => ({ label: n.label, filters: n.filters.length })),
          masks: nodes.filter((n) => n.mask).length,
        });
        d.destroy();
      }

      const pool = [renderer];
      try {
        for (let i = 0; i < 2; i++) {
          pool.push(
            await autoDetectRenderer({
              width: 800,
              height: 1000,
              resolution: 1,
              antialias: true,
              backgroundAlpha: 0,
              preference: 'webgl',
            }),
          );
        }

        benchmark.batches = [];
        for (const varied of [false, true]) {
          const start = performance.now();
          const before = loads;
          for (let i = 0; i < 12; i++) {
            const input = appearance(i % 2 ? 'female' : 'male');
            if (varied) {
              input.parts.p7 = i % 10;
              input.parts.p1 = i % 2;
              input.colors.col3 = i % 2 ? '#bb1111' : '#559399';
            }

            const d = new BruteDisplay({ renderer: pool[i % 3], ...input });
            try {
              await d.ready;
              await pool[i % 3].extract.image({ target: d.container, format: 'png' });
            } finally {
              d.destroy();
            }
          }

          benchmark.batches.push({
            portraits: 12,
            renderers: 3,
            varied,
            totalMs: performance.now() - start,
            additionalLoads: loads - before,
            caches: pool.map(portraitCacheStats),
            gpu: pool.map(gpu),
          });
        }
      } finally {
        for (const r of pool.slice(1)) {
          clearPortraitCache(r);
          r.destroy();
        }
      }

      return benchmark;
    }
    // Bounds, transparency, true mirrored pixels, and presentation padding at scale 3.
    for (const gender of ['male', 'female']) {
      const config = appearance(gender);
      const stage = new Container();
      const d = new BruteDisplay({
        renderer,
        ...config,
        presentation: false,
      });
      await d.ready;
      const initial = d.svgs.map((s) => s.texture);
      const eyeWhites = d.svgs
        .filter((s) => /^Symbol(337|344)$/.test(s.label))
        .map((s) => s.texture);
      const loadedBeforeEdits = loads;
      const bounds = d.container.getLocalBounds();
      check(bounds.width > 150 && bounds.height > 350, 'Unexpected scale-3 portrait bounds');
      const left = renderer.extract.pixels(d.container);
      check(
        left.pixels.some((v, i) => i % 4 === 3 && v > 0),
        'Empty pixels',
      );
      check(
        left.pixels.some((v, i) => i % 4 === 3 && v === 0),
        'Missing transparency',
      );
      await d.updateAppearance({
        ...config,
        facing: 'right',
        presentation: false,
      });
      const right = renderer.extract.pixels(d.container);
      check(Math.abs(left.width - right.width) <= 1, 'Facing changes width');
      check(Math.abs(left.height - right.height) <= 1, 'Facing changes height');
      await d.updateAppearance({ ...config });
      const plain = renderer.extract.pixels(d.container);
      const white = (pixels) =>
        pixels.reduce(
          (sum, v, i) =>
            sum +
            (i % 4 === 0 &&
            v > 245 &&
            pixels[i + 1] > 245 &&
            pixels[i + 2] > 245 &&
            pixels[i + 3] > 200
              ? 1
              : 0),
          0,
        );
      await d.updateAppearance({ ...config, highlightColorName: 'col3' });
      const outlined = d.container.getLocalBounds();
      check(outlined.width >= bounds.width, 'Outline shrank bounds');
      const highlighted = renderer.extract.pixels(d.container);
      check(
        white(highlighted.pixels) > white(plain.pixels),
        'Selected slot has no white highlight',
      );
      const { pixels: edge, width, height } = highlighted;
      for (let x = 0; x < width; x++) {
        check(
          edge[x * 4 + 3] === 0 && edge[((height - 1) * width + x) * 4 + 3] === 0,
          'Vertical filter padding clipped',
        );
      }

      for (let y = 0; y < height; y++) {
        check(
          edge[y * width * 4 + 3] === 0 && edge[(y * width + width - 1) * 4 + 3] === 0,
          'Horizontal filter padding clipped',
        );
      }

      await d.setColors({ ...config.colors, col3: '#ff0000' }, 'col3');
      const red = renderer.extract.pixels(d.container);
      await d.setColors({ ...config.colors, col3: '#00ff00' }, 'col3');
      const green = renderer.extract.pixels(d.container);
      check(
        red.pixels.some((v, i) => v !== green.pixels[i]),
        'Color edits did not change pixels',
      );
      check(loads === loadedBeforeEdits, 'Color edits reloaded base SVGs');
      check(
        d.svgs
          .filter((s) => /^Symbol(337|344)$/.test(s.label))
          .every((s) => eyeWhites.includes(s.texture)),
        'Iris recoloring changed eye whites',
      );
      await d.setColors(config.colors, 'col3');
      check(
        d.svgs.some((s) => initial.includes(s.texture)),
        'Compatible textures were not shared',
      );
      await d.updateAppearance({
        ...config,
        scale: 1,
        presentation: false,
      });
      const small = renderer.extract.pixels(d.container);
      check(
        small.width < left.width * 0.4 && small.height < left.height * 0.4,
        'Scale-1 geometry was not reduced',
      );
      d.destroy();
      stage.destroy();
    }
    // Two live borrowers survive another display's destruction and explicit cache trimming.
    const a = new BruteDisplay({ renderer, ...appearance() });
    const b = new BruteDisplay({ renderer, ...appearance() });
    await Promise.all([a.ready, b.ready]);
    a.destroy();
    clearPortraitCache(renderer);
    await renderer.extract.image({ target: b.container, format: 'png' });
    b.destroy();
    clearPortraitCache(renderer);
    check(portraitCacheStats(renderer).variants === 0, 'Idle variants leaked');
    return {
      benchmark,
      checks:
        'PNG, transparency, bounds, facing, colors, highlights, shared textures, Container/Assets identity',
    };
  } finally {
    Assets.load = load;
    clearPortraitCache(renderer);
    renderer.destroy();
  }
};
