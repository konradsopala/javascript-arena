'use strict';

const Router = require('../http/router');
const { sendJson } = require('../http/respond');
const arenas = require('./arenas');
const matches = require('./matches');

/**
 * Assemble the application router by registering every route. Keeping the wiring
 * in one place makes the surface area of the API easy to scan.
 *
 * @returns {import('../http/router')} the configured router
 */
function buildRouter() {
  const router = new Router();

  router.get('/health', async (req, res) => {
    sendJson(res, 200, { status: 'ok', version: require('../../package.json').version });
  });

  router.get('/moves', matches.listAvailableMoves);

  router.post('/arenas', arenas.createArena);
  router.get('/arenas', arenas.listArenas);
  router.get('/arenas/:arenaId', arenas.getArena);
  router.del('/arenas/:arenaId', arenas.deleteArena);

  router.post('/arenas/:arenaId/players', arenas.addPlayer);
  router.del('/arenas/:arenaId/players/:playerId', arenas.removePlayer);

  router.post('/arenas/:arenaId/matches', matches.startMatch);
  router.get('/arenas/:arenaId/matches/:matchId', matches.getMatch);
  router.post('/arenas/:arenaId/matches/:matchId/rounds', matches.playRound);

  return router;
}

module.exports = { buildRouter };
