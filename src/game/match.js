'use strict';

const config = require('../config');
const { prefixedId } = require('../utils/ids');
const { applyMove, listMoves } = require('./moves');

/**
 * Drives a turn-based duel between two players. The match collects moves for a
 * round, resolves them in order, regenerates a little energy, and continues
 * until one player falls or the round cap is reached.
 */
class Match {
  /**
   * @param {import('./player')} playerA first combatant
   * @param {import('./player')} playerB second combatant
   * @param {{maxRounds?: number}} [opts] match options
   */
  constructor(playerA, playerB, opts = {}) {
    this.id = prefixedId('match');
    this.players = [playerA, playerB];
    this.maxRounds = opts.maxRounds ?? config.maxRoundsPerMatch;
    this.round = 0;
    this.history = [];
    this.finished = false;
    this.winner = null;
  }

  /**
   * Whether the match has reached a terminal state.
   *
   * @returns {boolean} true when finished
   */
  isOver() {
    if (this.finished) {
      return true;
    }
    const alive = this.players.filter((p) => p.alive);
    return alive.length <= 1 || this.round >= this.maxRounds;
  }

  /**
   * Resolve a single round given each player's chosen move.
   *
   * @param {string} moveA move chosen by player A
   * @param {string} moveB move chosen by player B
   * @returns {object} a summary of the round
   */
  playRound(moveA, moveB) {
    if (this.isOver()) {
      throw new Error('match is already over');
    }

    this.round += 1;
    const [a, b] = this.players;

    const resultA = applyMove(moveA, a, b);
    const resultB = b.alive ? applyMove(moveB, b, a) : { move: moveB, damage: 0, healed: 0, affordable: false };

    a.regenEnergy(5);
    b.regenEnergy(5);

    const summary = {
      round: this.round,
      moves: {
        [a.id]: resultA,
        [b.id]: resultB,
      },
      health: {
        [a.id]: a.health,
        [b.id]: b.health,
      },
    };

    this.history.push(summary);

    if (this.isOver()) {
      this.finalize();
    }

    return summary;
  }

  /**
   * Compute the winner and lock the match. Ties are broken by score, then by
   * remaining health.
   */
  finalize() {
    this.finished = true;
    const [a, b] = this.players;

    if (a.alive && !b.alive) {
      this.winner = a.id;
    } else if (b.alive && !a.alive) {
      this.winner = b.id;
    } else if (a.score !== b.score) {
      this.winner = a.score > b.score ? a.id : b.id;
    } else if (a.health !== b.health) {
      this.winner = a.health > b.health ? a.id : b.id;
    } else {
      this.winner = null; // genuine draw
    }
  }

  /**
   * Pick a legal move for a player at random — used to simulate opponents.
   *
   * @returns {string} a random move name
   */
  static randomMove() {
    const moves = listMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Serializable view of the match suitable for an API response.
   *
   * @returns {object} match snapshot
   */
  toJSON() {
    return {
      id: this.id,
      round: this.round,
      maxRounds: this.maxRounds,
      finished: this.finished,
      winner: this.winner,
      players: this.players.map((p) => p.toJSON()),
      history: this.history,
    };
  }
}

module.exports = Match;
