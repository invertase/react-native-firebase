/**
 * Package registry — defines which packages are compared and where to find
 * their type files.
 *
 * Firebase JS SDK declarations are resolved from the repository root
 * `node_modules/firebase` package, so the comparison always uses the installed
 * SDK version instead of checked-in declaration snapshots.
 */

import fs from 'fs';
import path from 'path';
import type { PackageConfig } from './types';

import storageConfig from '../configs/storage';
import aiConfig from '../configs/ai';
import databaseConfig from '../configs/database';
import appCheckConfig from '../configs/app-check';
import firestoreConfig from '../configs/firestore';
import firestorePipelinesConfig from '../configs/firestore-pipelines';
import remoteConfigConfig from '../configs/remote-config';
import authConfig from '../configs/auth';
import installationsConfig from '../configs/installations';
import perfConfig from '../configs/perf-config';
import appConfig from '../configs/app';
import analyticsConfig from '../configs/analytics';
import crashlyticsConfig from '../configs/crashlytics';
import inAppMessagingConfig from '../configs/in-app-messaging';
import appDistributionConfig from '../configs/app-distribution';
import mlConfig from '../configs/ml';
import functionsConfig from '../configs/functions';
import messagingConfig from '../configs/messaging';
import phoneNumberVerificationConfig from '../configs/phone-number-verification';

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const EMPTY_SDK_PATH = path.join(__dirname, '..', 'configs', 'empty-sdk.d.ts');

export interface PackageEntry {
  /** Short name used in reports (e.g. "remote-config"). */
  name: string;
  /**
   * Paths to the installed firebase-js-sdk public type files.
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

const FIREBASE_PACKAGE_DIR = path.join(REPO_ROOT, 'node_modules', 'firebase');
const FIREBASE_PACKAGE_JSON = path.join(FIREBASE_PACKAGE_DIR, 'package.json');

interface FirebasePackageJson {
  exports?: Record<string, string | { types?: string }>;
}

function readFirebasePackageJson(): FirebasePackageJson {
  if (!fs.existsSync(FIREBASE_PACKAGE_JSON)) {
    throw new Error(
      `Firebase package not found at ${FIREBASE_PACKAGE_JSON}. Run \`yarn\` from the repository root before running compare-types.`,
    );
  }

  return JSON.parse(fs.readFileSync(FIREBASE_PACKAGE_JSON, 'utf8')) as FirebasePackageJson;
}

const firebasePackageJson = readFirebasePackageJson();

function firebaseTypes(packageName: string, optional = false): string | null {
  const exportName = `./${packageName}`;
  const exportEntry = firebasePackageJson.exports?.[exportName];
  const typesPath = (exportEntry && typeof exportEntry === 'object') ? (exportEntry as any).types : undefined;

  if (!typesPath) {
    if (optional) {
      console.warn(
        `Skipping firebase/${packageName}: no public Firebase type export found in ${FIREBASE_PACKAGE_JSON}.`,
      );
      return null;
    }

    throw new Error(
      `No public Firebase type export found for "firebase/${packageName}" in ${FIREBASE_PACKAGE_JSON}.`,
    );
  }

  return path.resolve(FIREBASE_PACKAGE_DIR, typesPath);
}

function requiredFirebaseTypes(packageName: string): string {
  return firebaseTypes(packageName) as string;
}

function optionalFirebasePackage(
  packageName: string,
  createEntry: (typesPath: string) => PackageEntry,
): PackageEntry[] {
  const typesPath = firebaseTypes(packageName, true);
  return typesPath ? [createEntry(typesPath)] : [];
}

function rnOnlyPackage(
  entry: Omit<PackageEntry, 'firebaseSdkTypesPaths'>,
): PackageEntry {
  return {
    ...entry,
    firebaseSdkTypesPaths: [EMPTY_SDK_PATH],
  };
}

export const packages: PackageEntry[] = [
  {
    name: 'app',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('app')],
    rnFirebaseModularFiles: [
      path.join(rnDist('app'), 'modular.d.ts'),
      path.join(rnDist('app'), 'index.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('app'), 'types', 'app.d.ts'),
      path.join(rnDist('app'), 'types', 'internal.d.ts'),
      path.join(rnDist('app'), 'FirebaseApp.d.ts'),
    ],
    config: appConfig,
  },
  {
    name: 'auth',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('auth')],
    rnFirebaseModularFiles: [
      path.join(rnDist('auth'), 'index.d.ts'),
      path.join(rnDist('auth'), 'types', 'auth.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('auth'), 'constants.d.ts'),
      path.join(rnDist('auth'), 'types', 'internal.d.ts'),
      path.join(rnDist('auth'), 'ConfirmationResult.d.ts'),
      path.join(rnDist('auth'), 'MultiFactorResolver.d.ts'),
      path.join(rnDist('auth'), 'PhoneAuthListener.d.ts'),
      path.join(rnDist('auth'), 'PhoneMultiFactorGenerator.d.ts'),
      path.join(rnDist('auth'), 'Settings.d.ts'),
      path.join(rnDist('auth'), 'TotpMultiFactorGenerator.d.ts'),
      path.join(rnDist('auth'), 'TotpSecret.d.ts'),
      path.join(rnDist('auth'), 'User.d.ts'),
      path.join(rnDist('auth'), 'getMultiFactorResolver.d.ts'),
      path.join(rnDist('auth'), 'multiFactor.d.ts'),
      path.join(rnDist('auth'), 'providers', 'AppleAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'EmailAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'FacebookAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'GithubAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'GoogleAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'OAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'OIDCAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'PhoneAuthProvider.d.ts'),
      path.join(rnDist('auth'), 'providers', 'TwitterAuthProvider.d.ts'),
    ],
    config: authConfig,
  },
  {
    name: 'storage',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('storage')],
    rnFirebaseModularFiles: [
      path.join(rnDist('storage'), 'index.d.ts'),
      path.join(rnDist('storage'), 'types', 'storage.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('storage'), 'StorageStatics.d.ts'),
      path.join(rnDist('storage'), 'types', 'internal.d.ts'),
    ],
    config: storageConfig,
  },
  {
    name: 'remote-config',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('remote-config')],
    rnFirebaseModularFiles: [
      path.join(rnDist('remote-config'), 'index.d.ts'),
      path.join(rnDist('remote-config'), 'types', 'remote-config.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('remote-config'), 'statics.d.ts'),
      path.join(rnDist('remote-config'), 'types', 'internal.d.ts'),
    ],
    config: remoteConfigConfig,
  },
  {
    name: 'ai',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('ai')],
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
    firebaseSdkTypesPaths: [requiredFirebaseTypes('database')],
    rnFirebaseModularFiles: [
      path.join(rnDist('database'), 'index.d.ts'),
      path.join(rnDist('database'), 'types', 'database.d.ts'),
      path.join(rnDist('database'), 'modular', 'query.d.ts'),
      path.join(rnDist('database'), 'modular', 'transaction.d.ts'),
    ],
    rnFirebaseSupportFiles: [
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
    firebaseSdkTypesPaths: [requiredFirebaseTypes('app-check')],
    rnFirebaseModularFiles: [
      path.join(rnDist('app-check'), 'index.d.ts'),
      path.join(rnDist('app-check'), 'types', 'appcheck.d.ts'),
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
      requiredFirebaseTypes('installations'),
    ],
    rnFirebaseModularFiles: [
      path.join(rnDist('installations'), 'index.d.ts'),
      path.join(rnDist('installations'), 'types', 'installations.d.ts'),
    ],
    rnFirebaseSupportFiles: [path.join(rnDist('installations'), 'types', 'internal.d.ts')],
    config: installationsConfig,
  },
  {
    name: 'firestore',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('firestore')],
    rnFirebaseModularFiles: [
      path.join(rnDist('firestore'), 'types', 'firestore.d.ts'),
      path.join(rnDist('firestore'), 'index.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'query.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'snapshot.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'Bytes.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'FieldPath.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'FieldValue.d.ts'),
      path.join(rnDist('firestore'), 'modular', 'VectorValue.d.ts'),
    ],
    rnFirebaseSupportFiles: [
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
  ...optionalFirebasePackage('firestore/pipelines', firebaseTypesPath => ({
    name: 'firestore-pipelines',
    firebaseSdkTypesPaths: [firebaseTypesPath],
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
  })),
  {
    name: 'perf',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('performance')],
    rnFirebaseModularFiles: [
      path.join(rnDist('perf'), 'index.d.ts'),
      path.join(rnDist('perf'), 'types', 'perf.d.ts'),
    ],
    rnFirebaseSupportFiles: [],
    config: perfConfig,
  },
  {
    name: 'analytics',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('analytics')],
    rnFirebaseModularFiles: [
      path.join(rnDist('analytics'), 'index.d.ts'),
      path.join(rnDist('analytics'), 'types', 'analytics.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('analytics'), 'types', 'internal.d.ts'),
      path.join(rnDist('analytics'), 'structs.d.ts'),
      path.join(rnDist('analytics'), 'struct.d.ts'),
    ],
    config: analyticsConfig,
  },
  rnOnlyPackage({
    name: 'crashlytics',
    rnFirebaseModularFiles: [
      path.join(rnDist('crashlytics'), 'index.d.ts'),
      path.join(rnDist('crashlytics'), 'types', 'crashlytics.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('crashlytics'), 'handlers.d.ts'),
      path.join(rnDist('crashlytics'), 'types', 'internal.d.ts'),
    ],
    config: crashlyticsConfig,
  }),
  rnOnlyPackage({
    name: 'in-app-messaging',
    rnFirebaseModularFiles: [
      path.join(rnDist('in-app-messaging'), 'index.d.ts'),
      path.join(rnDist('in-app-messaging'), 'types', 'in-app-messaging.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('in-app-messaging'), 'types', 'internal.d.ts'),
    ],
    config: inAppMessagingConfig,
  }),
  rnOnlyPackage({
    name: 'app-distribution',
    rnFirebaseModularFiles: [
      path.join(rnDist('app-distribution'), 'index.d.ts'),
      path.join(rnDist('app-distribution'), 'types', 'app-distribution.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('app-distribution'), 'types', 'internal.d.ts'),
    ],
    config: appDistributionConfig,
  }),
  rnOnlyPackage({
    name: 'ml',
    rnFirebaseModularFiles: [
      path.join(rnDist('ml'), 'index.d.ts'),
      path.join(rnDist('ml'), 'types', 'ml.d.ts'),
    ],
    rnFirebaseSupportFiles: [path.join(rnDist('ml'), 'types', 'internal.d.ts')],
    config: mlConfig,
  }),
  {
    name: 'functions',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('functions')],
    rnFirebaseModularFiles: [
      path.join(rnDist('functions'), 'index.d.ts'),
      path.join(rnDist('functions'), 'types', 'functions.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('functions'), 'HttpsError.d.ts'),
      path.join(rnDist('functions'), 'types', 'internal.d.ts'),
    ],
    config: functionsConfig,
  },
  {
    name: 'messaging',
    firebaseSdkTypesPaths: [requiredFirebaseTypes('messaging')],
    rnFirebaseModularFiles: [
      path.join(rnDist('messaging'), 'index.d.ts'),
      path.join(rnDist('messaging'), 'types', 'messaging.d.ts'),
    ],
    rnFirebaseSupportFiles: [
      path.join(rnDist('messaging'), 'statics.d.ts'),
      path.join(rnDist('messaging'), 'remoteMessageOptions.d.ts'),
      path.join(rnDist('messaging'), 'types', 'internal.d.ts'),
    ],
    config: messagingConfig,
  },
  rnOnlyPackage({
    name: 'phone-number-verification',
    rnFirebaseModularFiles: [path.join(rnDist('phone-number-verification'), 'index.d.ts')],
    rnFirebaseSupportFiles: [
      path.join(rnDist('phone-number-verification'), 'types', 'pnv.d.ts'),
    ],
    config: phoneNumberVerificationConfig,
  }),
];
