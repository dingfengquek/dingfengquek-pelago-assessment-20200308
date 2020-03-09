import * as p from '../stringToPersons';

// ---

const print = (x: any) => {
    console.log(JSON.stringify(x, null, 4));
}
const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
}

printH1('This should work');
print(p.personsParser('Alice, Bob, Charlie'));

printH1('This should work');
print(p.personsParser('Alice <alice@gmail.com>, Bob  , Charlie   '));

printH1('This should work - Starts with a comma, first person has empty-string as name');
print(p.personsParser(', Alice <alice@gmail.com>, Bob, Charlie'));

printH1('This should work - Square brackets (terminates on square brackets)');
print(p.personsParser('Alice [cr, dr]'));

printH1('This should work - Square brackets (whitespace after square brackets)');
print(p.personsParser('Alice [cr, dr]  '));

printH1('This should work - Square brackets (another person after square brackets)');
print(p.personsParser('Alice [cr, dr], Bob'));
