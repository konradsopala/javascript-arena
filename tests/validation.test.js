'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { requireString, requireInt, requireOneOf, ValidationError } = require('../src/utils/validation');

test('requireString trims and enforces bounds', () => {
  assert.strictEqual(requireString('  hi  ', 'name', { min: 2 }), 'hi');
  assert.throws(() => requireString('a', 'name', { min: 2 }), ValidationError);
  assert.throws(() => requireString(42, 'name'), ValidationError);
});

test('requireInt enforces range', () => {
  assert.strictEqual(requireInt('5', 'n', { min: 1, max: 10 }), 5);
  assert.throws(() => requireInt(0, 'n', { min: 1 }), ValidationError);
  assert.throws(() => requireInt(1.5, 'n'), ValidationError);
});

test('requireOneOf restricts to an allowed set', () => {
  assert.strictEqual(requireOneOf('jab', 'move', ['jab', 'heavy']), 'jab');
  assert.throws(() => requireOneOf('zap', 'move', ['jab', 'heavy']), ValidationError);
});

test('ValidationError carries a 400 status and field', () => {
  try {
    requireString('', 'name');
  } catch (err) {
    assert.strictEqual(err.statusCode, 400);
    assert.strictEqual(err.field, 'name');
  }
});
