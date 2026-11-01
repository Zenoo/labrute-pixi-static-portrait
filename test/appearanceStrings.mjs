// Playground-only palette decoding, matching labrute-pixi-fighter/test/utils.ts.
// Body selectors are hexadecimal; color indexes are two decimal digits per slot.

/** Default palette selections used by the fighter playground. */
export function defaultColorString(gender) {
  return gender === 'female'
    ? '01010103030303030701021915180706'
    : '03030301010101010803151401191418';
}

export function isBodyString(value) {
  return /^[\da-f]{11}$/i.test(value);
}

export function isColorString(value) {
  return /^\d{32}$/.test(value);
}

/** Keep the import field synchronized when individual body selectors change. */
export function writeBodyString(parts) {
  return [
    parts.p1,
    parts.p1a,
    parts.p1b,
    parts.p2,
    parts.p3,
    parts.p4,
    parts.p5,
    parts.p6,
    parts.p7,
    parts.p7b,
    parts.p8,
  ]
    .map((value) => value.toString(16))
    .join('');
}

const colors = {
  male: {
    skin: ['#996600', '#eccd57', '#cb841b', '#d79b75', '#fbe6c8', '#f8d198'],
    hair: [
      '#784129',
      '#fff9ae',
      '#b85f1d',
      '#4f677d',
      '#df7e37',
      '#fbcd15',
      '#ffaa1e',
      '#952f04',
      '#a2886f',
      '#fff2df',
    ],
    clothing: [
      '#7bad30',
      '#b78104',
      '#bb1111',
      '#559399',
      '#fae31f',
      '#784129',
      '#7a73c8',
      '#fff9ae',
      '#f0dc99',
      '#b6e7a9',
      '#d31818',
      '#b85f1d',
      '#97cbff',
      '#8ba3d7',
      '#df7e37',
      '#d5eaff',
      '#ffaa1e',
      '#cbff97',
      '#ffcc79',
      '#fff2df',
    ],
  },
  female: {
    skin: ['#996600', '#f8cdc2', '#cb841b', '#eaaca6', '#fbe6c8', '#f8d198'],
    hair: [
      '#fff9ae',
      '#b85f1d',
      '#eea2c9',
      '#8e63ad',
      '#fbcd15',
      '#ffaa1e',
      '#952f04',
      '#a2886f',
      '#fff2df',
    ],
    clothing: [
      '#7bad30',
      '#b78104',
      '#bb1111',
      '#559399',
      '#fae31f',
      '#784129',
      '#7a73c8',
      '#fff9ae',
      '#f0dc99',
      '#b6e7a9',
      '#d31818',
      '#b85f1d',
      '#97cbff',
      '#8ba3d7',
      '#df7e37',
      '#d5eaff',
      '#ffaa1e',
      '#cbff97',
      '#ffcc79',
      '#fff2df',
    ],
  },
  special: ['#000000'],
};
export const getColor = (gender, part, color) => {
  const skinParts = ['col0', 'col0a', 'col0c'];
  const hairParts = ['col1', 'col1a', 'col1b', 'col1c', 'col1d'];
  const clothingParts = ['col2', 'col2a', 'col2b', 'col3', 'col3b', 'col4', 'col4a', 'col4b'];
  let colorArray = [];
  if (skinParts.includes(part)) {
    colorArray = colors[gender].skin;
  } else if (hairParts.includes(part)) {
    colorArray = colors[gender].hair;
  } else if (clothingParts.includes(part)) {
    colorArray = colors[gender].clothing;
  }

  const normalColor = colorArray[color];
  if (normalColor) {
    return normalColor;
  }

  return colors.special[99 - color] || '#ffffff';
};
export const readBodyString = (bodyString) => ({
  p1: parseInt(bodyString[0] || '0', 16),
  p1a: parseInt(bodyString[1] || '0', 16),
  p1b: parseInt(bodyString[2] || '0', 16),
  p2: parseInt(bodyString[3] || '0', 16),
  p3: parseInt(bodyString[4] || '0', 16),
  p4: parseInt(bodyString[5] || '0', 16),
  p5: parseInt(bodyString[6] || '0', 16),
  p6: parseInt(bodyString[7] || '0', 16),
  p7: parseInt(bodyString[8] || '0', 16),
  p7b: parseInt(bodyString[9] || '0', 16),
  p8: parseInt(bodyString[10] || '0', 16),
});
export const readColorString = (gender, colorsString) => ({
  col0: getColor(gender, 'col0', +colorsString.slice(0, 2)),
  col0a: getColor(gender, 'col0a', +colorsString.slice(2, 4)),
  col0c: getColor(gender, 'col0c', +colorsString.slice(4, 6)),
  col1: getColor(gender, 'col1', +colorsString.slice(6, 8)),
  col1a: getColor(gender, 'col1a', +colorsString.slice(8, 10)),
  col1b: getColor(gender, 'col1b', +colorsString.slice(10, 12)),
  col1c: getColor(gender, 'col1c', +colorsString.slice(12, 14)),
  col1d: getColor(gender, 'col1d', +colorsString.slice(14, 16)),
  col2: getColor(gender, 'col2', +colorsString.slice(16, 18)),
  col2a: getColor(gender, 'col2a', +colorsString.slice(18, 20)),
  col2b: getColor(gender, 'col2b', +colorsString.slice(20, 22)),
  col3: getColor(gender, 'col3', +colorsString.slice(22, 24)),
  col3b: getColor(gender, 'col3b', +colorsString.slice(24, 26)),
  col4: getColor(gender, 'col4', +colorsString.slice(26, 28)),
  col4a: getColor(gender, 'col4a', +colorsString.slice(28, 30)),
  col4b: getColor(gender, 'col4b', +colorsString.slice(30, 32)),
});
