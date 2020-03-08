import * as mmApp from '../../models';
import * as rr from '../../result';
import * as mmParse from './parserModels'
import { personsParser as personsParser } from './stringToPersons';

// ---

// Map PropGroup (the parser model that parsers output) to PackageX (the common app model)
export const propGroupToPackageX = (propGroup: mmParse.PropGroup): rr.Result<mmApp.PackageX, string> => {
    const partialPackage: Partial<mmApp.Package> = {};
    let authors: readonly mmParse.Person[] = [];
    let maintainers: readonly mmParse.Person[] = [];
    const unwalked = new Set<string>(['Package', 'Version', 'Date/Publication', 'Title', 'Description', 'Author', 'Maintainer']);
    for (const prop of propGroup) {
        switch (prop.name) {
            case 'Package': partialPackage.name = prop.value; unwalked.delete(prop.name); break;
            case 'Version': partialPackage.version = prop.value; unwalked.delete(prop.name); break;
            case 'Date/Publication': partialPackage.datePublication = prop.value; unwalked.delete(prop.name); break;
            case 'Title': partialPackage.title = prop.value; unwalked.delete(prop.name); break;
            case 'Description': partialPackage.description = prop.value; unwalked.delete(prop.name); break;
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
        return rr.err(`Error while mapping mmParse.PropGroup to PackageX: The following properties with names ${JSON.stringify(Array.from(unwalked))} were not found in the prop group.`)
    }
    return rr.ok({
        package: partialPackage as mmApp.Package,
        authors: authors.map(({ name, email }) => ({ packageName: partialPackage.name || '', name, email })),
        maintainers: maintainers.map(({ name, email }) => ({ packageName: partialPackage.name || '', name, email })),
    });
};
