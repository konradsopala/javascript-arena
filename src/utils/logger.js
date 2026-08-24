'use strict';

const config = require('../config');

/**
 * A tiny leveled logger that writes structured JSON lines to stdout/stderr.
 * It deliberately avoids external dependencies so the arena stays lightweight.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function shouldLog(level) {
  const threshold = LEVELS[config.logLevel] || LEVELS.info;
  return LEVELS[level] >= threshold;
}

function emit(level, message, meta) {
  if (!shouldLog(level)) {
    return;
  }

  const record = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta && typeof meta === 'object' ? meta : {}),
  };

  const line = JSON.stringify(record);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

module.exports = {
  debug: (message, meta) => emit('debug', message, meta),
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};
