import type { Storage, Reference } from './storage';
import type EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

/**
 * Internal Storage type with access to private properties.
 * Used internally by StorageReference and other internal classes.
 */
export type StoragePrivate = Storage & {
  native: any;
  _customUrlOrRegion: string | null;
  emitter: EventEmitter;
  eventNameForApp: (...args: Array<string | number>) => string;
};

/**
 * Internal Reference type with access to private properties.
 * Used internally by StorageTask and other internal classes.
 */
export type ReferencePrivate = Reference & {
  _storage: StoragePrivate;
};
