// This is separated into its own file because the output is long.

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
        printH1('[getListData] - This should work');
        const dataResult = await p.getListData();
        if (!dataResult.isOk) {
            console.log(dataResult);
            return;
        }
        printRaw(`Web query succeeded, parsing succeeded, printing out result...`);
        printRaw(dataResult.ok);
    }
})();
