'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Player = require('../src/game/player');
const Match = require('../src/game/match');

test('a match resolves a round and records history', () => {
  const a = new Player('Ada');
  const b = new Player('Linus');
  const match = new Match(a, b, { maxRounds: 5 });

  const summary = match.playRound('jab', 'jab');
  assert.strictEqual(summary.round, 1);
  assert.strictEqual(match.history.length, 1);
  assert.ok(summary.moves[a.id]);
  assert.ok(summary.moves[b.id]);
});

test('a match ends when a player dies', () => {
  const a = new Player('Ada', { health: 10 });
  const b = new Player('Linus', { health: 10 });
  const match = new Match(a, b, { maxRounds: 50 });

  // Heavy hits for 22, more than enough to drop a 10 hp player.
  while (!match.isOver()) {
    match.playRound('heavy', 'focus');
  }

  assert.strictEqual(match.finished, true);
  assert.strictEqual(match.winner, a.id);
});

test('a match stops at the round cap', () => {
  const a = new Player('Ada');
  const b = new Player('Linus');
  const match = new Match(a, b, { maxRounds: 2 });

  match.playRound('guard', 'guard');
  match.playRound('guard', 'guard');

  assert.strictEqual(match.isOver(), true);
  assert.strictEqual(match.round, 2);
});

test('playRound throws once the match is over', () => {
  const a = new Player('Ada');
  const b = new Player('Linus');
  const match = new Match(a, b, { maxRounds: 1 });

  match.playRound('jab', 'jab');
  assert.throws(() => match.playRound('jab', 'jab'), /over/);
});

test('randomMove returns a known move', () => {
  const moves = require('../src/game/moves').listMoves();
  for (let i = 0; i < 20; i += 1) {
    assert.ok(moves.includes(Match.randomMove()));
  }
});
