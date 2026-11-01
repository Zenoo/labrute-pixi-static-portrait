/** Keep Flash's minimum stroke at one raster pixel, not one SVG coordinate unit. */
export function prepareSvg(svg: string, resolution: number): string {
  const minimumWidth = 1 / resolution;

  // A hair/eye symbol may be magnified several times by its parent timelines.
  // Preserve authored wider strokes, while rasterizing thinner ones as a single
  // texel. Expanding them to 1 SVG unit would magnify their borders as well.
  return svg.replace(
    /\sstroke-width="([\d.]+)"/g,
    (_, width) => ` stroke-width="${Math.max(Number(width), minimumWidth)}"`,
  );
}
