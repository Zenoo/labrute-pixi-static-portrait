import { BlurFilter, ColorMatrixFilter, Filter } from 'pixi.js';
import type { FramePart } from './common';
import { createFlashGlowFilter } from './flashGlowFilter';

/** Flash uses additive RGB offsets, including for its named color slots. */
export function createPlacementFilters(placement: FramePart, color?: string, scale = 1): Filter[] {
  const filters: Filter[] = [];
  const multiply = color ? [1, 1, 1, 1] : placement.colorTransform?.multiply ?? [1, 1, 1, 1];
  const add = [...(placement.colorTransform?.add ?? [0, 0, 0, 0])];

  if (color) {
    const value = parseInt(color.replace('#', ''), 16);
    add[0] = ((value >> 16) & 255) - 255;
    add[1] = ((value >> 8) & 255) - 255;
    add[2] = (value & 255) - 255;
    add[3] = 0;
  }

  const changesColor = multiply.some((value) => value !== 1) || add.some((value) => value !== 0);
  if (changesColor) {
    const filter = new ColorMatrixFilter();

    // Each row transforms one RGBA channel; the last column adds a normalized offset.
    // prettier-ignore
    filter.matrix = [
      multiply[0], 0, 0, 0, add[0] / 255,
      0, multiply[1], 0, 0, add[1] / 255,
      0, 0, multiply[2], 0, add[2] / 255,
      0, 0, 0, multiply[3], add[3] / 255,
    ];
    filters.push(filter);
  }

  for (const source of placement.filters ?? []) {
    if (source.type === 'colorMatrix') {
      const filter = new ColorMatrixFilter();
      filter.matrix = (source.matrix ?? []).map((value, index) =>
        index % 5 === 4 ? value / 255 : value,
      ) as ColorMatrixFilter['matrix'];
      filters.push(filter);
    } else if (source.type === 'glow') {
      filters.push(createFlashGlowFilter(source, scale));
    } else if (source.type === 'blur' && (source.blurX || source.blurY)) {
      filters.push(
        new BlurFilter({
          strengthX: ((source.blurX ?? 0) * scale) / 2,
          strengthY: ((source.blurY ?? 0) * scale) / 2,
          quality: Math.max(1, (source.flags ?? 8) >> 3),
        }),
      );
    }
  }

  for (const filter of filters) {
    filter.resolution = 'inherit';
  }

  return filters;
}
