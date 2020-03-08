import pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';

export const migration001 = (client: pgPromise.IDatabase<{}, pg.IClient>) =>
    client.query(`

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

CREATE TABLE cran.package (
    package_name TEXT UNIQUE,
    version TEXT NOT NULL,
    date_publication TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE INDEX package__package_name_trigram_index
    ON cran.package
    USING gin (package_name gin_trgm_ops);

CREATE TABLE cran.author (
    package_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    CONSTRAINT author__pk UNIQUE (package_name, name)
);

CREATE TABLE cran.maintainer (
    package_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    CONSTRAINT maintainer__pk UNIQUE (package_name, name)
);

COMMIT;
    `);
