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
  extraInRN: [
    { name: 'avg', reason: 'RN exports shorthand for average(); SDK uses average only.' },
  ],
  differentShape: [
    { name: 'cosineDistance', reason: 'RN uses unknown for vector param until VectorValue is wired in pipelines.' },
    { name: 'dotProduct', reason: 'RN uses unknown for vector param until VectorValue is wired in pipelines.' },
    { name: 'euclideanDistance', reason: 'RN uses unknown for vector param until VectorValue is wired in pipelines.' },
    { name: 'ltrim', reason: 'RN uses unknown for valueToTrim until Bytes is wired in pipelines.' },
    { name: 'rtrim', reason: 'RN uses unknown for valueToTrim until Bytes is wired in pipelines.' },
    { name: 'stringIndexOf', reason: 'RN uses unknown for search param until Bytes is wired in pipelines.' },
    { name: 'stringReplaceAll', reason: 'RN uses unknown for find/replacement params until Bytes is wired in pipelines.' },
    { name: 'stringReplaceOne', reason: 'RN uses unknown for find/replacement params until Bytes is wired in pipelines.' },
    { name: 'AddFieldsStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'AggregateStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'CollectionGroupStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'CollectionStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'DistinctStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'DocumentsStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'FindNearestStageOptions', reason: 'RN uses number[]|{values:number[]} for vectorValue; SDK uses VectorValue|number[].' },
    { name: 'LimitStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'OffsetStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'PipelineExecuteOptions', reason: 'RN omits rawOptions until native pipeline execution supports it.' },
    { name: 'RemoveFieldsStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'ReplaceWithStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'SampleStageOptions', reason: 'OneOf key order differs (documents|percentage); structurally equivalent.' },
    { name: 'SelectStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'SortStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'UnionStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'UnnestStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
    { name: 'WhereStageOptions', reason: 'JSDoc-only difference; structural shape matches SDK.' },
  ],
};

export default config;
