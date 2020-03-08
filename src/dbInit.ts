// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e 
// It assumes a fresh postgres installation so that the migration
// will work. No checks are made for whether the database has
// completed the initial setup.

import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';

const pgp = pgPromise();

import { migration001 } from './db/migrations/migration001';

// ---
// ---


(async () => {

    const db: pgPromise.IDatabase<{}, pg.IClient> = pgp({
        host: 'localhost',
        port: 13000,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    });

    // @todo: Redo first migration/setup properly.
    await migration001(db);
    // ---

})();
