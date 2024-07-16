// We need to share firebase imports between modules, otherwise
// apps and instances of the firebase modules are not shared.
export { getApp } from 'firebase/app';
export * from 'firebase/firestore/lite';
