// We need to share firebase imports between modules, otherwise
// apps and instances of the firebase modules are not shared.
import 'firebase/app';
export { getApp } from 'firebase/app';
export * from 'firebase/remote-config';
export { makeIDBAvailable } from './memidb';
