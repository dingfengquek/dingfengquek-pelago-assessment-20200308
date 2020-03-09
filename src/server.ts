// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e 
// It assumes a fresh postgres installation so that the migration
// will work. No checks are made for whether the database has
// completed the initial setup.

import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';
import express from 'express';
import * as dbAPI from './db/index';

// ---

const pgp = pgPromise();

// ---

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '13000');
const SERVER_HOST = process.env.SERVER_HOST || 'localhost';

(async () => {

    console.log(`DB_HOST=${DB_HOST}`);
    console.log(`DB_PORT=${DB_PORT}`);
    console.log(`SERVER_HOST=${SERVER_HOST}`);
    const db: pgPromise.IDatabase<{}, pg.IClient> = pgp({
        host: DB_HOST,
        port: DB_PORT,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    });

    const app = express();

    app.get('/search', async (req, res) => {
        const query: string | undefined = req.query.q;
        if (query === undefined || query === '') {
            res.send('URL query parameter required, e.g. /search?q=ggplot2');
            return;
        }
        // Assumes that there will be no errors, errosr are not handled.
        const dbResult = await dbAPI.searchByPackageNameQuery(db, query);
        res.send(dbResult);
    });
    
    {
        const port = 4000;
        app.listen(port, SERVER_HOST, () => {
            console.log(`Server started at ${SERVER_HOST}:${port}`);
        });
    }

})();
