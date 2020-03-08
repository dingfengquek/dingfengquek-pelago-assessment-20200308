import * as p from '../lineToPropGroup';

// ---

const print = (x: any) => {
    console.log(JSON.stringify(x, null, 4));
}
const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
}

printH1('This should work');
print(p.parseToPropGroups([
    { type: 'propLine1', name: 'Packages', value: 'MyApp' },
    { type: 'propLine1', name: 'Version', value: '1.2.3' },
]));

printH1('This should work - Multiple lines for a property');
print(p.parseToPropGroups([
    { type: 'propLine1', name: 'Packages', value: 'MyApp' },
    { type: 'propLine1', name: 'Version', value: '1.2.3' },
    {
      type: 'propLine1',
      name: 'Dependencies',
      value: 'Multiple lines'
    },
    { type: 'propLine>1', value: 'for dependencies' },
]));

printH1('This should work - Starts with empty line, empty lines should be skipped');
print(p.parseToPropGroups([
    { type: 'empty' },
    { type: 'propLine1', name: 'Version', value: '1.2.3' },
    {
        type: 'propLine1',
        name: 'Dependencies',
        value: 'Multiple '
    },
    {
        type: 'propLine>1',
        value: 'lines '
    },
        { type: 'propLine>1', value: 'for dependencies' },
]));

printH1('This should fail - Starts with second line');
print(p.parseToPropGroups([
    { type: 'empty' },
    { type: 'propLine>1', value: 'Second line that starts the input' },
    { type: 'propLine1', name: 'Version', value: '1.2.3' },
    {
      type: 'propLine1',
      name: 'Dependencies',
      value: 'Multiple lines'
    },
    { type: 'propLine>1', value: 'for dependencies' },
]));


printH1('This should work - Multiple prop groups');
print(p.parseToPropGroups([
    { type: 'propLine1', name: 'Package', value: 'MyApp' },
    { type: 'propLine1', name: 'Version', value: '1.0.0' },
    { type: 'empty' },
    { type: 'propLine1', name: 'Package', value: 'MyApp2' },
    { type: 'propLine1', name: 'Version', value: '2.0.0' },
]));
