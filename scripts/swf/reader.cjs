const { inflateSync } = require('node:zlib');

// SWF stores matrices and color transforms as signed, variable-width bit fields.
// Keep the original bytes as well as decoded values: the comparison player can
// then render the original Flash records without reconstructing their geometry.
class Bits {
  constructor(buffer, offset = 0) {
    this.buffer = buffer;
    this.position = offset * 8;
  }

  unsigned(width) {
    let value = 0;

    for (let index = 0; index < width; index++) {
      const byte = this.buffer[this.position >> 3];
      value = value * 2 + ((byte >> (7 - (this.position % 8))) & 1);
      this.position++;
    }

    return value;
  }

  signed(width) {
    const value = this.unsigned(width);
    return width && value >= 2 ** (width - 1) ? value - 2 ** width : value;
  }

  get offset() {
    return Math.ceil(this.position / 8);
  }
}

function readMatrix(buffer, offset) {
  const bits = new Bits(buffer, offset);
  const matrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: 0,
    ty: 0,
  };

  if (bits.unsigned(1)) {
    const width = bits.unsigned(5);
    matrix.a = bits.signed(width) / 65536;
    matrix.d = bits.signed(width) / 65536;
  }

  if (bits.unsigned(1)) {
    const width = bits.unsigned(5);
    matrix.b = bits.signed(width) / 65536;
    matrix.c = bits.signed(width) / 65536;
  }

  const width = bits.unsigned(5);
  matrix.tx = bits.signed(width) / 20;
  matrix.ty = bits.signed(width) / 20;

  return {
    value: matrix,
    bytes: buffer.subarray(offset, bits.offset),
    end: bits.offset,
  };
}

function readColor(buffer, offset) {
  const bits = new Bits(buffer, offset);
  const hasAdd = bits.unsigned(1);
  const hasMultiply = bits.unsigned(1);
  const width = bits.unsigned(4);
  const multiply = hasMultiply
    ? Array.from({ length: 4 }, () => bits.signed(width) / 256)
    : [1, 1, 1, 1];
  const add = hasAdd ? Array.from({ length: 4 }, () => bits.signed(width)) : [0, 0, 0, 0];

  return {
    value: { multiply, add },
    bytes: buffer.subarray(offset, bits.offset),
    end: bits.offset,
  };
}

function readTags(buffer, start = 0, end = buffer.length) {
  const tags = [];
  let offset = start;

  while (offset + 2 <= end) {
    const header = buffer.readUInt16LE(offset);
    offset += 2;
    let length = header & 63;

    if (length === 63) {
      length = buffer.readUInt32LE(offset);
      offset += 4;
    }

    if (offset + length > end) {
      throw new Error('Truncated SWF tag');
    }

    const code = header >> 6;
    tags.push({ code, data: buffer.subarray(offset, offset + length) });
    offset += length;

    if (code === 0) {
      break;
    }
  }

  return tags;
}

function readPlacement(tag) {
  const { data, code } = tag;
  const flags = data[0];
  const flags2 = code === 70 ? data[1] : 0;
  let offset = code === 70 ? 2 : 1;
  const result = { depth: data.readUInt16LE(offset), move: Boolean(flags & 1) };
  offset += 2;

  if (flags2 & 8 || (flags2 & 16 && flags & 2)) {
    const end = data.indexOf(0, offset);
    result.className = data.toString('utf8', offset, end);
    offset = end + 1;
  }

  if (flags & 2) {
    result.characterId = data.readUInt16LE(offset);
    offset += 2;
  }

  if (flags & 4) {
    const matrix = readMatrix(data, offset);
    result.matrix = matrix.value;
    result.matrixBytes = matrix.bytes;
    offset = matrix.end;
  }

  if (flags & 8) {
    const color = readColor(data, offset);
    result.color = color.value;
    result.colorBytes = color.bytes;
    offset = color.end;
  }

  if (flags & 16) {
    result.ratio = data.readUInt16LE(offset);
    offset += 2;
  }

  if (flags & 32) {
    const end = data.indexOf(0, offset);
    result.instanceName = data.toString('utf8', offset, end);
    offset = end + 1;
  }

  if (flags & 64) {
    result.clipDepth = data.readUInt16LE(offset);
    offset += 2;
  }

  if (flags2 & 1) {
    const start = offset;
    const count = data[offset++];
    result.filters = [];

    for (let index = 0; index < count; index++) {
      const type = data[offset++];
      const filter = {};

      if (type === 6) {
        result.filters.push({
          type: 'colorMatrix',
          matrix: Array.from({ length: 20 }, (_, entry) => data.readFloatLE(offset + entry * 4)),
        });
        offset += 80;
        continue;
      }

      if (type === 2) {
        filter.type = 'glow';
        filter.color = [...data.subarray(offset, offset + 4)];
        offset += 4;
      } else if (type === 1) {
        filter.type = 'blur';
      } else {
        throw new Error(`Unsupported SWF filter ${type}`);
      }

      filter.blurX = data.readUInt32LE(offset) / 65536;
      filter.blurY = data.readUInt32LE(offset + 4) / 65536;
      offset += 8;

      if (type === 2) {
        filter.strength = data.readUInt16LE(offset) / 256;
        offset += 2;
      }

      filter.flags = data[offset++];
      result.filters.push(filter);
    }

    result.filterBytes = data.subarray(start, offset);
  }

  if (flags2 & 2) {
    result.blendMode = data[offset++];

    // Flash's 'layer' mode isolates a group but otherwise composites normally.
    if (![0, 1, 2, 8].includes(result.blendMode)) {
      throw new Error(`Unsupported blend mode ${result.blendMode}`);
    }
  }

  return result;
}

function readTimeline(tags, frameCount) {
  const displayList = new Map();
  const frames = [];
  const labels = {};
  const labelJumps = [];

  for (const tag of tags) {
    if (tag.code === 26 || tag.code === 70) {
      const placement = readPlacement(tag);
      const previous = placement.move ? displayList.get(placement.depth) : undefined;
      const state = { ...previous, ...placement };

      if (state.characterId === undefined) {
        throw new Error('Move without a placed character');
      }

      displayList.set(placement.depth, state);
    } else if (tag.code === 28) {
      displayList.delete(tag.data.readUInt16LE(0));
    } else if (tag.code === 5) {
      displayList.delete(tag.data.readUInt16LE(2));
    } else if (tag.code === 43) {
      labels[tag.data.toString('utf8').replace(/\0.*$/s, '')] = frames.length;
    } else if (tag.code === 12) {
      // Retain the source loop boundary without interpreting arbitrary AVM1.
      // In particular, male monk jumps to 'loop' before five unreachable frames.
      let offset = 0;

      while (offset < tag.data.length) {
        const action = tag.data[offset++];
        const length = action >= 128 ? tag.data.readUInt16LE(offset) : 0;
        if (action >= 128) {
          offset += 2;
        }

        if (action === 140) {
          labelJumps.push({
            frame: frames.length,
            label: tag.data.toString('utf8', offset, offset + length).replace(/\0.*$/s, ''),
          });
        }

        offset += length;
        if (action === 0) {
          break;
        }
      }
    } else if (tag.code === 1) {
      // Snapshot state at ShowFrame, including empty and repeated frames.
      frames.push([...displayList.values()].sort((left, right) => left.depth - right.depth));
    }
  }

  if (frames.length !== frameCount) {
    throw new Error(`Expected ${frameCount} frames, found ${frames.length}`);
  }

  const loopEnd = labelJumps.find(
    (jump) => jump.label === 'loop' && labels.loop !== undefined,
  )?.frame;
  return {
    frames,
    labels,
    loopEnd,
  };
}

function readSwf(input) {
  const signature = input.toString('ascii', 0, 3);

  if (!['FWS', 'CWS'].includes(signature)) {
    throw new Error(`Unsupported SWF signature: ${signature}`);
  }

  const buffer =
    signature === 'CWS'
      ? Buffer.concat([input.subarray(0, 8), inflateSync(input.subarray(8))])
      : input;
  const rectangle = new Bits(buffer, 8);
  const width = rectangle.unsigned(5);
  const bounds = Array.from({ length: 4 }, () => rectangle.signed(width) / 20);
  const tags = readTags(buffer, rectangle.offset + 4);
  const sprites = new Map();
  const shapes = new Map();

  for (const tag of tags) {
    if (tag.code === 39) {
      const id = tag.data.readUInt16LE(0);
      const frameCount = tag.data.readUInt16LE(2);
      sprites.set(id, { id, ...readTimeline(readTags(tag.data, 4), frameCount) });
    } else if ([2, 22, 32, 83].includes(tag.code)) {
      shapes.set(tag.data.readUInt16LE(0), tag);
    }
  }

  return {
    version: buffer[3],
    bounds,
    tags,
    sprites,
    shapes,
  };
}

module.exports = {
  Bits,
  readSwf,
  readTags,
  readTimeline,
  readPlacement,
};
