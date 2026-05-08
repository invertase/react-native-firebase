import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [],
  extraInRN: [
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
      name: 'Database',
      reason:
        'RN Firebase narrows the public `type` member to the concrete `database` literal, while the firebase-js-sdk declaration leaves it less specific.',
    },
    {
      name: 'DataSnapshot',
      reason:
        'RN Firebase exposes native snapshot metadata helpers such as `key`, `priority`, and `size` on the public snapshot type.',
    },
    {
      name: 'OnDisconnect',
      reason:
        'The public method signatures are equivalent, but the generated declaration text differs in union ordering for the priority parameter.',
    },
  ],
};

export default config;
