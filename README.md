# Prelude

This document contains the instructions. For other documentation, refer to the other documents in `doc/`.

# Instructions

This is on a NPM/Yarn/TypeScript tech stack. Clone and run yarn .

The app can be run in 4 separate steps:

0. Clone the repo, run `yarn install`. Install Docker if required. Install NPM and Yarn if required.

1. Start the PostgreSQL service
2. Initialize the DB (database) schema.
3. Download data from CRAN (this might take 5 to 15 minutes) and upload it into the DB.
4. Start the web-server.

Then access it via http://localhost:4000/search?q=abc

- PostgreSQL start (also initializes the DB schema): `./run.sh db-up`
- PostgreSQL down: `./run.sh db-down`
- Download data: `./run.sh data-init-10` (use ctrl+C to interrupt) or `./run.sh data-init-50`
- Start server: `./run.sh serve` (use ctrl+C to stop)

To cleanup (also clears the database, the database Docker volume is not persisted)

- Cleanup: `./run.sh cleanup` - This removes all containers and project-specific docker images from local.


## Instructions - Start the PostgreSQL Service


This requires Docker. Note that:

- The password is hardcoded in the source code, and the default postgres user will be used, ignoring security concerns.
- The exposed port is for a non-Docker process to connect to the DB (e.g. when running the server outside of docker). 
- The network is for other Docker processes, like a Docker psql or pgAdmin.

Alternatively, run a fresh PostgreSQL instance and expose it at localhost:13000.

## Instructions - Initialize the DB

To initialize the DB (do only once), run

    npx ts-node ./src/dbInit

Which will do the initial setup. There is no migration logic coded in as this is a one-off app. Running this twice might cause an error (it will be idempotent, but the code might return an error, or not).

## Instructions - Download Data from CRAN

To download data from CRAN and load it into the DB, run

    npx ts-node ./src/dataInit

The number of packages downloaded is 50 by default, but can be set by the environment variable

    PACKAGE_COUNT_LIMIT=20 npx ts-node ./src/dataInit

It is convenient to use a low package count to speed up the download.

For 50 packages, it took between 8 to 20 minutes. It might also fail randomly due to network failures (common in my experience) and corrupt data (very rare).

## Instructions - Start the Server

To start the server, run

    npx ts-node ./src/server

which will start the server at localhost:4000.

The server can be queried at http://localhost:4000/search?q=Bayesian .

