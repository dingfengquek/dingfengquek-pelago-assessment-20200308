import * as p from '../index';

// ---

const print = (x: any) => {
    console.log(JSON.stringify(x, null, 4));
}
const printH1 = (x: any) => {
    console.log('--- \x1b[4m', x, '\x1b[0m ---');
}

printH1('This should work - Parse list data');
print(p.parseListData(`
Package: MyApp
Version: 1.0.0
Title: MyTitle
Description: This is my description
        for MyApp. It is long and spans two lines.
Date/Publication: 2012-08-14 16:27:09
Author: Alice, Bob  <bob@gmail.com>
Maintainer: Charlie<charlie@gmail.com>

Package: MyApp2
Version: 1.0.0
Title: MyTitle2
Description: This is my description 2
        for MyApp. It is long and spans two lines.
Date/Publication: 2012-08-14 16:27:09
Author: John, Jonathan <jona@gmail.com>
Maintainer: Jamie<jam@gmail.com>

`));


printH1('This should work - Parse package description file');
print(p.parsePackageDescriptionFile(`
Package: MyApp
Version: 1.0.0
Title: MyTitle
Description: This is my description
        for MyApp. It is long and spans two lines.
Date/Publication: 2012-08-14 16:27:09
Author: Alice, Bob  <bob@gmail.com>
Maintainer: Charlie<charlie@gmail.com>
`));
