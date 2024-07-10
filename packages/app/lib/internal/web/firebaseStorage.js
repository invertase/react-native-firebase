// We need to share firebase imports between modules, otherwise
// apps and instances of the firebase modules are not shared.
export * from 'firebase/app';
export * from 'firebase/storage';
