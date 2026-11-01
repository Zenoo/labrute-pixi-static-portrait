/** Emit readable TypeScript while sharing repeated placements and held frames. */
function emitSymbol(symbol) {
  const references = new Map();
  const reference = (name) => {
    const token = `__SWF_REFERENCE_${references.size}__`;
    references.set(token, name);
    return token;
  };
  const serialize = (value) =>
    JSON.stringify(value, null, 2).replace(/"(__SWF_REFERENCE_\d+__)"/g, (_, token) =>
      references.get(token),
    );
  const placements = new Map();
  const frames = new Map();

  // Count structurally identical records before assigning shared local constants.
  for (const frame of symbol.frames) {
    const frameKey = JSON.stringify(frame);
    const repeatedFrame = frames.get(frameKey);
    if (repeatedFrame) {
      repeatedFrame.count++;
    } else {
      frames.set(frameKey, { value: frame, count: 1 });
    }

    for (const part of frame) {
      const key = JSON.stringify(part);
      const repeated = placements.get(key);
      if (repeated) {
        repeated.count++;
      } else {
        placements.set(key, { value: part, count: 1 });
      }
    }
  }

  const declarations = [];
  let index = 0;

  // Repeated placement objects and held frames retain identity in the emitted graph.
  for (const [key, part] of placements) {
    if (part.count > 1 && key.length > 40) {
      const name = `placement${index++}`;
      declarations.push(`const ${name}: FramePart = ${serialize(part.value)};`);
      part.reference = reference(name);
    }
  }

  const frameValue = (frame) =>
    frame.map((part) => {
      const entry = placements.get(JSON.stringify(part));
      return entry.reference ?? part;
    });
  index = 0;

  for (const [key, frame] of frames) {
    if (frame.count > 1) {
      const name = `frame${index++}`;
      declarations.push(`const ${name}: FramePart[] = ${serialize(frameValue(frame.value))};`);
      frame.reference = reference(name);
    }
  }

  // Generated enhancement layers can be self-contained inline definitions;
  // source timeline references still import their shared top-level symbols.
  const isReference = (part) => part.type === 'symbol' && !part.frames;
  const dependencies = symbol.parts.filter(isReference);
  const result = {
    ...symbol,
    parts: symbol.parts.map((part) => (isReference(part) ? reference(part.name) : part)),
    frames: symbol.frames.map(
      (frame) => frames.get(JSON.stringify(frame)).reference ?? frameValue(frame),
    ),
  };
  const imports = dependencies.map((part) => `import { ${part.name} } from './${part.name}';`);

  return (
    '// Generated from perso.swf by npm run export:swf.\n' +
    `import type { ${declarations.length ? 'FramePart, ' : ''}Symbol } from '../common';\n` +
    imports.join('\n') +
    '\n\n' +
    (declarations.length ? declarations.join('\n\n') + '\n\n' : '') +
    `export const ${symbol.name}: Symbol = ${serialize(result)};\n`
  );
}

module.exports = { emitSymbol };
