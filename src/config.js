'use strict';

/**
 * Central configuration for the JavaScript Arena service.
 *
 * Values can be overridden through environment variables so the same build can
 * run in different environments without code changes.
 */
const config = {
  // Network
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',

  // Gameplay limits
  maxPlayersPerArena: 4,
  maxRoundsPerMatch: 6,
  turnTimeoutMs: 3000,

  // Feature flags
  features: {
    spectatorMode: false,
    rankedMatches: false,
    quickMatch: true,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
