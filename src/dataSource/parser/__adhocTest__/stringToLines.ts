import * as p from '../stringToLines';

// ---

console.log('This should work');
console.log(p.parseToLines([
    'Packages: MyApp',
    'Version: 1.2.3',
]));

console.log('This should work - Multiple lines for a property');
console.log(p.parseToLines([
    'Packages: MyApp',
    'Version: 1.2.3',
    'Dependencies: Multiple lines',
    '        for dependencies',
]));

console.log('This should fail - Indent/Tab size is not 8 spaces');
console.log(p.parseToLines([
    'Packages: MyApp',
    'Version: 1.2.3',
    'Dependencies: Multiple lines',
    '      for dependencies',
]));

console.log('This should fail - No colon for start of property');
console.log(p.parseToLines([
    'Packages: MyApp',
    'Version: 1.2.3',
    'Dependencies without colon',
    'Author: Alice',
]));
