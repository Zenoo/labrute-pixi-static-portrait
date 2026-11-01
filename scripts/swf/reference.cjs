const { readSwf } = require('./reader.cjs');

// A source snapshot is a tiny, single-frame SWF. It keeps the original shape
// records, matrices, color transforms, filters, and mask depths. Ruffle renders
// those Flash records directly; it never sees our generated SVGs or Pixi data.
// ActionScript is deliberately excluded so a selected pose stays deterministic.
class BitWriter {
  bits = [];

  write(value, width) {
    const unsigned = value < 0 ? value + 2 ** width : value;

    for (let shift = width - 1; shift >= 0; shift--) {
      this.bits.push(Math.floor(unsigned / 2 ** shift) % 2);
    }
  }

  buffer() {
    const output = Buffer.alloc(Math.ceil(this.bits.length / 8));
    this.bits.forEach((bit, index) => {
      output[index >> 3] |= bit << (7 - (index % 8));
    });
    return output;
  }
}

function signedWidth(values) {
  return Math.max(1, ...values.map((value) => Math.ceil(Math.log2(Math.abs(value) + 1)) + 1));
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function tag(code, bytes = Buffer.alloc(0)) {
  if (bytes.length < 63) {
    return Buffer.concat([uint16((code << 6) | bytes.length), bytes]);
  }

  const length = Buffer.alloc(4);
  length.writeUInt32LE(bytes.length);
  return Buffer.concat([uint16((code << 6) | 63), length, bytes]);
}

function encodeMatrix({ a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0 }) {
  const bits = new BitWriter();

  for (const [enabled, values] of [
    [a !== 1 || d !== 1, [Math.round(a * 65536), Math.round(d * 65536)]],
    [b !== 0 || c !== 0, [Math.round(b * 65536), Math.round(c * 65536)]],
  ]) {
    bits.write(Number(enabled), 1);

    if (enabled) {
      const width = signedWidth(values);
      bits.write(width, 5);
      values.forEach((value) => bits.write(value, width));
    }
  }

  const translation = [Math.round(tx * 20), Math.round(ty * 20)];
  const width = signedWidth(translation);
  bits.write(width, 5);
  translation.forEach((value) => bits.write(value, width));
  return bits.buffer();
}

function encodeColor({ multiply, add }) {
  const bits = new BitWriter();
  const values = [...multiply.map((value) => Math.round(value * 256)), ...add];
  const width = signedWidth(values);
  bits.write(1, 1);
  bits.write(1, 1);
  bits.write(width, 4);
  values.forEach((value) => bits.write(value, width));
  return bits.buffer();
}

function place(characterId, state) {
  const hasEffects = Boolean(state.filterBytes || state.blendMode);
  let flags = 2 | 4;

  if (state.colorBytes) {
    flags |= 8;
  }

  if (state.clipDepth) {
    flags |= 64;
  }

  const fields = [
    hasEffects
      ? Buffer.from([flags, (state.filterBytes ? 1 : 0) | (state.blendMode ? 2 : 0)])
      : Buffer.from([flags]),
    uint16(state.depth),
    uint16(characterId),
    state.matrixBytes ?? encodeMatrix(state.matrix ?? {}),
  ];

  if (state.colorBytes) {
    fields.push(state.colorBytes);
  }

  if (state.clipDepth) {
    fields.push(uint16(state.clipDepth));
  }

  if (state.filterBytes) {
    fields.push(state.filterBytes);
  }

  if (state.blendMode) {
    fields.push(Buffer.from([state.blendMode]));
  }

  return tag(hasEffects ? 70 : 26, Buffer.concat(fields));
}

function makeReference(input, options) {
  const swf = readSwf(input);
  const {
    symbolId,
    frame = 0,
    parts = {},
    colors = {},
    width = 640,
    height = 800,
    scale = 3,
  } = options;

  if (![460, 752].includes(symbolId)) {
    throw new Error('Unknown static portrait root');
  }

  if (!Number.isInteger(frame) || frame !== 0) {
    throw new Error('Frame is outside the source timeline');
  }

  const definitions = [];
  let nextId = Math.max(...swf.sprites.keys(), ...swf.shapes.keys()) + 1;

  function snapshot(id, selectedFrame, ancestry = []) {
    if (ancestry.includes(id)) {
      throw new Error('Recursive source sprite');
    }

    if (!swf.sprites.has(id)) {
      return id;
    }

    const timeline = swf.sprites.get(id);
    const placements = timeline.frames[selectedFrame] ?? [];
    const records = [];

    for (const original of placements) {
      const state = { ...original };
      const name = state.instanceName ?? '';
      let childFrame = 0;
      const childCount = swf.sprites.get(state.characterId)?.frames.length ?? 1;

      if (name.startsWith('_p')) {
        const value = parts[name.slice(1)];

        if (!Number.isInteger(value) || value < 0) {
          throw new Error(`Invalid source selector ${name}`);
        }

        childFrame = value % childCount;
      }

      // Match resolved appearance colors without running the SWF's unrelated
      // palette decoder (the application uses a different encoded format).
      const customColor = name.startsWith('_col') ? colors[name.slice(1)] : undefined;
      if (customColor) {
        const rgb = parseInt(customColor.replace('#', ''), 16);
        state.colorBytes = encodeColor({
          multiply: [1, 1, 1, 1],
          add: [((rgb >> 16) & 255) - 255, ((rgb >> 8) & 255) - 255, (rgb & 255) - 255, 0],
        });
      }

      const child = snapshot(state.characterId, childFrame, [...ancestry, id]);
      records.push(place(child, state));
    }

    const cloneId = nextId++;

    if (cloneId > 65535) {
      throw new Error('Source snapshot exceeds SWF character limits');
    }

    definitions.push(
      tag(39, Buffer.concat([uint16(cloneId), uint16(1), ...records, tag(1), tag(0)])),
    );
    return cloneId;
  }

  const root = snapshot(symbolId, frame);
  const rect = new BitWriter();
  const rectangle = [0, width * 20, 0, height * 20];
  const rectWidth = signedWidth(rectangle);
  rect.write(rectWidth, 5);
  rectangle.forEach((value) => rect.write(value, rectWidth));
  const facing = options.facing === 'right' ? -1 : 1;
  const readyMessage = Buffer.from(`source-ready:${symbolId}:${frame}\0`, 'utf8');
  const readyAction = Buffer.concat([
    Buffer.from([7, 150]),
    uint16(readyMessage.length + 1),
    Buffer.from([0]),
    readyMessage,
    Buffer.from([38, 0]),
  ]);
  const body = Buffer.concat([
    rect.buffer(),
    uint16(30 * 256),
    uint16(1),
    // Original vector shapes, static text, and its font remain byte-for-byte intact.
    ...swf.tags
      .filter((entry) => [2, 22, 32, 83, 11, 33, 10, 48, 75, 73, 88].includes(entry.code))
      .map((entry) => tag(entry.code, entry.data)),
    ...definitions,
    place(root, {
      depth: 1,
      matrix: {
        a: scale * facing,
        d: scale,
        tx: options.originX ?? width / 2 - 45 * scale * facing,
        ty: options.originY ?? 20,
      },
    }),
    tag(12, readyAction), // Stop, then signal that the source pose was initialized.
    tag(1),
    tag(0),
  ]);
  const header = Buffer.alloc(8);
  header.write('FWS');
  header[3] = swf.version;
  header.writeUInt32LE(body.length + 8, 4);
  return Buffer.concat([header, body]);
}

module.exports = {
  makeReference,
  encodeMatrix,
  encodeColor,
  tag,
};
