'use strict';

const { store } = require('../store');
const { sendJson, sendError, readJson } = require('../http/respond');
const { requireString, requireInt } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Route handlers for arena lifecycle and membership. These are wired into the
 * router in `src/routes/index.js`.
 */

/**
 * POST /arenas — create a new arena.
 */
async function createArena(req, res) {
  const body = await readJson(req);
  const name = requireString(body.name, 'name', { min: 3, max: 64 });
  const capacity = body.capacity === undefined
    ? undefined
    : requireInt(body.capacity, 'capacity', { min: 2, max: 64 });

  const arena = store.createArena(name, capacity ? { capacity } : undefined);
  logger.info('arena created', { arenaId: arena.id, name });
  sendJson(res, 201, arena.toJSON());
}

/**
 * GET /arenas — list all arenas.
 */
async function listArenas(req, res) {
  sendJson(res, 200, { arenas: store.listArenas() });
}

/**
 * GET /arenas/:arenaId — fetch a single arena with its leaderboard.
 */
async function getArena(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }
  sendJson(res, 200, { ...arena.toJSON(), leaderboard: arena.leaderboard() });
}

/**
 * DELETE /arenas/:arenaId — remove an arena.
 */
async function deleteArena(req, res, params) {
  const removed = store.deleteArena(params.arenaId);
  if (!removed) {
    sendError(res, 404, 'arena not found');
    return;
  }
  logger.info('arena deleted', { arenaId: params.arenaId });
  sendJson(res, 200, { deleted: true });
}

/**
 * POST /arenas/:arenaId/players — add a player to an arena.
 */
async function addPlayer(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }

  const body = await readJson(req);
  const name = requireString(body.name, 'name', { min: 2, max: 32 });

  try {
    const player = arena.addPlayer(name);
    logger.info('player joined', { arenaId: arena.id, playerId: player.id });
    sendJson(res, 201, player.toJSON());
  } catch (err) {
    sendError(res, 409, err.message);
  }
}

/**
 * DELETE /arenas/:arenaId/players/:playerId — remove a player.
 */
async function removePlayer(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }
  const removed = arena.removePlayer(params.playerId);
  if (!removed) {
    sendError(res, 404, 'player not found');
    return;
  }
  sendJson(res, 200, { deleted: true });
}

module.exports = {
  createArena,
  listArenas,
  getArena,
  deleteArena,
  addPlayer,
  removePlayer,
};
