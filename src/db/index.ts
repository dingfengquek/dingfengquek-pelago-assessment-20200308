import pgPromise from 'pg-promise';
import * as pg from 'pg-promise/typescript/pg-subset';

import * as mmApp from '../models';

type DB = pgPromise.IDatabase<{}, pg.IClient>;

// Models that correspond to database query result

interface MaintainerFromDB {
    package_name: string;
    name: string;
    email: string | null;
}

interface AuthorFromDB {
    package_name: string;
    name: string;
    email: string | null;
}

interface PackageFromDB {
    package_name: string;
    version: string;
    date_publication: string;
    description: string;
    title: string;    
}

// ---

export const packageAuthorSelectByPackageName = async (client: DB, packageName: string) => {
    const result = await client.query(`SELECT package_name, name, email FROM cran.author WHERE package_name = $1`, [packageName]);
    return result.rows;
};

export const packageMaintainerSelectByPackageName = async (client: DB, packageName: string) => {
    const result = await client.query(`SELECT package_name, name, email FROM cran.maintainer WHERE package_name = $1`, [packageName]);
    return result.rows;
};

// ---

export const insertPackageX = async (db: DB, packageX: mmApp.PackageX) => {
    return await db.tx(tx => {
        const queries: Promise<null>[] = [];
        queries.push(tx.none(`
            INSERT INTO cran.package (package_name, version, date_publication, title, description)
            VALUES ($1, $2, $3, $4, $5);
            `, [packageX.package.name, packageX.package.version, packageX.package.datePublication, packageX.package.title, packageX.package.description]));
        for (const author of packageX.authors) {
            queries.push(tx.none(`
                INSERT INTO cran.author (package_name, name, email)
                VALUES ($1, $2, $3);
            `, [author.packageName, author.name, author.email]));
        }
        for (const maintainer of packageX.maintainers) {
            queries.push(tx.none(`
                INSERT INTO cran.maintainer (package_name, name, email)
                VALUES ($1, $2, $3);
            `, [maintainer.packageName, maintainer.name, maintainer.email]));
        }
        return tx.batch(queries);
    });
};

export interface SearchByPackageNameQueryOutput {
    packages: readonly mmApp.Package[];
    authors: readonly mmApp.Author[];
    maintainers: readonly mmApp.Maintainer[];
}

export const searchByPackageNameQuery = async (client: DB, query: string): Promise<SearchByPackageNameQueryOutput> => {
    const results = await client.multiResult(`

BEGIN;

CREATE TEMPORARY VIEW matched_package_names (package_name) AS

    SELECT package_name
        FROM cran.package
        WHERE SIMILARITY(package_name, $1) > 0.2;

SELECT package_name, version, date_publication, title, description
    FROM cran.package
    WHERE package_name IN (SELECT * FROM matched_package_names)
    ORDER BY package_name;

SELECT package_name, name, email
    FROM cran.author
    WHERE package_name IN (SELECT * FROM matched_package_names)
    ORDER BY package_name;

SELECT package_name, name, email
    FROM cran.maintainer
    WHERE package_name IN (SELECT * FROM matched_package_names)
    ORDER BY package_name;

DROP VIEW matched_package_names;

COMMIT;

    `, [query]);

    const maintainerFromDBs: readonly MaintainerFromDB[] = results[4].rows;
    const authorFromDBs: readonly AuthorFromDB[] = results[3].rows;
    const packagesFromDB: readonly PackageFromDB[] = results[2].rows;

    const packages: readonly mmApp.Package[] = packagesFromDB.map((packageFromDB): mmApp.Package => ({
        name: packageFromDB.package_name,
        version: packageFromDB.version,
        datePublication: packageFromDB.date_publication,
        description: packageFromDB.description,
        title: packageFromDB.title,
    }));

    const authors = authorFromDBs.map((authorFromDB): mmApp.Author => ({
        packageName: authorFromDB.package_name,
        name: authorFromDB.name,
        email: authorFromDB.email,
    }));

    const maintainers = maintainerFromDBs.map((maintainerFromDB): mmApp.Maintainer => ({
        packageName: maintainerFromDB.package_name,
        name: maintainerFromDB.name,
        email: maintainerFromDB.email,
    }));

    
    return { packages, authors, maintainers };
};
