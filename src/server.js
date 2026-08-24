'use strict';

const http = require('http');
const config = require('./config');
const { buildRouter } = require('./routes');
const logger = require('./utils/logger');

/**
 * Build the HTTP server, dispatching every request through the application
 * router. The router owns matching, parameter extraction and error handling.
 *
 * @returns {import('http').Server} a configured (but not listening) server
 */
function createServer() {
  const router = buildRouter();
  const listener = router.toListener();
  return http.createServer(listener);
}

if (require.main === module) {
  const server = createServer();
  server.listen(config.port, config.host, () => {
    logger.info('arena listening', { host: config.host, port: config.port });
  });
}

module.exports = { createServer };
