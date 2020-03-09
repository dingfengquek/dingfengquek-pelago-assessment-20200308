import * as p from '../index';

// ---

const printRaw = (x: any) => {
    console.log(x);
}
const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
}

(async () => {
    {
        printH1('[getPackageDescriptionFileData] - This should work');
        const result = await p.getPackageDescriptionFileData('A3', '1.0.0');
        if (!result.isOk) {
            console.log(result);
            return;
        }
        printRaw(`Web query succeeded, parsing succeeded, printing out parsed result...`);
        printRaw(result.ok);
    }
})();
