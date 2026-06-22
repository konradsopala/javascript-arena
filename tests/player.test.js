'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Player = require('../src/game/player');

test('player starts at full health and energy', () => {
  const p = new Player('Ada');
  assert.strictEqual(p.health, 100);
  assert.strictEqual(p.energy, 50);
  assert.strictEqual(p.alive, true);
  assert.strictEqual(p.score, 0);
});

test('takeDamage clamps at zero and flips alive', () => {
  const p = new Player('Ada');
  const applied = p.takeDamage(120);
  assert.strictEqual(applied, 100);
  assert.strictEqual(p.health, 0);
  assert.strictEqual(p.alive, false);
});

test('takeDamage rejects negative amounts', () => {
  const p = new Player('Ada');
  assert.throws(() => p.takeDamage(-1), RangeError);
});

test('heal never exceeds max health', () => {
  const p = new Player('Ada');
  p.takeDamage(30);
  const healed = p.heal(100);
  assert.strictEqual(healed, 30);
  assert.strictEqual(p.health, 100);
});

test('spendEnergy fails when too expensive', () => {
  const p = new Player('Ada');
  assert.strictEqual(p.spendEnergy(40), true);
  assert.strictEqual(p.spendEnergy(40), false);
  assert.strictEqual(p.energy, 10);
});

test('regenEnergy clamps to max', () => {
  const p = new Player('Ada');
  p.spendEnergy(20);
  p.regenEnergy(100);
  assert.strictEqual(p.energy, 50);
});

test('recordMove tracks moves and score', () => {
  const p = new Player('Ada');
  p.recordMove('jab', 1);
  p.recordMove('heavy', 3);
  assert.strictEqual(p.score, 4);
  assert.strictEqual(p.movesPlayed.length, 2);
});

test('toJSON exposes a stable shape', () => {
  const p = new Player('Ada');
  const json = p.toJSON();
  assert.deepStrictEqual(Object.keys(json).sort(), [
    'alive', 'energy', 'health', 'id', 'maxEnergy', 'maxHealth', 'movesPlayed', 'name', 'score',
  ]);
});
