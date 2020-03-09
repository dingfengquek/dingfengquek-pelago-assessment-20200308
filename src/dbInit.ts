// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e 
// It assumes a fresh postgres installation so that the migration
// will work. No checks are made for whether the database has
// completed the initial setup.

import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import { migration001 } from './db/migrations/migration001';

// ---

const pgp = pgPromise();

// ---

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '13000');

(async () => {

    console.log(`DB_HOST=${DB_HOST}`);
    console.log(`DB_PORT=${DB_PORT}`);
    const db: pgPromise.IDatabase<{}, pg.IClient> = pgp({
        host: DB_HOST,
        port: DB_PORT,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    });

    // @todo: Redo first migration/setup properly.
    await migration001(db);
    // ---

})();
