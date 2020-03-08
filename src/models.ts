export interface Package {
    name: string;
    version: string;
    datePublication: string | null;
    title: string | null;
    description: string | null;
}

export interface Author {
    packageName: string;
    name: string;
    email: string | null;
}

export interface Maintainer {
    packageName: string;
    name: string;
    email: string | null;
}

// PackageX is an "extension" of Package, with authors and maintainers
export interface PackageX {
    package: Package;
    authors: readonly Author[];
    maintainers: readonly Maintainer[];
}
