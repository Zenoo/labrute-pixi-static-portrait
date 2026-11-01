import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  defaultColorString,
  isBodyString,
  isColorString,
  readBodyString,
  readColorString,
  writeBodyString,
} from './appearanceStrings.mjs';

test('body strings retain hexadecimal selectors in the production slot order', () => {
  const body = '0123456789a';
  const parts = readBodyString(body);

  assert.equal(isBodyString(body), true);
  assert.deepEqual(parts, {
    p1: 0,
    p1a: 1,
    p1b: 2,
    p2: 3,
    p3: 4,
    p4: 5,
    p5: 6,
    p6: 7,
    p7: 8,
    p7b: 9,
    p8: 10,
  });
  assert.equal(writeBodyString(parts), body);
  assert.equal(readBodyString('ABCDEF01234').p1, 10);
  assert.equal(isBodyString('0123'), false);
  assert.equal(isBodyString('0123456789z'), false);
});

test('color strings use the fighter palette, gender-specific colors, and special indexes', () => {
  const encoded = '00010203040506070809101112131415';
  const male = readColorString('male', encoded);
  const female = readColorString('female', encoded);

  assert.equal(male.col0, '#996600');
  assert.equal(male.col0a, '#eccd57');
  assert.equal(female.col0a, '#f8cdc2');
  assert.equal(male.col1, '#4f677d');
  assert.equal(female.col1, '#8e63ad');
  assert.equal(male.col3, '#b85f1d');
  assert.equal(male.col4b, '#d5eaff');

  for (const gender of ['male', 'female']) {
    assert.equal(isColorString(defaultColorString(gender)), true);
    assert.ok(
      Object.values(readColorString(gender, '99'.repeat(16))).every((color) => color === '#000000'),
    );
    assert.ok(
      Object.values(readColorString(gender, '98'.repeat(16))).every((color) => color === '#ffffff'),
    );
  }

  assert.equal(isColorString('00'.repeat(15)), false);
  assert.equal(isColorString('aa'.repeat(16)), false);
});
