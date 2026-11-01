// The female eye shapes bake turquoise into their iris paths. Separate those
// fills from the whites and outlines so the existing col3 color cache can be
// used, just as it is for male irises. Original exported SVGs stay untouched.
const irisShades = new Map([
  ['#096f6f', '#6f6f6f'],
  ['#054746', '#474747'],
  ['#00ffff', '#ffffff'],
]);

function colorableEye(artwork) {
  const irisPaths = [];
  const outline = artwork.svg.replace(/<path\b[^>]*\/>/g, (element) => {
    const fill = element.match(/\sfill="([^"]+)"/)?.[1];
    const neutral = irisShades.get(fill);
    if (!neutral) {
      return element;
    }

    irisPaths.push(element.replace(`fill="${fill}"`, `fill="${neutral}"`));
    return '';
  });

  if (irisPaths.length !== irisShades.size) {
    throw new Error(`${artwork.name}: expected all three female iris shades`);
  }

  const irisName = `${artwork.name}Iris`;
  const outlineName = `${artwork.name}Outline`;
  const iris = artwork.svg
    .replace(/<path\b[^>]*\/>/g, '')
    .replace('</g>', `${irisPaths.join('')}</g>`);

  function layer(name, svg) {
    return {
      type: 'symbol',
      name,
      parts: [svg],
      frames: [[{ name: svg.name }]],
    };
  }

  return {
    type: 'symbol',
    name: artwork.name,
    original: artwork,
    parts: [
      layer(outlineName, { ...artwork, svg: outline }),
      layer(irisName, {
        ...artwork,
        name: irisName,
        svg: iris,
      }),
    ],
    // Foreground first: preserve the source whites and fine outline strokes
    // over the colored fills. Each layer retains the original vector origin.
    frames: [[{ name: outlineName }, { name: irisName, colorIdx: '_col3' }]],
  };
}

module.exports = { colorableEye };
