# JavaScript Arena

A small playground service where players join arenas and battle in short,
turn-based matches. The core stays dependency-free — everything runs on Node's
built-in `http` module.

## Getting started

```bash
npm install   # no runtime dependencies, but keeps lockfile honest
npm start
```

The server listens on the port defined in [`src/config.js`](src/config.js).

## Running the tests

```bash
npm test
```

Tests use the built-in `node:test` runner.

## Concepts

- **Arena** — a lobby that holds players up to a configured capacity and tracks
  the matches played within it.
- **Player** — a combatant with health, energy and a running score.
- **Match** — a turn-based duel between two players, resolved round by round.
- **Move** — a data-driven action (`jab`, `heavy`, `guard`, `focus`) with an
  energy cost and an effect.

## HTTP API

| Method | Path                                              | Description                |
| ------ | ------------------------------------------------- | -------------------------- |
| GET    | `/health`                                         | Liveness probe             |
| GET    | `/moves`                                          | List available moves       |
| POST   | `/arenas`                                          | Create an arena            |
| GET    | `/arenas`                                          | List arenas                |
| GET    | `/arenas/:arenaId`                                 | Arena + leaderboard        |
| DELETE | `/arenas/:arenaId`                                 | Delete an arena            |
| POST   | `/arenas/:arenaId/players`                         | Add a player               |
| DELETE | `/arenas/:arenaId/players/:playerId`               | Remove a player            |
| POST   | `/arenas/:arenaId/matches`                         | Start a match              |
| GET    | `/arenas/:arenaId/matches/:matchId`               | Match snapshot             |
| POST   | `/arenas/:arenaId/matches/:matchId/rounds`        | Play a round               |

### Example

```bash
# Create an arena
curl -s -X POST localhost:3000/arenas -d '{"name":"The Pit"}'

# Add two players, then start and play a match using the returned ids.
```

## Project layout

```
src/
  config.js          # central configuration
  server.js          # HTTP entry point
  store.js           # in-memory arena store
  http/
    router.js        # tiny pattern-matching router
    respond.js       # JSON request/response helpers
  routes/
    index.js         # route wiring
    arenas.js        # arena + membership handlers
    matches.js       # match + round handlers
  game/
    arena.js         # arena lobby
    player.js        # combatant
    match.js         # duel engine
    moves.js         # move catalogue
  utils/
    ids.js           # id generation
    logger.js        # structured logging
    validation.js    # request validation
tests/               # node:test suites
```
