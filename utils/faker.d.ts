// FIX: Corrected faker type declaration to avoid a circular reference error
// by moving the import outside the module declaration. This file is now the
// single source for this module augmentation, resolving redeclaration errors.
import type { Faker } from '@faker-js/faker';

declare module '@faker-js/faker' {
    export const faker: Faker;
}
