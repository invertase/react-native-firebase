/**
 * Known differences between the firebase-js-sdk Firestore Pipelines API
 * and the @react-native-firebase/firestore pipelines API
 * (imported from "@react-native-firebase/firestore/pipelines").
 *
 * Reference: root node_modules/firebase Firestore Pipelines public types.
 * RN Firebase built types: packages/firestore/dist/typescript/lib/pipelines/*.d.ts
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 *
 * Sections:
 *  nameMapping     — exports that exist in both but under different names
 *  missingInRN     — JS SDK pipeline exports absent from RN Firebase
 *  extraInRN       — RN Firebase pipeline exports not in the JS SDK
 *  differentShape  — same export name but differing signatures/members
 */

import type { PackageConfig } from '../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [
    {
      name: 'documentMatches',
      reason:
        'Newer firebase-js-sdk document expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'geoDistance',
      reason:
        'Newer firebase-js-sdk geospatial expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'score',
      reason:
        'Newer firebase-js-sdk search score expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'DefineStageOptions',
      reason: 'Newer firebase-js-sdk stage options type not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'parent',
      reason: 'Newer firebase-js-sdk parent stage helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'SearchStageOptions',
      reason:
        'Newer firebase-js-sdk search stage options type not yet exposed by RN Firebase pipelines.',
    },
  ],
  extraInRN: [
    {
      name: 'Type',
      reason:
        'RN Firebase exposes a local type discriminator alias for pipeline expression helpers.',
    },
  ],
  differentShape: [
    {
      name: 'constant',
      reason:
        'firebase-js-sdk added an optional `preferIntegers` option to pipeline constant expressions; not yet exposed by RN Firebase pipelines.',
    },
  ],
};

export default config;
