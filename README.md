# next-departures

Playing around with [node-gtfs](https://github.com/BlinkTagInc/node-gtfs).
Have borrowed some code from there as well!

## Relevant commands as of 25-07-26

```bash
# Updates gtfs database or performs import of relevant data
gtfs-import --configPath config.json
# Starts our express api server
npm run dev
# Starts our vite web UI
npx vite
```

## Setup notes

### better-sqlite3 types

The following types package is required to mitigate console warning for `node-gtfs` & TypeScript
NOTE: This only happens when `strict` is `true` in `tsconfig.json`

```bash
npm i --save-dev @types/better-sqlite3
```

an example of the warning:

```bash
node_modules/gtfs/dist/index.d.ts:2:38 - error TS7016: Could not find a declaration file for module 'better-sqlite3'. '/Users/apw/code/node-gtfs-pg/node_modules/better-sqlite3/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/better-sqlite3` if it exists or add a new declaration (.d.ts) file containing `declare module 'better-sqlite3';`

2 import Database$1, { Database } from 'better-sqlite3';
```
