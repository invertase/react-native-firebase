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
import aiConfig from '../packages/ai/config';
import databaseConfig from '../packages/database/config';
import appCheckConfig from '../packages/app-check/config';
import firestoreConfig from '../packages/firestore/config';
import firestorePipelinesConfig from '../packages/firestore-pipelines/config';
import installationsConfig from '../packages/installations/config';
import remoteConfigConfig from '../packages/remote-config/config';

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
  return path.join(REPO_ROOT, 'packages', packageName, 'dist', 'typescript', 'lib');
}

export const packages: PackageEntry[] = [
  {
    name: 'storage',
    firebaseSdkTypesPaths: [path.join(SCRIPT_DIR, 'packages', 'storage', 'storage-js-sdk.d.ts')],
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
  {
    name: 'remote-config',
    firebaseSdkTypesPaths: [
      path.join(SCRIPT_DIR, 'packages', 'remote-config', 'firebase-sdk.d.ts'),
    ],
    rnFirebaseModularFiles: [
      path.join(rnDist('remote-config'), 'types', 'remote-config.d.ts'),
      path.join(rnDist('remote-config'), 'modular.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('remote-config'), 'statics.d.ts'),
      path.join(rnDist('remote-config'), 'types', 'namespaced.d.ts'),
    ],
    config: remoteConfigConfig,
  },
  {
    name: 'ai',
    firebaseSdkTypesPaths: [path.join(SCRIPT_DIR, 'packages', 'ai', 'ai-sdk.d.ts')],
    rnFirebaseModularFiles: [path.join(rnDist('ai'), 'index.d.ts')],
    rnFirebaseSupportFiles: [
      path.join(rnDist('ai'), 'backend.d.ts'),
      path.join(rnDist('ai'), 'errors.d.ts'),
      path.join(rnDist('ai'), 'public-types.d.ts'),
      path.join(rnDist('ai'), 'methods', 'chat-session.d.ts'),
      path.join(rnDist('ai'), 'methods', 'live-session.d.ts'),
      path.join(rnDist('ai'), 'models', 'index.d.ts'),
      path.join(rnDist('ai'), 'models', 'ai-model.d.ts'),
      path.join(rnDist('ai'), 'models', 'generative-model.d.ts'),
      path.join(rnDist('ai'), 'models', 'imagen-model.d.ts'),
      path.join(rnDist('ai'), 'models', 'live-generative-model.d.ts'),
      path.join(rnDist('ai'), 'models', 'template-generative-model.d.ts'),
      path.join(rnDist('ai'), 'models', 'template-imagen-model.d.ts'),
      path.join(rnDist('ai'), 'requests', 'imagen-image-format.d.ts'),
      path.join(rnDist('ai'), 'requests', 'schema-builder.d.ts'),
      path.join(rnDist('ai'), 'types', 'index.d.ts'),
      path.join(rnDist('ai'), 'types', 'content.d.ts'),
      path.join(rnDist('ai'), 'types', 'enums.d.ts'),
      path.join(rnDist('ai'), 'types', 'error.d.ts'),
      path.join(rnDist('ai'), 'types', 'googleai.d.ts'),
      path.join(rnDist('ai'), 'types', 'live-responses.d.ts'),
      path.join(rnDist('ai'), 'types', 'requests.d.ts'),
      path.join(rnDist('ai'), 'types', 'responses.d.ts'),
      path.join(rnDist('ai'), 'types', 'schema.d.ts'),
      path.join(rnDist('ai'), 'types', 'imagen', 'index.d.ts'),
      path.join(rnDist('ai'), 'types', 'imagen', 'requests.d.ts'),
      path.join(rnDist('ai'), 'types', 'imagen', 'responses.d.ts'),
    ],
    config: aiConfig,
  },
  {
    name: 'database',
    firebaseSdkTypesPaths: [path.join(SCRIPT_DIR, 'packages', 'database', 'firebase-sdk.d.ts')],
    rnFirebaseModularFiles: [
      path.join(rnDist('database'), 'types', 'database.d.ts'),
      path.join(rnDist('database'), 'modular.d.ts'),
      path.join(rnDist('database'), 'modular', 'query.d.ts'),
      path.join(rnDist('database'), 'modular', 'transaction.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('database'), 'types', 'namespaced.d.ts'),
      path.join(rnDist('database'), 'types', 'internal.d.ts'),
      path.join(rnDist('database'), 'DatabaseDataSnapshot.d.ts'),
      path.join(rnDist('database'), 'DatabaseOnDisconnect.d.ts'),
      path.join(rnDist('database'), 'DatabaseQuery.d.ts'),
      path.join(rnDist('database'), 'DatabaseReference.d.ts'),
      path.join(rnDist('database'), 'DatabaseStatics.d.ts'),
      path.join(rnDist('database'), 'DatabaseThenableReference.d.ts'),
    ],
    config: databaseConfig,
  },
  {
    name: 'app-check',
    firebaseSdkTypesPaths: [path.join(SCRIPT_DIR, 'packages', 'app-check', 'app-check-sdk.d.ts')],
    rnFirebaseModularFiles: [
      path.join(rnDist('app-check'), 'types', 'appcheck.d.ts'),
      path.join(rnDist('app-check'), 'modular.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('app-check'), 'providers.d.ts'),
      path.join(rnDist('app-check'), 'types', 'internal.d.ts'),
    ],
    config: appCheckConfig,
  },
  {
    name: 'installations',
    firebaseSdkTypesPaths: [
      path.join(SCRIPT_DIR, 'packages', 'installations', 'firebase-sdk.d.ts'),
    ],
    rnFirebaseModularFiles: [
      path.join(rnDist('installations'), 'types', 'installations.d.ts'),
      path.join(rnDist('installations'), 'modular.d.ts'),
    ],
    rnFirebaseSupportFiles: [path.join(rnDist('installations'), 'types', 'internal.d.ts')],
    config: installationsConfig,
  },
  {
    name: 'firestore',
    firebaseSdkTypesPaths: [
      path.join(SCRIPT_DIR, 'packages', 'firestore', 'firestore-js-sdk.d.ts'),
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
      path.join(SCRIPT_DIR, 'packages', 'firestore-pipelines', 'pipelines.d.ts'),
    ],
    rnFirebaseModularFiles: [path.join(rnDist('firestore'), 'pipelines', 'index.d.ts')],
    rnFirebaseSupportFiles: [
      path.join(rnDist('firestore'), 'pipelines', 'expressions.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'pipeline.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'pipeline-result.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'pipeline-source.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'pipeline_impl.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'pipeline_options.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'stage_options.d.ts'),
      path.join(rnDist('firestore'), 'pipelines', 'types.d.ts'),
    ],
    config: firestorePipelinesConfig,
  },
];
