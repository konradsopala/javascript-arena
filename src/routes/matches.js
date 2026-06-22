'use strict';

const { store } = require('../store');
const { sendJson, sendError, readJson } = require('../http/respond');
const { requireString } = require('../utils/validation');
const { listMoves } = require('../game/moves');
const Match = require('../game/match');
const logger = require('../utils/logger');

/**
 * Route handlers for starting matches and submitting rounds. A match is held
 * on the arena it belongs to; we locate it by scanning the arena's match list.
 */

function findMatch(arena, matchId) {
  return arena.matches.find((m) => m.id === matchId);
}

/**
 * GET /moves — list the available moves.
 */
async function listAvailableMoves(req, res) {
  sendJson(res, 200, { moves: listMoves() });
}

/**
 * POST /arenas/:arenaId/matches — start a match between two players.
 */
async function startMatch(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }

  const body = await readJson(req);
  const playerA = requireString(body.playerA, 'playerA');
  const playerB = requireString(body.playerB, 'playerB');

  try {
    const match = arena.startMatch(playerA, playerB);
    logger.info('match started', { arenaId: arena.id, matchId: match.id });
    sendJson(res, 201, match.toJSON());
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

/**
 * GET /arenas/:arenaId/matches/:matchId — fetch a match snapshot.
 */
async function getMatch(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }
  const match = findMatch(arena, params.matchId);
  if (!match) {
    sendError(res, 404, 'match not found');
    return;
  }
  sendJson(res, 200, match.toJSON());
}

/**
 * POST /arenas/:arenaId/matches/:matchId/rounds — play a round.
 *
 * The body may specify `moveA` and `moveB`; any missing move is chosen at
 * random so a single human can spar against the engine.
 */
async function playRound(req, res, params) {
  const arena = store.getArena(params.arenaId);
  if (!arena) {
    sendError(res, 404, 'arena not found');
    return;
  }
  const match = findMatch(arena, params.matchId);
  if (!match) {
    sendError(res, 404, 'match not found');
    return;
  }

  const body = await readJson(req);
  const moveA = body.moveA || Match.randomMove();
  const moveB = body.moveB || Match.randomMove();

  try {
    const summary = match.playRound(moveA, moveB);
    sendJson(res, 200, { summary, finished: match.finished, winner: match.winner });
  } catch (err) {
    sendError(res, 409, err.message);
  }
}

module.exports = {
  listAvailableMoves,
  startMatch,
  getMatch,
  playRound,
};
