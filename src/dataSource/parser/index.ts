import * as rr from '../../result';
import * as mmApp from '../../models';

import { parseToLines } from './stringToLines';
import { parseToPropGroups } from './lineToPropGroup';
import { propGroupToPackageX } from './mapParserToApp';


export const parsePackageDescriptionFile = (input: string): rr.Result<mmApp.PackageX, string> => {
    // Parse to lines
    const parseToLinesResult = parseToLines(input.split('\n'));
    if (!parseToLinesResult.isOk) {
        return rr.err(`[parsePackageDescriptionFile] Error while parsing input to lines:${parseToLinesResult.err}`);
    }
    const lines = parseToLinesResult.ok;
    // ---
    // Parse to prop groups, get the first one (there should only be 1)
    const parseToPropGroupsResult = parseToPropGroups(lines);
    if (!parseToPropGroupsResult.isOk) {
        return rr.err(`[parsePackageDescriptionFile] Error while parsing Lines to PropGroups: ${parseToPropGroupsResult.err}`);
    }
    if (parseToPropGroupsResult.ok.length < 1) {
        return rr.err(`[parsePackageDescriptionFile] Error: No prop-groups/package data found in returned text.`);
    }
    if (parseToPropGroupsResult.ok.length > 1) {
        return rr.err(`[parsePackageDescriptionFile] Error: More than 1 prop-groups/packages found in returned text. Only expected 1 prop-group/package.`);
    }
    const propGroup = parseToPropGroupsResult.ok[0];
    // ---
    const packageXResult = propGroupToPackageX(propGroup);
    if (!packageXResult.isOk) {
        return rr.err(`[parsePackageDescriptionFile] Error while mapping PropGroup to PackageX: ${packageXResult.err}`);
    }
    // ---
    return rr.ok(packageXResult.ok);
};
