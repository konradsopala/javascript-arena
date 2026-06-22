'use strict';

const Arena = require('./game/arena');

/**
 * In-memory store for arenas. A real deployment would back this with a
 * database, but for the playground an in-process Map keeps things simple while
 * exposing the same interface the routes depend on.
 */
class ArenaStore {
  constructor() {
    this.arenas = new Map();
  }

  /**
   * Create and register a new arena.
   *
   * @param {string} name arena name
   * @param {object} [opts] arena options
   * @returns {import('./game/arena')} the created arena
   */
  createArena(name, opts) {
    const arena = new Arena(name, opts);
    this.arenas.set(arena.id, arena);
    return arena;
  }

  /**
   * Fetch an arena by id.
   *
   * @param {string} id arena id
   * @returns {import('./game/arena')|undefined} the arena, if present
   */
  getArena(id) {
    return this.arenas.get(id);
  }

  /**
   * List all arenas as snapshots.
   *
   * @returns {Array<object>} arena snapshots
   */
  listArenas() {
    return [...this.arenas.values()].map((a) => a.toJSON());
  }

  /**
   * Delete an arena by id.
   *
   * @param {string} id arena id
   * @returns {boolean} whether an arena was removed
   */
  deleteArena(id) {
    return this.arenas.delete(id);
  }

  /**
   * Remove every arena. Mainly useful in tests.
   */
  clear() {
    this.arenas.clear();
  }
}

// A shared singleton store used by the route handlers.
const store = new ArenaStore();

module.exports = { ArenaStore, store };
