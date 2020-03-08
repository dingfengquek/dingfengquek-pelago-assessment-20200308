import * as mmApp from '../../models';
import * as rr from '../../result';
import * as mmParse from './parserModels'
import { personsParser as personsParser } from './stringToPersons';

// ---

// Map PropGroup (the parser model that parsers output) to PackageX (the common app model)
export const propGroupToPackageX = (propGroup: mmParse.PropGroup): rr.Result<mmApp.PackageX, string> => {
    const package_: mmApp.Package = {
        name: '',
        version: '',
        title: null,
        description: null,
        datePublication: null,
    };
    let authors: readonly mmParse.Person[] = [];
    let maintainers: readonly mmParse.Person[] = [];
    // Unwalked only requires Package and Version. This is because there are some non-conforming packages
    // like ABHgenotypeR@1.0.1, where the streaming HTTP API has a typo in the Date/Publication field name.
    // Thus, the data model was relaxed to allow null where possible.
    const unwalked = new Set<string>(['Package', 'Version']);
    for (const prop of propGroup) {
        switch (prop.name) {
            case 'Package': package_.name = prop.value; unwalked.delete(prop.name); break;
            case 'Version': package_.version = prop.value; unwalked.delete(prop.name); break;
            case 'Date/Publication': package_.datePublication = prop.value; unwalked.delete(prop.name); break;
            case 'Title': package_.title = prop.value; unwalked.delete(prop.name); break;
            case 'Description': package_.description = prop.value; unwalked.delete(prop.name); break;
            case 'Author': {
                const peopleParseResult = personsParser(prop.value);
                if (!peopleParseResult.isOk) {
                    return rr.err(`Error while mapping mmParse.PropGroup to PackageX: Error while parsing author prop value: ${peopleParseResult.err}`);
                }
                authors = peopleParseResult.ok;
                unwalked.delete(prop.name);
                break;
            };
            case 'Maintainer': {
                const peopleParseResult = personsParser(prop.value);
                if (!peopleParseResult.isOk) {
                    return rr.err(`Error while mapping mmParse.PropGroup to PackageX: Error while parsing author prop value: ${peopleParseResult.err}`);
                }
                maintainers = peopleParseResult.ok;
                unwalked.delete(prop.name);
                break;
            }
        }
    }
    if (unwalked.size > 0) {
        return rr.err(`Error while mapping mmParse.PropGroup to PackageX: The following properties with names ${Array.from(unwalked)} were not found in the prop group.`)
    }
    return rr.ok({
        package: package_ as mmApp.Package,
        authors: authors.map(({ name, email }) => ({ packageName: package_.name || '', name, email })),
        maintainers: maintainers.map(({ name, email }) => ({ packageName: package_.name || '', name, email })),
    });
};
