import pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';

export const migration001 = async (client: pgPromise.IDatabase<{}, pg.IClient>) => {
    console.log(`Running migration 001 - Initial setup`);
    await client.query(`

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE SCHEMA IF NOT EXISTS cran;

BEGIN;

CREATE TABLE cran.migrations (
    version INTEGER,
    timestamp TIMESTAMP NOT NULL,
    description TEXT
);

INSERT INTO cran.migrations (version, timestamp, description)
    VALUES (1, NOW(), 'Initial setup');

-- Only requires Package and Version. This is because there are some non-conforming packages
-- like ABHgenotypeR@1.0.1, where the streaming HTTP API has a typo in the Date/Publication field name.
-- Thus, the data model was relaxed to allow null where possible. Typos will become a null.

CREATE TABLE cran.package (
    package_name TEXT UNIQUE,
    version TEXT NOT NULL,
    date_publication TEXT,
    title TEXT,
    description TEXT
);

CREATE INDEX package__package_name_trigram_index
    ON cran.package
    USING gin (package_name gin_trgm_ops);

CREATE TABLE cran.author (
    package_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT
    -- Relaxed UNIQUE (package_name, name) constraint because of parsing problems in
    -- some R/CRAN packages like abn@2.2, where due to a different format, there are
    -- multiple person-names like ")", causing duplicates.
    -- The parsing might have been "fixed" (made more complex to handle the case)
    -- but the constraint is relaxed to avoid future issues. "Bug tolerance".
    -- CONSTRAINT author__pk UNIQUE (package_name, name)
);

CREATE TABLE cran.maintainer (
    package_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    CONSTRAINT maintainer__pk UNIQUE (package_name, name)
);

COMMIT;
    `);
};