// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e 
// It assumes a fresh postgres installation so that the migration
// will work. No checks are made for whether the database has
// completed the initial setup.

import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';

import express from 'express';

const pgp = pgPromise();

import * as dbAPI from './db/index';

// ---


(async () => {

    const db: pgPromise.IDatabase<{}, pg.IClient> = pgp({
        host: 'localhost',
        port: 13000,
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
        const host = 'localhost';
        const port = 4000;
        app.listen(port, host, () => {
            console.log(`Server started at ${host}:${port}`);
        });
    }

})();
