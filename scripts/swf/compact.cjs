/** Defaults belong in the renderer, rather than being repeated in every frame. */
function compactTransform(matrix) {
  if (!matrix) {
    return undefined;
  }

  const defaults = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: 0,
    ty: 0,
  };
  const entries = Object.entries(matrix).filter(([key, value]) => value !== defaults[key]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function compactColor(color) {
  if (!color) {
    return undefined;
  }

  const multiply = color.multiply.some((value) => value !== 1) ? color.multiply : undefined;
  const add = color.add.some((value) => value !== 0) ? color.add : undefined;
  // Presence is meaningful for a caller's replacement colorOffset, even when
  // the authored transform is identity. Keep that marker, omit its defaults.
  return multiply || add ? { multiply, add } : {};
}

function compactFilters(filters) {
  const result = filters?.filter(
    (filter) => filter.type !== 'blur' || filter.blurX || filter.blurY,
  );
  return result?.length ? result : undefined;
}

module.exports = {
  compactTransform,
  compactColor,
  compactFilters,
};
