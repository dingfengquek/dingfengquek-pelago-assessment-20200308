// The postgres docker container is run with the below parameters
//     docker run --network network1 -p 13000:5432 --name plpg -e 
// It assumes a fresh postgres installation so that the migration
// will work. No checks are made for whether the database has
// completed the initial setup.

import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';

import * as mm from './models';
import * as dbAPI from './db/index';
import * as dataSource from './dataSource/index';

const pgp = pgPromise();

// ---

const PACKAGE_COUNT_LIMIT = process.env['PACKAGE_COUNT_LIMIT'] ?
    parseInt(process.env['PACKAGE_COUNT_LIMIT']) :
    50;


(async () => {

    const db: pgPromise.IDatabase<{}, pg.IClient> = pgp({
        host: 'localhost',
        port: 13000,
        user: 'postgres',
        password: 'password',
        database: 'postgres',
    });

    // ---

    {
        console.log(`Querying for list of packages from CRAN's API...`);
        // Query for packageXs from CRAN's API
        const packageXs: mm.PackageX[] = [];
        const listDataResult = await dataSource.getListData();
        if (!listDataResult.isOk) {
            throw new Error(`Error when getting list data result: ${listDataResult.err}`);
        }
        const listData = listDataResult.ok.slice(0, PACKAGE_COUNT_LIMIT); // @todo: Factor out limit of 50
        // ---
        console.log(`Querying each package individually from CRAN's API for its DESCRIPTION file...`);
        for (const x of listData) {
            console.log(`Querying ${x.name} - ${x.version}`);
            const packageXResult = await dataSource.getPackageDescriptionFileData(x.name, x.version);
            if (!packageXResult.isOk) {
                throw new Error(`Error when getting package DESCRIPTION file data for [name=${x.name}] [version=${x.version}]: ${packageXResult.err}`);
            }
            packageXs.push(packageXResult.ok);
        }
        // ---
        for (const packageX of packageXs) {
            // @todo: No error handling, assumes that everything works
            await dbAPI.insertPackageX(db, packageX);
        }
    }

})();
