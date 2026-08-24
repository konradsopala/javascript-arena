'use strict';

/**
 * Lightweight validation helpers used by the route handlers. Each validator
 * throws a `ValidationError` so the HTTP layer can translate it into a 400.
 */

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

/**
 * Assert that a value is a non-empty string within an optional length bound.
 *
 * @param {*} value candidate value
 * @param {string} field field name for error reporting
 * @param {{min?: number, max?: number}} [opts] length bounds
 * @returns {string} the trimmed string
 */
function requireString(value, field, opts = {}) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }
  const trimmed = value.trim();
  const min = opts.min ?? 1;
  const max = opts.max ?? 256;
  if (trimmed.length < min) {
    throw new ValidationError(`${field} must be at least ${min} characters`, field);
  }
  if (trimmed.length > max) {
    throw new ValidationError(`${field} must be at most ${max} characters`, field);
  }
  return trimmed;
}

/**
 * Assert that a value is an integer within an optional range.
 *
 * @param {*} value candidate value
 * @param {string} field field name for error reporting
 * @param {{min?: number, max?: number}} [opts] range bounds
 * @returns {number} the validated integer
 */
function requireInt(value, field, opts = {}) {
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${field} must be an integer`, field);
  }
  if (opts.min !== undefined && num < opts.min) {
    throw new ValidationError(`${field} must be >= ${opts.min}`, field);
  }
  if (opts.max !== undefined && num > opts.max) {
    throw new ValidationError(`${field} must be <= ${opts.max}`, field);
  }
  return num;
}

/**
 * Assert that a value is one of an allowed set.
 *
 * @param {*} value candidate value
 * @param {string} field field name for error reporting
 * @param {Array<*>} allowed allowed values
 * @returns {*} the validated value
 */
function requireOneOf(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw new ValidationError(`${field} must be one of: ${allowed.join(', ')}`, field);
  }
  return value;
}

module.exports = { ValidationError, requireString, requireInt, requireOneOf };
