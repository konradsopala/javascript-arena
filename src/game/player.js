'use strict';

const { prefixedId } = require('../utils/ids');

/**
 * Represents a single combatant in an arena match. Players track their own
 * health, energy and a running score, and expose a handful of methods the
 * match engine uses to mutate that state in a controlled way.
 */
class Player {
  /**
   * @param {string} name display name of the player
   * @param {{health?: number, energy?: number}} [opts] starting stats
   */
  constructor(name, opts = {}) {
    this.id = prefixedId('player');
    this.name = name;
    this.maxHealth = opts.health ?? 100;
    this.health = this.maxHealth;
    this.maxEnergy = opts.energy ?? 50;
    this.energy = this.maxEnergy;
    this.score = 0;
    this.alive = true;
    this.movesPlayed = [];
  }

  /**
   * Apply incoming damage, clamping health at zero and flipping `alive`.
   *
   * @param {number} amount non-negative damage amount
   * @returns {number} the actual damage applied
   */
  takeDamage(amount) {
    if (amount < 0) {
      throw new RangeError('damage cannot be negative');
    }
    const applied = Math.min(this.health, amount);
    this.health -= applied;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
    return applied;
  }

  /**
   * Restore health without exceeding the player's maximum.
   *
   * @param {number} amount non-negative heal amount
   * @returns {number} the actual amount healed
   */
  heal(amount) {
    if (amount < 0) {
      throw new RangeError('heal cannot be negative');
    }
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health - before;
  }

  /**
   * Attempt to spend energy. Returns false when the player cannot afford it.
   *
   * @param {number} amount energy cost
   * @returns {boolean} whether the energy was spent
   */
  spendEnergy(amount) {
    if (amount < 0) {
      throw new RangeError('energy cost cannot be negative');
    }
    if (this.energy < amount) {
      return false;
    }
    this.energy -= amount;
    return true;
  }

  /**
   * Regenerate energy between rounds, clamped to the maximum.
   *
   * @param {number} amount energy to add
   */
  regenEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  /**
   * Record a move for later inspection and award score.
   *
   * @param {string} move move name
   * @param {number} [points=0] score to add
   */
  recordMove(move, points = 0) {
    this.movesPlayed.push(move);
    this.score += points;
  }

  /**
   * Produce a plain snapshot suitable for JSON serialization.
   *
   * @returns {object} serializable view of the player
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      health: this.health,
      maxHealth: this.maxHealth,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      score: this.score,
      alive: this.alive,
      movesPlayed: this.movesPlayed.length,
    };
  }
}

module.exports = Player;
