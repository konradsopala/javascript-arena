'use strict';

const { sendError } = require('./respond');

/**
 * A minimal pattern-matching router for the bare `http` server. Routes are
 * registered with a method and a path template that may contain `:param`
 * segments, e.g. `/arenas/:arenaId/players`.
 */
class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Register a route.
   *
   * @param {string} method HTTP method
   * @param {string} pattern path template with optional :params
   * @param {Function} handler async (req, res, params) handler
   */
  register(method, pattern, handler) {
    const segments = pattern.split('/').filter(Boolean);
    this.routes.push({ method: method.toUpperCase(), segments, handler });
  }

  get(pattern, handler) {
    this.register('GET', pattern, handler);
  }

  post(pattern, handler) {
    this.register('POST', pattern, handler);
  }

  del(pattern, handler) {
    this.register('DELETE', pattern, handler);
  }

  /**
   * Try to match a method/path pair against the registered routes.
   *
   * @param {string} method request method
   * @param {string} pathname request path
   * @returns {{handler: Function, params: object}|null} match or null
   */
  match(method, pathname) {
    const parts = pathname.split('/').filter(Boolean);

    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) {
        continue;
      }
      if (route.segments.length !== parts.length) {
        continue;
      }

      const params = {};
      let matched = true;
      for (let i = 0; i < route.segments.length; i += 1) {
        const seg = route.segments[i];
        if (seg.startsWith(':')) {
          params[seg.slice(1)] = decodeURIComponent(parts[i]);
        } else if (seg !== parts[i]) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { handler: route.handler, params };
      }
    }

    return null;
  }

  /**
   * Build a request listener that dispatches to the matched handler and
   * translates thrown errors into JSON responses.
   *
   * @returns {Function} an (req, res) listener
   */
  toListener() {
    return async (req, res) => {
      const url = new URL(req.url, 'http://localhost');
      const found = this.match(req.method, url.pathname);

      if (!found) {
        sendError(res, 404, 'Not found');
        return;
      }

      try {
        await found.handler(req, res, found.params, url);
      } catch (err) {
        const status = err.statusCode || 500;
        sendError(res, status, err.message || 'Internal error', err.field ? { field: err.field } : {});
      }
    };
  }
}

module.exports = Router;
