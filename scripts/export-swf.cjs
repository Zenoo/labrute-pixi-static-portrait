const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { readSwf } = require('./swf/reader.cjs');
const { restoreStrokeWidths, compactSvg } = require('./swf/artwork.cjs');
const { compactTransform, compactColor, compactFilters } = require('./swf/compact.cjs');
const { emitSymbol } = require('./swf/emit.cjs');
const { colorableEye } = require('./swf/eyeColors.cjs');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/swf/perso.swf');
const jar = process.env.FFDEC_JAR || path.join(root, '.tools/ffdec/ffdec.jar');
const jarSha256 = '80f8ced0bfde98b434c28e9807e91fe5558255b2f712051a0e65221519bd392a';
const exportDirectory = path.join(root, '.tools/swf-export');
const artworkFiles = new Map();

// Avoid touching generated files when their content is unchanged.
function writeIfChanged(filename, contents) {
  if (fs.existsSync(filename) && fs.readFileSync(filename, 'utf8') === contents) {
    return;
  }

  fs.writeFileSync(filename, contents);
}

/** Preserve authored stroke widths and track the vector origin used by the renderer. */
function readArtwork(id, kind) {
  let svg = restoreStrokeWidths(
    fs.readFileSync(path.join(exportDirectory, kind, `${id}.svg`), 'utf8'),
  );
  artworkFiles.set(id, svg);
  const match = svg.match(/<g transform="matrix\(1\.0, 0\.0, 0\.0, 1\.0, ([^,]+), ([^)]+)\)">/);

  if (!match) {
    throw new Error(`Cannot determine the origin of SWF artwork ${id}`);
  }

  // Leave room for antialiasing outside the exported bounds. Do not change
  // authored strokes, scales, or colors with per-asset correction tables.
  const padding = 2;
  const x = Number(match[1]) + padding;
  const y = Number(match[2]) + padding;
  svg = svg.replace(
    /(width|height)="([\d.]+)px"/g,
    (_, axis, size) => `${axis}="${Number(size) + padding * 2}px"`,
  );
  svg = svg.replace(match[0], `<g transform="matrix(1.0, 0.0, 0.0, 1.0, ${x}, ${y})">`);

  return {
    type: 'svg',
    name: `Symbol${id}`,
    svg: compactSvg(svg),
    offset: { x, y },
  };
}

/** Bind selectors, colors, and clipping to placements rather than shared definitions. */
function convertPlacement(placement, frame) {
  const name = `Symbol${placement.characterId}`;
  const instanceName = placement.instanceName || '';
  const masks = frame.filter(
    (candidate) =>
      candidate.clipDepth &&
      placement.depth > candidate.depth &&
      placement.depth <= candidate.clipDepth,
  );

  if (masks.length > 1) {
    throw new Error('Nested timeline masks need explicit renderer support');
  }

  return {
    name,
    partIdx: instanceName.startsWith('_p') ? instanceName : undefined,
    colorIdx: instanceName.startsWith('_col') ? instanceName : undefined,
    transform: compactTransform(placement.matrix),
    colorTransform: compactColor(placement.color),
    filters: compactFilters(placement.filters),
    blendMode: placement.blendMode === 8 ? 'add' : undefined,
    maskedBy: masks[0]?.characterId,
    isMask: placement.clipDepth ? true : undefined,
  };
}

function generate() {
  if (!fs.existsSync(jar)) {
    throw new Error('Run npm run setup:swf first, or set FFDEC_JAR');
  }

  if (createHash('sha256').update(fs.readFileSync(jar)).digest('hex') !== jarSha256) {
    throw new Error('FFDec JAR checksum does not match the pinned release');
  }

  const input = fs.readFileSync(source);
  const swf = readSwf(input);

  // The source's gender wrapper is the authority for the two portrait root IDs.
  const portraitFrames = swf.sprites.get(753)?.frames;
  const roots = Object.fromEntries(
    ['male', 'female'].map((gender, index) => [
      gender,
      portraitFrames?.[index]?.find((part) => part.instanceName === 'sub')?.characterId,
    ]),
  );
  if (roots.male !== 460 || roots.female !== 752) {
    throw new Error('Static source root mappings changed');
  }

  fs.mkdirSync(exportDirectory, { recursive: true });

  // FFDec handles SWF vector edges, gradients, and static text. Timeline
  // extraction below reads the SWF itself; no intermediate FLA/XML is involved.
  const exportLog = execFileSync(
    'java',
    [
      '-Djava.awt.headless=true',
      '-jar',
      jar,
      '-format',
      'shape:svg,text:svg',
      '-export',
      'shape,text',
      exportDirectory,
      source,
    ],
    { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] },
  ).toString('utf8');

  if (!exportLog.includes('v.26.4.0')) {
    throw new Error('This generator requires FFDec 26.4.0');
  }

  const symbols = new Map();

  for (const [id] of swf.shapes) {
    const artwork = readArtwork(id, 'shapes');
    symbols.set(
      id,
      [337, 344].includes(id)
        ? colorableEye(artwork)
        : {
            type: 'symbol',
            name: `Symbol${id}`,
            parts: [artwork],
            frames: [[{ name: `Symbol${id}` }]],
          },
    );
  }

  for (const tag of swf.tags.filter((entry) => [11, 33].includes(entry.code))) {
    const id = tag.data.readUInt16LE(0);
    symbols.set(id, {
      type: 'symbol',
      name: `Symbol${id}`,
      parts: [readArtwork(id, 'texts')],
      frames: [[{ name: `Symbol${id}` }]],
    });
  }

  for (const [id, timeline] of swf.sprites) {
    const childIds = new Set(
      timeline.frames.flatMap((frame) => frame.map((part) => part.characterId)),
    );
    symbols.set(id, {
      type: 'symbol',
      name: `Symbol${id}`,
      parts: [...childIds].map((child) => ({ type: 'symbol', name: `Symbol${child}` })),
      // Pixi uses descending z-order; SWF display depths increase toward the viewer.
      frames: timeline.frames.map((frame) =>
        frame
          .slice()
          .reverse()
          .map((placement) => convertPlacement(placement, frame)),
      ),
      labels: Object.keys(timeline.labels).length ? timeline.labels : undefined,
      loopEnd: timeline.loopEnd,
    });
  }

  const ids = [...symbols.keys()].sort((left, right) => left - right);

  // Validate shared references and inline layers before replacing generated files.
  function validate(symbol) {
    for (const part of symbol.parts) {
      if (part.type !== 'symbol') {
        continue;
      }

      if (part.frames) {
        validate(part);
      } else if (!symbols.has(Number(part.name.slice(6)))) {
        throw new Error(`${symbol.name} references missing ${part.name}`);
      }
    }
  }

  for (const symbol of symbols.values()) {
    validate(symbol);
  }

  for (const directory of ['json', 'symbols']) {
    fs.mkdirSync(path.join(root, 'src', directory), { recursive: true });
  }

  for (const id of ids) {
    const symbol = symbols.get(id);
    const json = JSON.stringify(symbol, null, 2);

    writeIfChanged(path.join(root, `src/json/Symbol${id}.json`), `${json}\n`);
    writeIfChanged(path.join(root, `src/symbols/Symbol${id}.ts`), emitSymbol(symbol));
  }

  writeIfChanged(
    path.join(root, 'src/symbols/index.ts'),
    ids.map((id) => `export { Symbol${id} } from './Symbol${id}';`).join('\n') + '\n',
  );

  for (const [id, svg] of artworkFiles) {
    writeIfChanged(path.join(root, `src/svg/Symbol${id}.svg`), svg);
  }

  // Only generated Symbol<number> files in these fixed workspace directories
  // are eligible for cleanup when a later SWF removes a character.
  for (const [directory, extension, expected] of [
    ['json', 'json', new Set(ids)],
    ['symbols', 'ts', new Set(ids)],
    ['svg', 'svg', new Set(artworkFiles.keys())],
  ]) {
    const folder = path.join(root, 'src', directory);

    for (const filename of fs.readdirSync(folder)) {
      const match = filename.match(new RegExp(`^Symbol(\\d+)\\.${extension}$`));
      if (match && !expected.has(Number(match[1]))) {
        fs.unlinkSync(path.join(folder, filename));
      }
    }
  }

  // Record both source and tool hashes so changes can be reproduced and reviewed.
  const manifest = {
    source: 'src/swf/perso.swf',
    roots,
    irisShapes: [337, 344],
    mask45: {
      parent: 57,
      depth: 5,
      clipDepth: 8,
    },
    sha256: createHash('sha256').update(input).digest('hex'),
    exporter: 'FFDec 26.4.0',
    exporterJarSha256: jarSha256,
    generatorSha256: Object.fromEntries(
      [
        'scripts/export-swf.cjs',
        ...fs
          .readdirSync(path.join(root, 'scripts/swf'))
          .filter((file) => file.endsWith('.cjs'))
          .sort()
          .map((file) => `scripts/swf/${file}`),
      ].map((file) => [
        file,
        createHash('sha256')
          .update(fs.readFileSync(path.join(root, file)))
          .digest('hex'),
      ]),
    ),
    sprites: swf.sprites.size,
    shapes: swf.shapes.size,
    symbols: symbols.size,
    frameCounts: Object.fromEntries(
      [...swf.sprites].map(([id, timeline]) => [id, timeline.frames.length]),
    ),
  };
  writeIfChanged(
    path.join(root, 'src/swf/manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(
    `Generated ${symbols.size} symbols directly from ${manifest.source} (${manifest.sha256}).`,
  );
}

generate();
