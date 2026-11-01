import { Symbol460, Symbol752 } from 'labrute-pixi-static-portrait';
export const partKeys = ['p1', 'p1a', 'p1b', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p7b', 'p8'];
export const colorKeys = [
  'col0',
  'col0a',
  'col0c',
  'col1',
  'col1a',
  'col1b',
  'col1c',
  'col1d',
  'col2',
  'col2a',
  'col2b',
  'col3',
  'col3b',
  'col4',
  'col4a',
  'col4b',
];

export function appearance(
  gender = 'male',
  body = gender === 'male' ? '01013100611' : '00100100610',
) {
  return {
    gender,
    parts: Object.fromEntries(partKeys.map((key, i) => [key, parseInt(body[i] || '0', 16)])),
    colors: Object.fromEntries(
      colorKeys.map((key) => [
        key,
        key.startsWith('col0') ? '#eccd57' : key.startsWith('col1') ? '#784129' : '#7bad30',
      ]),
    ),
    facing: 'left',
    scale: 3,
  };
}

export const rootFor = (gender) => (gender === 'male' ? Symbol460 : Symbol752);

export function partCounts(gender) {
  const counts = Object.fromEntries(partKeys.map((key) => [key, 1]));
  const seen = new Set();

  function visit(symbol) {
    if (symbol.type !== 'symbol' || seen.has(symbol)) {
      return;
    }

    seen.add(symbol);
    const defs = new Map(symbol.parts?.map((p) => [p.name, p]));
    for (const frame of symbol.frames || []) {
      for (const p of frame) {
        if (p.partIdx) {
          counts[p.partIdx.slice(1)] = Math.max(
            counts[p.partIdx.slice(1)] || 1,
            defs.get(p.name)?.frames?.length || 1,
          );
        }
      }
    }

    symbol.parts?.forEach(visit);
  }

  visit(rootFor(gender));
  return counts;
}

export function clothingPresets(gender) {
  const count = partCounts(gender).p7;
  const presets = [];
  // Check all body builds under the initial portrait, holding outfit selectors fixed.
  function hasDetails(outfit) {
    const seen = new Set();
    let different = false;

    function visit(symbol, selectedFrame) {
      if (symbol.type === 'svg') {
        return;
      }

      const key = `${symbol.name}:${selectedFrame}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      const defs = new Map(symbol.parts?.map((p) => [p.name, p]));
      for (const frame of selectedFrame === undefined
        ? symbol.frames || []
        : [symbol.frames[selectedFrame]]) {
        for (const p of frame) {
          const child = defs.get(p.name);
          if (child?.type !== 'symbol') {
            continue;
          }

          if (
            p.partIdx === '_p1' &&
            JSON.stringify(child.frames[0]) !==
              JSON.stringify(child.frames[1 % child.frames.length])
          ) {
            different = true;
          }

          const clothing = p.partIdx === '_p7' || p.partIdx === '_p7b';
          visit(child, clothing ? outfit % (child.frames?.length || 1) : undefined);
        }
      }
    }

    visit(rootFor(gender), 0);
    return different;
  }

  for (let outfit = 0; outfit < count; outfit++) {
    presets.push({
      label: `Outfit ${outfit + 1}`,
      parts: {
        p1: 0,
        p7: outfit,
        p7b: outfit,
      },
    });
    if (hasDetails(outfit)) {
      presets.push({
        label: `Outfit ${outfit + 1} · details`,
        parts: {
          p1: 1,
          p7: outfit,
          p7b: outfit,
        },
      });
    }
  }

  return presets;
}
