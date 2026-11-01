import { Container, Matrix, Rectangle, Sprite } from 'pixi.js';
import type { Filter, Renderer } from 'pixi.js';
import { OutlineFilter } from 'pixi-filters';
import { Symbol460, Symbol752 } from './symbols/index';
import type { FramePart, Symbol as Definition, Svg } from './common';
import type {
  BodyPart,
  BruteDisplayOptions,
  ColorSlot,
  PortraitAppearance,
  PortraitColors,
} from './portraitTypes';
import { getDefinitions, getFramePlan } from './framePlan';
import { createPlacementFilters } from './flashFilters';
import { borrowColoredTexture, borrowRegionTexture, loadPortraitTexture } from './portraitTextures';

function matrixFromPlacement(transform?: FramePart['transform']) {
  return new Matrix(
    transform?.a ?? 1,
    transform?.b ?? 0,
    transform?.c ?? 0,
    transform?.d ?? 1,
    transform?.tx ?? 0,
    transform?.ty ?? 0,
  );
}

/** Largest singular value includes shear, rotation, and every ancestor's scale. */
export function portraitResolution(m: Matrix, rendererResolution: number): number {
  const sum = m.a * m.a + m.b * m.b + m.c * m.c + m.d * m.d;
  const determinant = m.a * m.d - m.b * m.c;
  const discriminant = Math.max(0, sum * sum - 4 * determinant * determinant);
  const maximumScale = Math.sqrt((sum + Math.sqrt(discriminant)) / 2);

  // Round upward to eighths so nearby transforms can share an adequately sized SVG texture.
  return Math.max(1, Math.ceil(maximumScale * rendererResolution * 8) / 8);
}

function abort(message: string) {
  const error = new Error(message);
  error.name = 'AbortError';
  return error;
}

// Each staged or committed tree owns its nodes and filters, but only borrows textures.
interface Scene {
  root: Container;
  sprites: Sprite[];
  filters: Filter[];
  releases: (() => void)[];
  disposed?: boolean;
}

function dispose(scene: Scene) {
  if (scene.disposed) {
    return;
  }

  scene.disposed = true;
  scene.root.destroy({
    children: true,
    texture: false,
    textureSource: false,
  });
  scene.filters.forEach((filter) => filter.destroy());
  scene.releases.forEach((release) => release());
}

/** Validate and copy inputs before any asynchronous load can observe caller mutations. */
function snapshot(input: PortraitAppearance): PortraitAppearance {
  if (!['male', 'female'].includes(input.gender)) {
    throw new Error('Invalid portrait gender');
  }

  if (!Number.isFinite(input.scale ?? 1) || (input.scale ?? 1) <= 0) {
    throw new Error('Scale must be positive and finite');
  }

  if (input.facing && !['left', 'right'].includes(input.facing)) {
    throw new Error('Invalid portrait facing');
  }

  for (const [slot, value] of Object.entries(input.parts)) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`Invalid selector ${slot}`);
    }
  }

  for (const [slot, color] of Object.entries(input.colors)) {
    if (!/^#[\da-f]{6}$/i.test(color)) {
      throw new Error(`Invalid color ${slot}: expected #rrggbb`);
    }
  }

  return {
    ...input,
    parts: { ...input.parts },
    colors: { ...input.colors },
  };
}

/** A static display tree. The caller owns rendering, extraction, and renderer lifetime. */
export class BruteDisplay {
  readonly container = new Container();
  readonly renderer: Renderer;
  ready: Promise<void>;
  svgs: Sprite[] = [];
  #appearance: PortraitAppearance;
  #scene?: Scene;
  #pending?: Scene;
  #revision = 0;
  #destroyed = false;
  #cancel?: (reason: Error) => void;

  constructor({ renderer, ...appearance }: BruteDisplayOptions) {
    this.renderer = renderer;
    this.#appearance = appearance;
    this.ready = this.updateAppearance(appearance);
  }

  get appearance(): Readonly<PortraitAppearance> {
    return this.#appearance;
  }

  get destroyed(): boolean {
    return this.#destroyed;
  }

  /** Atomic replacement. Superseded updates reject with AbortError; the old scene remains on failure. */
  updateAppearance(input: PortraitAppearance): Promise<void> {
    if (this.#destroyed) {
      return Promise.reject(abort('Portrait is destroyed'));
    }
    // Cancel the previous promise immediately; shared asset loading may still finish later.
    this.#cancel?.(abort('Portrait update superseded'));
    if (this.#pending) {
      dispose(this.#pending);
      this.#pending = undefined;
    }

    const revision = ++this.#revision;

    // Readiness races this cancellation promise rather than waiting for every network request.
    let rejectCancelled: (reason: Error) => void;
    const cancelled = new Promise<never>((_, reject) => {
      rejectCancelled = reject;
    });
    this.#cancel = rejectCancelled!;

    const work = async () => {
      const appearance = snapshot(input);
      this.#appearance = appearance;
      const scene: Scene = {
        root: new Container(),
        sprites: [],
        filters: [],
        releases: [],
      };
      this.#pending = scene;
      let live = true;

      // Every continuation checks ownership before creating sprites or committing a scene.
      const current = () => {
        if (!live || this.#destroyed || revision !== this.#revision) {
          throw abort('Obsolete portrait load');
        }
      };

      const ownFilters = (node: Container, filters: Filter[]) => {
        if (filters.length) {
          node.filters = filters;
          scene.filters.push(...filters.filter((filter) => !scene.filters.includes(filter)));
        }
      };

      const scale = appearance.scale ?? 1;
      const regionKey = JSON.stringify([
        appearance.parts,
        appearance.colors,
        appearance.recolorIrises,
        appearance.presentation,
        appearance.highlightColorName,
      ]);
      scene.root.scale.set((appearance.facing === 'right' ? -1 : 1) * scale, scale);

      const colorFor = (slot?: string) => {
        if (!slot) {
          return undefined;
        }

        const color = appearance.colors[slot.slice(1) as ColorSlot];
        if (!color) {
          throw new Error(`Missing color ${slot}`);
        }

        return color;
      };

      // Base SVGs and colored variants have separate leases, both released with this scene.
      const addSvg = async (svg: Svg, parent: Container, composed: Matrix, color?: string) => {
        const resolution = portraitResolution(composed, this.renderer.resolution);
        // Presentation hairlines stay one portrait unit wide when an extraction
        // is enlarged or rendered on a high-DPI canvas, rather than one texel.
        const minimumPixels =
          appearance.presentation === false ? 1 : scale * this.renderer.resolution;
        const loaded = await loadPortraitTexture(svg, resolution, minimumPixels);
        try {
          current();
        } catch (error) {
          loaded.release();
          throw error;
        }

        const base = loaded.texture;
        scene.releases.push(loaded.release);
        let texture = base;
        if (color) {
          const borrowed = borrowColoredTexture(this.renderer, base, color, resolution);
          texture = borrowed.texture;
          scene.releases.push(borrowed.release);
        }

        const sprite = new Sprite(texture);
        sprite.label = svg.name;
        sprite.position.set(-svg.offset.x, -svg.offset.y);
        parent.addChild(sprite);
        scene.sprites.push(sprite);
      };

      // Recursively build just the selected frame of each nested source timeline.
      const populate = async (
        definition: Definition | Svg,
        parent: Container,
        composed: Matrix,
        frame = 0,
      ): Promise<void> => {
        current();
        if (definition.type === 'svg') {
          return addSvg(definition, parent, composed);
        }

        if (appearance.recolorIrises === false && definition.original) {
          return addSvg(definition.original, parent, composed);
        }

        const plans = getFramePlan(definition, frame);
        // Stage in authored depth order before asynchronous loads can finish out of order.
        const tasks: Promise<void>[] = [];
        const masks = new Map<string, Container>();
        let traversalError: unknown;
        try {
          for (const plan of [...plans].reverse()) {
            const { placement, definition: child } = plan;
            const node = parent.addChild(new Container());
            node.label = child.name;
            const transform = matrixFromPlacement(placement.transform);
            node.setFromMatrix(transform);
            const world = composed.clone().append(transform);
            const color = colorFor(placement.colorIdx);
            if (placement.blendMode) {
              node.blendMode = placement.blendMode;
            }
            // Unbound timelines stay stopped at their initial frame. Bound selectors wrap
            // against the full source frame count, including authored empty frames.
            let selected = 0;
            if (placement.partIdx) {
              const value = appearance.parts[placement.partIdx.slice(1) as BodyPart];
              if (!Number.isSafeInteger(value) || value < 0) {
                throw new Error(`Missing selector ${placement.partIdx}`);
              }

              selected = value % (child.type === 'symbol' ? child.frames?.length || 1 : 1);
            }

            const simple = color && plan.coloredSvg;
            ownFilters(
              node,
              simple ? [] : createPlacementFilters(placement, color, portraitResolution(world, 1)),
            );
            const build = simple
              ? addSvg(simple, node, world, color)
              : populate(child, node, world, selected);
            tasks.push(
              build
                .then(() => {
                  current();
                  if (!color || simple || plan.mask) {
                    return;
                  }
                  // Cache a colored group only after all its children have loaded.
                  const resolution = portraitResolution(world, this.renderer.resolution);
                  const key = `region:${child.name}:${selected}:${resolution}:${regionKey}:${color}`;
                  const borrowed = borrowRegionTexture(this.renderer, key, () => {
                    const bounds = node.getLocalBounds();
                    const padding = Math.max(
                      1 / resolution,
                      ...(node.filters ?? []).map((filter) => filter.padding / resolution),
                    );
                    const frame = new Rectangle(
                      Math.floor((bounds.x - padding) * resolution) / resolution,
                      Math.floor((bounds.y - padding) * resolution) / resolution,
                      Math.ceil(bounds.width + 2 * padding) + 1,
                      Math.ceil(bounds.height + 2 * padding) + 1,
                    );
                    return {
                      frame,
                      texture: this.renderer.generateTexture({
                        target: node,
                        frame,
                        resolution,
                        antialias: true,
                      }),
                    };
                  });
                  scene.releases.push(borrowed.release);
                  // Retain the original sprites under the same transform for diagnostics.
                  const diagnostic = new Container();
                  diagnostic.label = 'source-sprites';
                  diagnostic.visible = false;
                  diagnostic.addChild(...node.removeChildren());
                  node.addChild(diagnostic);
                  node.filters = null;
                  const cached = new Sprite(borrowed.texture);
                  cached.position.set(borrowed.frame.x, borrowed.frame.y);
                  node.addChild(cached);
                })
                .then(() => {
                  current();

                  // Presentation highlights stay outside cached source-color textures.
                  if (
                    appearance.presentation !== false &&
                    appearance.highlightColorName &&
                    placement.colorIdx?.slice(1) === appearance.highlightColorName
                  ) {
                    const highlight = new OutlineFilter({ thickness: 4, color: 0xffffff });
                    highlight.padding = 8;
                    ownFilters(node, [...(node.filters ?? []), highlight]);
                  }
                }),
            );
            if (plan.mask) {
              let mask = masks.get(plan.mask.name);
              if (!mask) {
                mask = parent.addChild(new Container());
                mask.label = `${plan.mask.name}:mask`;
                const maskMatrix = matrixFromPlacement(plan.mask.transform);
                mask.setFromMatrix(maskMatrix);
                const maskDefinition = getDefinitions(definition.parts).get(plan.mask.name);
                if (!maskDefinition) {
                  throw new Error(`Missing mask ${plan.mask.name}`);
                }

                tasks.push(populate(maskDefinition, mask, composed.clone().append(maskMatrix)));
                masks.set(plan.mask.name, mask);
              }
              // Siblings retain their transforms in the shared timeline coordinate space.
              node.mask = mask;
            }
          }
        } catch (error) {
          traversalError = error;
        }

        // Settle started child tasks before disposing their shared parent on failure.
        const results = await Promise.allSettled(tasks);
        if (traversalError) {
          throw traversalError;
        }

        const failure = results.find((result) => result.status === 'rejected') as
          | PromiseRejectedResult
          | undefined;
        if (failure) {
          throw failure.reason;
        }
      };

      try {
        await populate(
          appearance.gender === 'male' ? Symbol460 : Symbol752,
          scene.root,
          matrixFromPlacement({ a: scale, d: scale }),
        );
        current();
        if (appearance.presentation !== false) {
          const outline = new OutlineFilter({ thickness: 2, color: 0x000000 });
          outline.padding = 4;
          ownFilters(scene.root, [outline]);
        }
        // Measure before this tree inherits the caller's position or parent transforms.
        const bounds = scene.root.getBounds();
        const padding =
          appearance.presentation === false ? 0 : appearance.highlightColorName ? 12 : 4;
        // Extract's automatic frame uses local bounds, which otherwise omit filter padding.
        const boundsArea = new Rectangle(
          Math.floor(bounds.x - padding),
          Math.floor(bounds.y - padding),
          Math.ceil(bounds.width + 2 * padding) + 1,
          Math.ceil(bounds.height + 2 * padding) + 1,
        );

        // Commit only a complete, current tree. Failed loads leave the old tree usable.
        if (this.#scene) {
          dispose(this.#scene);
        }

        this.#scene = scene;
        this.svgs = scene.sprites;
        this.container.addChild(scene.root);
        this.container.boundsArea = boundsArea;
      } catch (error) {
        live = false;
        dispose(scene);
        throw error;
      } finally {
        if (revision === this.#revision) {
          this.#cancel = undefined;
          this.#pending = undefined;
        }
      }
    };

    this.ready = Promise.race([work(), cancelled]);
    // Attach a handler for callers that replace an update without awaiting its old promise.
    void this.ready.catch(() => {});
    return this.ready;
  }

  /** Update decoded colors while preserving the remaining appearance choices. */
  setColors(
    colors: PortraitColors,
    highlightColorName = this.#appearance.highlightColorName,
  ): Promise<void> {
    return this.updateAppearance({
      ...this.#appearance,
      colors,
      highlightColorName,
    });
  }

  /** Release staged and committed trees without taking ownership of the caller's renderer. */
  destroy(): void {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;
    this.#revision++;
    this.#cancel?.(abort('Portrait destroyed'));
    this.#cancel = undefined;
    if (this.#pending) {
      dispose(this.#pending);
      this.#pending = undefined;
    }

    if (this.#scene) {
      dispose(this.#scene);
      this.#scene = undefined;
    }

    this.svgs = [];
    this.container.destroy({
      children: true,
      texture: false,
      textureSource: false,
    });
  }
}
