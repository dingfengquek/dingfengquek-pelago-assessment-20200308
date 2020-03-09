import * as rr from '../../result';
import * as mmApp from '../../models';

import { parseToLines } from './stringToLines';
import { parseToPropGroups } from './lineToPropGroup';
import { propGroupToPackageX } from './mapParserToApp';
import { ListDataElement } from '../models';

export const parseListData = (input: string): rr.Result<readonly ListDataElement[], string> => {
    // Parse to lines
    const parseToLinesResult = parseToLines(input.split('\n'));
    if (!parseToLinesResult.isOk) {
        return rr.err(`[parseListData] Error while parsing input to lines:${parseToLinesResult.err}`);
    }
    const lines = parseToLinesResult.ok;
    // ---
    // Parse to prop groups, get the first one (there should only be 1)
    const parseToPropGroupsResult = parseToPropGroups(lines);
    if (!parseToPropGroupsResult.isOk) {
        return rr.err(`[parseListData] Error while parsing Lines to PropGroups: ${parseToPropGroupsResult.err}`);
    }
    const propGroups = parseToPropGroupsResult.ok;
    // ---
    const listData: ListDataElement[] = [];
    for (let i = 0; i < propGroups.length; i++) {
        const propGroup = propGroups[i];
        let name = '';
        let version = '';
        const unwalked = new Set(['Package', 'Version']);
        for (const prop of propGroup) {
            switch (prop.name) {
                case 'Package': name = prop.value; unwalked.delete('Package'); break;
                case 'Version': version = prop.value; unwalked.delete('Version'); break;
            }
            if (unwalked.size === 0) {
                break;
            }
        }
        if (unwalked.size > 0) {
            return rr.err(`[parseListData] Error: Could not find the below properties in propGroup number ${i+1}, with props [${JSON.stringify(propGroup)}]`);
        }
        listData.push({ name, version });
    }
    // ---
    return rr.ok(listData);
};

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
