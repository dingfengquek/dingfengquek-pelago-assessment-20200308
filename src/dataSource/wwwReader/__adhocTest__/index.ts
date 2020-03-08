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
        printH1('[getPackageDescriptionFile] - This should work');
        const fileResult = await p.getPackageDescriptionFile('A3', '1.0.0');
        if (!fileResult.isOk) {
            console.log(fileResult);
            return;
        }
        printRaw(`Web query succeeded, printing out result...`);
        printRaw(fileResult.ok);
    }
})();
