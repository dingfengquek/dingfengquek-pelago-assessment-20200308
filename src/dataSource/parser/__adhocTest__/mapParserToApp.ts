import * as p from '../mapParserToApp';

// ---

const print = (x: any) => {
    console.log(JSON.stringify(x, null, 4));
}
const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
}

printH1('This should work');
print(p.propGroupToPackageX([
    { name: 'Package', value: 'MyApp' },
    { name: 'Version', value: '1.0.0' },
    { name: 'Date/Publication', value: 'Feb 2020' },
    { name: 'Title', value: 'MyApp Title' },
    { name: 'Description', value: 'MyApp description lalala' },
    { name: 'Author', value: 'Alice, Bob <bob@gmail.com>, Charlie' },
    { name: 'Maintainer', value: 'Zugzwang' },
]));

printH1('This should fail - No version');
print(p.propGroupToPackageX([
    { name: 'Package', value: 'MyApp' },
    { name: 'Date/Publication', value: 'Feb 2020' },
    { name: 'Title', value: 'MyApp Title' },
    { name: 'Description', value: 'MyApp description lalala' },
    { name: 'Author', value: 'Alice, Bob <bob@gmail.com>, Charlie' },
    { name: 'Maintainer', value: 'Zugzwang' },
]));
