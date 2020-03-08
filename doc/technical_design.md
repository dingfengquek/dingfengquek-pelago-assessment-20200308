# Prelude

This document tracks various notes about the technical design. It is not complete since this is only a technical assignment, and this document is only used to track the author's thoughts.

# Architecture

This system follows a 2-tier architecture:

- Database
- Web server

In addition, download the data from CRAN is started in a separate process, from the command line. This is because the process is slow and often flows, and is easier to manage separately.

There is a single process for every layer, with no load balancers, redundancy, failovers, etc., to keep things simple.

# Query Algorithm

There is a single API endpoint at `/search?q=ggplot2`, where `ggplot2` is the search query term.

The query is matched to the package name using trigram matching, where results above a similarity of 0.2 are returned (ordered by the highest similarity first). The trigram matching is implemented by PostgreSQL's pg_trgm extension.

Alternatives that were considered and rejected are:

- Substring match: Too hard to get the package names right.
- Dictionary words (stemming and etc.): The package names are not English words.
- Lucene or ElasticSearch: More troublesome to setup than PostgreSQL, and PostgreSQL is good enough. Also, trigram matching seems (with hindsight) much better for matching text that are full of acronyms and abbreviations.

# Tech Stack

- Database: PostgreSQL with pg_trgm extension
- Code and web server: Node.js, Yarn, and TypeScript
- Containerization: Docker (partial; still need the OS)
- OS: Runs on Mac OS X (Very likely to run on Debian and Ubuntu Linux too; Not sure about Windows)

# Git Workflow

Feature branches are used. More complex Git workflows (like fork and PRs) were avoided since it is only coded by a single person.

Conventions:

- Branches can and should clean up the commits before they are merged. Once merged, history should not be touched except in exceptional situations.
- Feature branches should be named `feature/<yyyymmdd>-<author>-<nn>-<label>`, where nn is an incrementing count . The author is omitted in this repository since there is only 1 author.
- Fix/Bugfix branches named similar to feature branches, but with `bugfix/...`.
- Merges should always include a commit and should not be fast-forwarded.

# Deployment

A manual deployment process is used. It currently uses Docker for the database, but not for the other script nor the server. With a little effort, Dockerfiles can be added for everything.

# Database

A relational database is used, although a document database would have worked as well. The choice of PostgreSQL is arbitrary among the mainstream relational databases (MariaDB/MySQL and MS SQL would have worked equally well).

For the database schema, refer to the migration files in `src/db/...`.
