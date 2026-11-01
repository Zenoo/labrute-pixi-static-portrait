const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
test('genuine CJS and ESM entries share data and use consumer Pixi identities', async () => {
  const cjs = require('labrute-pixi-static-portrait');
  const esm = await import('labrute-pixi-static-portrait');
  assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort());
  assert.equal(cjs.Symbol460, esm.Symbol460);
  assert.ok(fs.readFileSync('dist/Symbols.mjs', 'utf8').includes("from 'pixi.js'"));
  assert.ok(fs.readFileSync('dist/Symbols.js', 'utf8').includes("require('pixi.js')"));
  assert.ok(!fs.readFileSync('dist/symbol-data.cjs', 'utf8').includes('pixi.js'));
});
test('NodeNext CJS and ESM consumers resolve format-specific declarations', () => {
  const directory = path.resolve('.validation/types');
  fs.mkdirSync(directory, { recursive: true });
  const example = `import { BruteDisplay, PortraitAppearance, Symbol460 } from 'labrute-pixi-static-portrait';
import { Renderer } from 'pixi.js';

declare const renderer: Renderer;
declare const appearance: PortraitAppearance;

const display = new BruteDisplay({ renderer, ...appearance });
const ready: Promise<void> = display.ready;

display.setColors(appearance.colors, 'col3');
display.destroy();
console.log(Symbol460, ready);
`;
  for (const extension of ['cts', 'mts']) {
    fs.writeFileSync(path.join(directory, `consumer.${extension}`), example);
  }

  execFileSync(
    process.execPath,
    [
      'node_modules/typescript/bin/tsc',
      '--noEmit',
      '--skipLibCheck',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2020',
      path.join(directory, 'consumer.cts'),
      path.join(directory, 'consumer.mts'),
    ],
    { stdio: 'pipe' },
  );
});
test('publish manifest allows one data file and preserves version and repository history', () => {
  const p = require('../package.json');
  assert.equal(p.name, 'labrute-pixi-static-portrait');
  assert.match(p.version, /^\d+\.\d+\.\d+$/);
  assert.ok(fs.readFileSync('CHANGELOG.md', 'utf8').includes('[1.0.6]'));
  assert.equal(p.repository.url, 'git+https://github.com/Zenoo/labrute-pixi-static-portrait.git');
  assert.equal(p.files.filter((name) => name.includes('symbol-data')).length, 1);
  assert.equal(p.exports['.'].import.types, './dist/Symbols.d.mts');
  assert.equal(p.exports['.'].require.types, './dist/Symbols.d.cts');
});
test('npm pack contains exactly the public entries, one dataset, and release documentation', () => {
  const npm =
    process.env.npm_execpath ||
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const output = execFileSync(
    process.execPath,
    [npm, 'pack', '--dry-run', '--json', '--ignore-scripts', '--cache', '.npm-cache'],
    { encoding: 'utf8' },
  );
  const pack = JSON.parse(output)[0];
  const expected = [...require('../package.json').files, 'README.md', 'package.json'].sort();
  assert.deepEqual(pack.files.map((file) => file.path).sort(), expected);
  assert.ok(pack.size < 500000);
  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync(
    'docs/pack-results.json',
    JSON.stringify(
      {
        size: pack.size,
        unpackedSize: pack.unpackedSize,
        files: pack.files,
      },
      null,
      2,
    ) + '\n',
  );
});
