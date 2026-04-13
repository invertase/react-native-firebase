import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [],
  extraInRN: [
    {
      name: 'ServerValue',
      reason:
        'Legacy static helper retained for backwards compatibility with the ' +
        'namespaced API. The firebase-js-sdk modular surface exposes only ' +
        '`serverTimestamp()` and `increment()` instead.',
    },
    {
      name: 'setPersistenceEnabled',
      reason:
        'RN Firebase-specific helper for configuring native database ' +
        'persistence. The firebase-js-sdk modular API does not expose this ' +
        'standalone function.',
    },
    {
      name: 'setLoggingEnabled',
      reason:
        'RN Firebase-specific helper for toggling native database logging. ' +
        'The firebase-js-sdk modular API exposes `enableLogging()` instead.',
    },
    {
      name: 'setPersistenceCacheSizeBytes',
      reason:
        'RN Firebase-specific helper for configuring the native persistence ' +
        'cache size. No equivalent standalone modular helper exists in the ' +
        'firebase-js-sdk.',
    },
    {
      name: 'getServerTime',
      reason:
        'RN Firebase-specific helper that reads native server time offset and ' +
        'returns the current server timestamp. No equivalent modular helper ' +
        'exists in the firebase-js-sdk.',
    },
    {
      name: 'keepSynced',
      reason:
        'RN Firebase-specific modular helper mirroring the native/database ' +
        'offline sync API. The firebase-js-sdk modular package does not export ' +
        'a standalone `keepSynced()` function.',
    },
  ],
  differentShape: [
    {
      name: 'EmulatorMockTokenOptions',
      reason:
        'RN Firebase reuses the local `FirebaseIdToken` alias in ' +
        '`Partial<FirebaseIdToken>`, while the snapshot inlines the token ' +
        'shape so compare-types does not treat the helper alias as an extra export. ' +
        'The two types are structurally equivalent.',
    },
    {
      name: 'EventType',
      reason:
        'RN Firebase re-exports the event union through the deprecated ' +
        '`FirebaseDatabaseTypes.EventType` alias in its split type layout, so ' +
        'the declaration text differs from the inline firebase-js-sdk union.',
    },
  ],
};

export default config;
