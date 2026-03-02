/**
 * Package registry — defines which packages are compared and where to find
 * their type files.
 *
 * To add a new package:
 *  1. Create .github/scripts/compare-types/packages/<name>/firebase-sdk.d.ts
 *     with the public types copied from the firebase-js-sdk release.
 *  2. Create .github/scripts/compare-types/packages/<name>/config.ts
 *     documenting any known differences.
 *  3. Add an entry to the `packages` array below.
 */

import path from 'path';
import type { PackageConfig } from './types';

import storageConfig from '../packages/storage/config';

const SCRIPT_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');

export interface PackageEntry {
  /** Short name used in reports (e.g. "remote-config"). */
  name: string;
  /**
   * Path to the firebase-js-sdk public type snapshot (.d.ts).
   * Kept in .github/scripts/compare-types/packages/<name>/firebase-sdk.d.ts.
   */
  firebaseSdkTypesPath: string;
  /**
   * The primary modular .d.ts files from the built RN Firebase package,
   * listed in priority order (first file's exports take precedence).
   */
  rnFirebaseModularFiles: string[];
  /**
   * Additional .d.ts files added to the ts-morph project so that re-export
   * chains can be resolved. Their exports are NOT compared directly.
   */
  rnFirebaseSupportFiles: string[];
  /** Documented known differences for this package. */
  config: PackageConfig;
}

function rnDist(packageName: string): string {
  return path.join(
    REPO_ROOT,
    'packages',
    packageName,
    'dist',
    'typescript',
    'lib',
  );
}

export const packages: PackageEntry[] = [
  // {
  //   name: 'remote-config',
  //   firebaseSdkTypesPath: path.join(
  //     SCRIPT_DIR,
  //     'packages',
  //     'remote-config',
  //     'firebase-sdk.d.ts',
  //   ),
  //   rnFirebaseModularFiles: [
  //     path.join(rnDist('remote-config'), 'types', 'modular.d.ts'),
  //     path.join(rnDist('remote-config'), 'modular.d.ts'),
  //   ],
  //   rnFirebaseSupportFiles: [
  //     path.join(rnDist('remote-config'), 'statics.d.ts'),
  //     path.join(rnDist('remote-config'), 'types', 'namespaced.d.ts'),
  //     path.join(rnDist('remote-config'), 'types', 'internal.d.ts'),
  //   ],
  //   config: remoteConfigConfig,
  // },
  {
    name: 'storage',
    firebaseSdkTypesPath: path.join(
      SCRIPT_DIR,
      'packages',
      'storage',
      'storage-js-sdk.d.ts',
    ),
    rnFirebaseModularFiles: [
      path.join(rnDist('storage'), 'types', 'storage.d.ts'),
      path.join(rnDist('storage'), 'modular.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('storage'), 'StorageStatics.d.ts'),
      path.join(rnDist('storage'), 'types', 'namespaced.d.ts'),
      path.join(rnDist('storage'), 'types', 'internal.d.ts'),
    ],
    config: storageConfig,
  },
];


