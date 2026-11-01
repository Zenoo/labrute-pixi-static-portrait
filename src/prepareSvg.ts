/** Express the portrait's minimum stroke in SVG units at the selected raster resolution. */
export function prepareSvg(svg: string, resolution: number, minimumPixels = 1): string {
  const minimumWidth = minimumPixels / resolution;

  // A hair/eye symbol may be magnified several times by its parent timelines.
  // Preserve authored wider strokes. The display supplies a minimum that scales
  // with the portrait, independently of nested symbol magnification and DPR.
  return svg.replace(
    /\sstroke-width="([\d.]+)"/g,
    (_, width) => ` stroke-width="${Math.max(Number(width), minimumWidth)}"`,
  );
}
