import * as rr from '../result';

import * as mmApp from '../models';
import * as mmData from './models';

import * as wwwReader from './wwwReader/index';
import * as parser from './parser/index';

// ---

export const getListData = async (): Promise<rr.Result<readonly mmData.ListDataElement[], string>> => {
    try {
        // Get raw (stringly-typed) list data from WWW source
        const wwwListDataResult = await wwwReader.getListData();
        if (!wwwListDataResult.isOk) {
            return rr.err(`[getListData] Error: Error while calling getListData wwwReader: ${wwwListDataResult.isOk}`);
        }
        const listDataRaw = wwwListDataResult.ok;
        // ---
        // Parse list data
        const listDataResult = parser.parseListData(listDataRaw);
        if (!listDataResult.isOk) {
            return rr.err(`getListData] Error: Error while calling parseListData parser: ${listDataResult.err} `);
        }
        const listData = listDataResult.ok;
        return rr.ok(listData);
    } catch (err) {
        return rr.err(`[getListData] Unexpected error: ${err.toString()}`);
    }
};

// ---

export const getPackageDescriptionFileData = async (name: string, version: string): Promise<rr.Result<mmApp.PackageX, string>> => {
    try {
        // Get raw package description file data
        const packageDescriptionFileDataResult = await wwwReader.getPackageDescriptionFile(name, version);
        if (!packageDescriptionFileDataResult.isOk) {
            return rr.err(`[getPackageDescriptionFileData] Error: Error while reading from wwwReader: ${packageDescriptionFileDataResult.err}`);
        }
        const packageDescriptionFileDataRaw = packageDescriptionFileDataResult.ok;
        // ---
        // Parse to packageDesriptionFileData
        const packageDesriptionFileDataResult = parser.parsePackageDescriptionFile(packageDescriptionFileDataRaw);
        if (!packageDesriptionFileDataResult.isOk) {
            return rr.err(`[getPackageDescriptionFileData] Error: Error while parsing raw data: ${packageDesriptionFileDataResult.err}`);
        }
        const packageDesriptionFileData = packageDesriptionFileDataResult.ok;
        // ---
        return rr.ok(packageDesriptionFileData);
    } catch (e) {
        return rr.err(`[getPackageDescriptionFileData] Unexpected error while getting data for [name=${name}] [version=${version}]: ${e.toString()}`);
    }
};
