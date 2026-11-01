const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { readSwf } = require('../scripts/swf/reader.cjs');
const { restoreStrokeWidths } = require('../scripts/swf/artwork.cjs');
const { makeReference } = require('../scripts/swf/reference.cjs');
const data = require('../dist/symbol-data.cjs');
const source = fs.readFileSync('src/swf/perso.swf');
const swf = readSwf(source);
test('generated timelines preserve every source frame, depth order, selectors, empty frames, and masks', () => {
  for (const [id, timeline] of swf.sprites) {
    const generated = data[`Symbol${id}`];
    assert.ok(generated, `Symbol${id}`);
    assert.equal(generated.frames.length, timeline.frames.length);
    timeline.frames.forEach((frame, i) => {
      assert.deepEqual(
        generated.frames[i].map((p) => p.name),
        frame
          .slice()
          .reverse()
          .map((p) => `Symbol${p.characterId}`),
      );
      frame
        .slice()
        .reverse()
        .forEach((p, j) => {
          const output = generated.frames[i][j];
          if (p.instanceName?.startsWith('_p')) {
            assert.equal(output.partIdx, p.instanceName);
          }

          if (p.instanceName?.startsWith('_col')) {
            assert.equal(output.colorIdx, p.instanceName);
          }
        });
    });
  }

  assert.equal(data.Symbol460.frames.length, 70);
  assert.equal(data.Symbol752.frames.length, 64);
  const mask = swf.sprites.get(57).frames[0].find((p) => p.characterId === 45);
  assert.equal(mask.clipDepth, 8);
  assert.equal(mask.depth, 5);
});
test('iris enhancement preserves original whites and outlines and binds only verified iris shapes to col3', () => {
  for (const id of [337, 344]) {
    const eye = data[`Symbol${id}`];
    assert.ok(eye.original.svg.includes('#00ffff'));
    const iris = eye.parts.find((p) => p.name.endsWith('Iris'));
    assert.equal(eye.frames[0].find((p) => p.name === iris.name).colorIdx, '_col3');
    assert.ok(!iris.parts[0].svg.includes('#fbfbfb'));
    assert.ok(eye.parts[0].parts[0].svg.includes('#fbfbfb'));
  }
});
test('FFDec thin stroke metadata is restored before raster minimum', () => {
  assert.equal(
    restoreStrokeWidths('<path stroke-width="1" ffdec:original-stroke-width="0.05"/>'),
    '<path stroke-width="0.05" ffdec:original-stroke-width="0.05"/>',
  );
});
test('frozen references preserve vector records and explicitly select initial internal frames', () => {
  for (const symbolId of [460, 752]) {
    const buffer = makeReference(source, {
      symbolId,
      frame: 0,
      parts: Object.fromEntries(
        ['p1', 'p1a', 'p1b', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p7b', 'p8'].map((p) => [p, 0]),
      ),
      width: 640,
      height: 640,
      scale: 3,
    });
    const ref = readSwf(buffer);
    assert.equal(ref.shapes.size, swf.shapes.size);
    for (const [id, shape] of swf.shapes) {
      assert.deepEqual(ref.shapes.get(id).data, shape.data);
    }

    assert.ok([...ref.sprites.values()].every((s) => s.frames.length === 1));
  }
});
