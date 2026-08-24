'use strict';

const config = require('../config');
const { prefixedId } = require('../utils/ids');
const Player = require('./player');
const Match = require('./match');

/**
 * An arena is a lobby that gathers players and spins up matches between them.
 * It enforces the configured capacity and keeps a simple leaderboard derived
 * from completed matches.
 */
class Arena {
  /**
   * @param {string} name human-readable arena name
   * @param {{capacity?: number}} [opts] arena options
   */
  constructor(name, opts = {}) {
    this.id = prefixedId('arena');
    this.name = name;
    this.capacity = opts.capacity ?? config.maxPlayersPerArena;
    this.players = new Map();
    this.matches = [];
    this.createdAt = Date.now();
  }

  /**
   * Whether the arena has room for another player.
   *
   * @returns {boolean} true when not full
   */
  hasRoom() {
    return this.players.size < this.capacity;
  }

  /**
   * Add a new player to the arena.
   *
   * @param {string} name player display name
   * @returns {import('./player')} the created player
   */
  addPlayer(name) {
    if (!this.hasRoom()) {
      throw new Error('arena is full');
    }
    const player = new Player(name);
    this.players.set(player.id, player);
    return player;
  }

  /**
   * Remove a player by id.
   *
   * @param {string} playerId id of the player to remove
   * @returns {boolean} whether a player was removed
   */
  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  /**
   * Look up a player by id.
   *
   * @param {string} playerId id of the player
   * @returns {import('./player')|undefined} the player, if present
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Start a match between two registered players.
   *
   * @param {string} idA id of the first player
   * @param {string} idB id of the second player
   * @returns {import('./match')} the created match
   */
  startMatch(idA, idB) {
    const a = this.getPlayer(idA);
    const b = this.getPlayer(idB);
    if (!a || !b) {
      throw new Error('both players must belong to the arena');
    }
    if (a.id === b.id) {
      throw new Error('a player cannot fight themselves');
    }
    const match = new Match(a, b);
    this.matches.push(match);
    return match;
  }

  /**
   * Build a leaderboard sorted by score then remaining health.
   *
   * @returns {Array<object>} ranked player snapshots
   */
  leaderboard() {
    return [...this.players.values()]
      .map((p) => p.toJSON())
      .sort((x, y) => y.score - x.score || y.health - x.health);
  }

  /**
   * Serializable view of the arena.
   *
   * @returns {object} arena snapshot
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      capacity: this.capacity,
      playerCount: this.players.size,
      matchCount: this.matches.length,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Arena;
