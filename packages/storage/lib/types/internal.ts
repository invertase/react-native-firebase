import type { Storage } from './storage';

/**
 * Internal Storage type with access to private properties.
 * Used internally by StorageReference and other internal classes.
 */
export type StoragePrivate = Storage & {
  native: any;
  _customUrlOrRegion: string | null;
};
