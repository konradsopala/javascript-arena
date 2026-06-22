# JavaScript Arena

A small playground service where players submit moves and battle in short arena
matches. This repository is intentionally simple at the core and grows feature
by feature.

## Getting started

```bash
npm install
npm start
```

The server listens on the port defined in [`src/config.js`](src/config.js).

## Project layout

```
src/
  config.js     # central configuration (ports, limits, feature flags)
  server.js     # HTTP entry point
```

## Status

Early stage. Core configuration and the HTTP entry point are in place; gameplay
and the REST API are added in follow-up changes.
