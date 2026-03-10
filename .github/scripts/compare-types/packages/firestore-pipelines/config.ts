/**
 * Known differences between the firebase-js-sdk Firestore Pipelines API
 * and the @react-native-firebase/firestore pipelines API
 * (imported from "@react-native-firebase/firestore/pipelines").
 *
 * Reference: .github/scripts/compare-types/packages/firestore-pipelines/pipelines.d.ts (JS SDK).
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

import type { PackageConfig } from '../../src/types';


const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [],
  extraInRN: [],
  differentShape: [
    { name: 'AddFieldsStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'AggregateStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'CollectionGroupStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'CollectionStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'DistinctStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'DocumentsStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'FindNearestStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'ReplaceWithStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'SampleStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'SelectStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'SortStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'UnnestStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'WhereStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
  ],
};

export default config;
