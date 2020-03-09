import pgp_lib from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';

import { migration001 } from '../migrations/migration001';

import * as queries from '../index';

// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e POSTGRES_PASSWORD=password -d postgres
// Connected to with psql
//     docker run -it --rm --name plpg_psql --network network1 postgres psql -h plpg -U postgres

// View the database without test files - It is more reliable, if less automated.

const pgp = pgp_lib();
pgp.pg.defaults.idleTimeoutMillis = 5000;

// ---

const print = (x: any) => {
    console.log(x);
};

const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
};

// ---

(async () => {
    const client: pgp_lib.IDatabase<{}, pg.IClient> = pgp({
        host: 'localhost',
        port: 13000,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    });
    await migration001(client);
    await queries.insertPackageX(client, {
        package: {
            name: 'MyApp',
            version: '1.0.0',
            datePublication: '2020-02-01 12:48',
            description: 'MyDescription',
            title: 'MyTitle',
        },
        authors: [{packageName:'MyApp', name:'Alice', email:null}],
        maintainers: [],
    });
    await queries.insertPackageX(client, {
        package: {
            name: 'YourApp',
            version: '2.0.0',
            datePublication: '2021-02-01 12:48',
            description: 'YourDescription',
            title: 'YourTitle',
        },
        authors: [{packageName:'YourApp', name:'Bob', email:null}],
        maintainers: [{packageName:'YourApp', name:'Bob', email:'bob@gmail.com'}],
    });


    printH1(`Query with 'MyApp'`);
    print(await queries.searchByPackageNameQuery(client, 'MyApp'));
    printH1(`Query with 'YourApp'`);
    print(await queries.searchByPackageNameQuery(client, 'YourApp'));
    printH1(`Query with 'Your'`);
    print(await queries.searchByPackageNameQuery(client, 'Your'));
    printH1(`Query with 'App' - Expect to get YourApp and MyApp`);
    print(await queries.searchByPackageNameQuery(client, 'App'));

    await client.$pool.end();
    
})();


