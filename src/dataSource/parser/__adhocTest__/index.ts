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


printH1('This should work - Parse package description file for abctools@1.1.3');
print(p.parsePackageDescriptionFile(`
Package: abctools
Type: Package
Title: Tools for ABC Analyses
Version: 1.1.3
Date: 2018-07-17
Authors@R: c(person("Matt","Nunes",role=c("aut","cre"),
        email="nunesrpackages@gmail.com"),person("Dennis", "Prangle",
        role="aut",email="d.b.prangle@newcastle.ac.uk"),
	person("Guilhereme", "Rodrigues", role="ctb",
	email="g.rodrigues@unsw.edu.au"))
Description: Tools for approximate Bayesian computation including summary statistic selection and assessing coverage.
Depends: R (>= 2.10), abc, abind, parallel, plyr, Hmisc
Suggests: ggplot2, abc.data
License: GPL (>= 2)
LazyLoad: yes
URL: https://github.com/dennisprangle/abctools
BugReports: https://github.com/dennisprangle/abctools/issues
RoxygenNote: 6.0.1
NeedsCompilation: yes
Packaged: 2018-07-17 13:51:45 UTC; dennis
Author: Matt Nunes [aut, cre],
  Dennis Prangle [aut],
  Guilhereme Rodrigues [ctb]
Maintainer: Matt Nunes <nunesrpackages@gmail.com>
Repository: CRAN
Date/Publication: 2018-07-17 23:20:02 UTC
`));

printH1('This should work - Parse package description file for abd@0.2-8');
print(p.parsePackageDescriptionFile(`
Package: abd
Type: Package
Title: The Analysis of Biological Data
Version: 0.2-8
Date: 2015-07-02
Author: Kevin M. Middleton <middletonk@missouri.edu>, Randall Pruim
    <rpruim@calvin.edu>
Maintainer: Kevin M. Middleton <middletonk@missouri.edu>
Depends: R (>= 3.0), nlme, lattice, grid, mosaic
Suggests: boot, car, ggplot2, plyr, HH, ICC, vcd, Hmisc
Description: The abd package contains data sets and sample code for The
    Analysis of Biological Data by Michael Whitlock and Dolph Schluter (2009;
    Roberts & Company Publishers).
License: GPL-2
LazyLoad: yes
LazyData: yes
Encoding: UTF-8
Collate: 'abdData.R' 'histochart.R' 'datasets.R' 'themes.R'
NeedsCompilation: no
Packaged: 2015-07-03 01:35:03 UTC; kmm
Repository: CRAN
Date/Publication: 2015-07-03 05:44:45`));

printH1('This should work - Parse package description file for ABHgenotypeR@1.0.1');
print(p.parsePackageDescriptionFile(`
Package: ABHgenotypeR
Type: Package
Title: Easy Visualization of ABH Genotypes
Version: 1.0.1
Date: 2016-02-04
Authors@R: c(
  person("Stefan", "Reuscher", email = "reuscher.stefan@gmail.com",
  role = c("aut", "cre")),
  person("Tomoyuki", "Furuta", role = "aut"))
Description: Easy to use functions to visualize marker data
    from biparental populations. Useful for both analyzing and
    presenting genotypes in the ABH format.
License: GPL-3
URL: http://github.com/StefanReuscher/ABHgenotypeR
BugReports: http://github.com/StefanReuscher/ABHgenotypeR/issues
LazyData: TRUE
Imports: ggplot2, reshape2, utils
RoxygenNote: 5.0.1
Suggests: knitr, rmarkdown
VignetteBuilder: knitr
NeedsCompilation: no
Packaged: 2016-02-04 05:07:28 UTC; Stefan
Author: Stefan Reuscher [aut, cre],
  Tomoyuki Furuta [aut]
Maintainer: Stefan Reuscher <reuscher.stefan@gmail.com>
Repository: CRAN
Date/Publication: 2016-02-04 11:27:29`));