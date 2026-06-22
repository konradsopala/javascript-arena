'use strict';

/**
 * Helpers for writing JSON responses and reading JSON request bodies on top of
 * the bare Node `http` module.
 */

/**
 * Write a JSON response with the given status code.
 *
 * @param {import('http').ServerResponse} res response object
 * @param {number} statusCode HTTP status code
 * @param {*} payload JSON-serializable payload
 */
function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * Write a JSON error response in a consistent shape.
 *
 * @param {import('http').ServerResponse} res response object
 * @param {number} statusCode HTTP status code
 * @param {string} message human-readable error message
 * @param {object} [extra] additional fields to include
 */
function sendError(res, statusCode, message, extra = {}) {
  sendJson(res, statusCode, { error: message, ...extra });
}

/**
 * Read and parse a JSON request body, rejecting bodies that exceed a size cap.
 *
 * @param {import('http').IncomingMessage} req request object
 * @param {{limit?: number}} [opts] options
 * @returns {Promise<object>} the parsed body (empty object when no body)
 */
function readJson(req, opts = {}) {
  const limit = opts.limit ?? 1_000_000;
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (err) {
        reject(Object.assign(new Error('invalid JSON body'), { statusCode: 400 }));
      }
    });

    req.on('error', reject);
  });
}

module.exports = { sendJson, sendError, readJson };
