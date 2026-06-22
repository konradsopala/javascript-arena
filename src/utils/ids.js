'use strict';

const crypto = require('crypto');

/**
 * Small collection of identifier helpers. The arena needs short, URL-safe ids
 * for arenas, matches and players that are unlikely to collide within a single
 * process lifetime.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random id of the given length using a URL-safe alphabet.
 *
 * @param {number} [length=8] desired length of the id
 * @returns {string} random id
 */
function randomId(length = 8) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new TypeError('length must be a positive integer');
  }

  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * Generate a prefixed id, e.g. `arena_3f9a2b`.
 *
 * @param {string} prefix short namespace prefix
 * @param {number} [length=6] length of the random portion
 * @returns {string} prefixed id
 */
function prefixedId(prefix, length = 6) {
  if (typeof prefix !== 'string' || prefix.length === 0) {
    throw new TypeError('prefix must be a non-empty string');
  }
  return `${prefix}_${randomId(length)}`;
}

/**
 * Deterministic id derived from an input string. Useful for idempotent
 * operations where the same input should map to the same id.
 *
 * @param {string} input source string
 * @returns {string} 12 character hex digest
 */
function hashId(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex').slice(0, 12);
}

module.exports = { randomId, prefixedId, hashId };
