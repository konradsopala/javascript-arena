'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Arena = require('../src/game/arena');

test('arena enforces capacity', () => {
  const arena = new Arena('Pit', { capacity: 2 });
  arena.addPlayer('Ada');
  arena.addPlayer('Linus');
  assert.strictEqual(arena.hasRoom(), false);
  assert.throws(() => arena.addPlayer('Grace'), /full/);
});

test('arena can remove players', () => {
  const arena = new Arena('Pit', { capacity: 4 });
  const p = arena.addPlayer('Ada');
  assert.strictEqual(arena.removePlayer(p.id), true);
  assert.strictEqual(arena.removePlayer(p.id), false);
});

test('startMatch requires two distinct registered players', () => {
  const arena = new Arena('Pit');
  const a = arena.addPlayer('Ada');
  assert.throws(() => arena.startMatch(a.id, a.id), /themselves/);
  assert.throws(() => arena.startMatch(a.id, 'nope'), /belong/);
});

test('leaderboard sorts by score then health', () => {
  const arena = new Arena('Pit');
  const a = arena.addPlayer('Ada');
  const b = arena.addPlayer('Linus');
  a.recordMove('heavy', 3);
  b.recordMove('jab', 1);
  const board = arena.leaderboard();
  assert.strictEqual(board[0].name, 'Ada');
});
