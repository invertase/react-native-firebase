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

import firestoreConfig from '../packages/firestore/config';
import firestorePipelinesConfig from '../packages/firestore-pipelines/config';

const SCRIPT_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');

export interface PackageEntry {
  /** Short name used in reports (e.g. "remote-config"). */
  name: string;
  /**
   * Paths to the firebase-js-sdk public type snapshot(s) (.d.ts).
   * Kept in .github/scripts/compare-types/packages/<name>/.
   * Exports from all files are merged (first file wins for duplicate names).
   */
  firebaseSdkTypesPaths: string[];
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
  //   firebaseSdkTypesPaths: [
  //     path.join(SCRIPT_DIR, 'packages', 'remote-config', 'firebase-sdk.d.ts'),
  //   ],
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
    name: 'firestore',
    firebaseSdkTypesPaths: [
      path.join(
        SCRIPT_DIR,
        'packages',
        'firestore',
        'firestore-js-sdk.d.ts',
      ),
    ],
    rnFirebaseModularFiles: [
      path.join(rnDist('firestore'), 'types', 'firestore.d.ts'),
      path.join(rnDist('firestore'), 'modular.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'query.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'snapshot.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'Bytes.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'FieldPath.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'FieldValue.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'GeoPoint.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'Timestamp.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'VectorValue.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('firestore'), 'types', 'namespaced.d.ts'),
      path.join(rnDist('firestore'), 'types', 'internal.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreAggregate.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreFilter.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreBlob.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreDocumentSnapshot.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreQuerySnapshot.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreSnapshotMetadata.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreGeoPoint.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreTimestamp.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreVectorValue.d.ts'),
      path.join(rnDist('firestore'), 'FirestorePersistentCacheIndexManager.d.ts'),
      path.join(rnDist('firestore'), 'LoadBundleTask.d.ts'),
      path.join(rnDist('firestore'), 'FirestoreWriteBatch.d.ts'),
      path.join(rnDist('firestore'), 'FieldPath.d.ts'),
      path.join(rnDist('firestore'), 'FieldValue.d.ts'),
    ],
    config: firestoreConfig,
  },
  {
    name: 'firestore-pipelines',
    firebaseSdkTypesPaths: [
      path.join(
        SCRIPT_DIR,
        'packages',
        'firestore-pipelines',
        'pipelines.d.ts',
      ),
    ],
    rnFirebaseModularFiles: [
      path.join(rnDist('firestore'), 'pipelines', 'index.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('firestore'), 'pipelines', 'pipeline.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'stage.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'stage_options.d.ts'),
    ],
    config: firestorePipelinesConfig,
  },
];
