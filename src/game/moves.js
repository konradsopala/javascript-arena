'use strict';

/**
 * Catalogue of moves a player can make during a turn. Each move declares its
 * energy cost and a `resolve` function that mutates the attacker and defender.
 * Keeping moves data-driven makes it easy to add new ones without touching the
 * match engine.
 */

/**
 * @typedef {Object} MoveResult
 * @property {string} move name of the move
 * @property {number} damage damage dealt to the defender
 * @property {number} healed health recovered by the attacker
 * @property {boolean} affordable whether the attacker could pay the cost
 */

const MOVES = {
  jab: {
    cost: 5,
    points: 1,
    resolve(attacker, defender) {
      const damage = defender.takeDamage(8);
      return { move: 'jab', damage, healed: 0 };
    },
  },
  heavy: {
    cost: 15,
    points: 3,
    resolve(attacker, defender) {
      const damage = defender.takeDamage(22);
      return { move: 'heavy', damage, healed: 0 };
    },
  },
  guard: {
    cost: 4,
    points: 1,
    resolve(attacker) {
      const healed = attacker.heal(6);
      return { move: 'guard', damage: 0, healed };
    },
  },
  focus: {
    cost: 0,
    points: 0,
    resolve(attacker) {
      attacker.regenEnergy(12);
      return { move: 'focus', damage: 0, healed: 0 };
    },
  },
};

/**
 * List the names of every registered move.
 *
 * @returns {string[]} move names
 */
function listMoves() {
  return Object.keys(MOVES);
}

/**
 * Look up a move definition by name.
 *
 * @param {string} name move name
 * @returns {object|undefined} the move definition, if present
 */
function getMove(name) {
  return MOVES[name];
}

/**
 * Execute a move on behalf of an attacker against a defender, charging energy.
 *
 * @param {string} name move name
 * @param {import('./player')} attacker the acting player
 * @param {import('./player')} defender the target player
 * @returns {MoveResult} structured result of the move
 */
function applyMove(name, attacker, defender) {
  const move = getMove(name);
  if (!move) {
    throw new Error(`unknown move: ${name}`);
  }

  if (!attacker.spendEnergy(move.cost)) {
    return { move: name, damage: 0, healed: 0, affordable: false };
  }

  const result = move.resolve(attacker, defender);
  attacker.recordMove(name, move.points);
  return { ...result, affordable: true };
}

module.exports = { MOVES, listMoves, getMove, applyMove };
