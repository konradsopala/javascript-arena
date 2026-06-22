'use strict';

const http = require('http');
const config = require('./config');

/**
 * Minimal HTTP entry point. Real routing is layered on in later changes; for
 * now the server answers a single health check so deployments have something
 * to probe.
 */
function createServer() {
  return http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', version: require('../package.json').version }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(config.port, config.host, () => {
    // eslint-disable-next-line no-console
    console.log(`Arena listening on http://${config.host}:${config.port}`);
  });
}

module.exports = { createServer };
