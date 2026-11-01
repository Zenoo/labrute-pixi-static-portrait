/** Undo FFDec's preview-only minimum stroke width before rasterizing artwork. */
function restoreStrokeWidths(svg) {
  return svg.replace(/<path\b[^>]*>/g, (element) => {
    const original = element.match(/\bffdec:original-stroke-width="([^"]+)"/);

    if (!original) {
      return element;
    }

    // FFDec widens subpixel strokes to 1px for its standalone SVG preview. A
    // nested SWF symbol can magnify that to several pixels around hair or eyes.
    // Its metadata retains the authored width, so no asset-specific fix is needed.
    return element.replace(/\sstroke-width="[^"]+"/, ` stroke-width="${original[1]}"`);
  });
}

/** Remove editor metadata and formatting, leaving the rendered SVG unchanged. */
function compactSvg(svg) {
  const compact = svg
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/\s+xmlns:ffdec="[^"]*"/g, '')
    .replace(/\s+ffdec:[\w-]+="[^"]*"/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  return compact.includes('xlink:') ? compact : compact.replace(/\s+xmlns:xlink="[^"]*"/g, '');
}

module.exports = { restoreStrokeWidths, compactSvg };
