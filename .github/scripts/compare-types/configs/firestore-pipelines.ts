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
      name: 'arrayFilter',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayFirst',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayFirstN',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayIndexOf',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayIndexOfAll',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayLast',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayLastIndexOf',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayLastN',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayMaximum',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayMaximumN',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayMinimum',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayMinimumN',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arraySlice',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayTransform',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'arrayTransformWithIndex',
      reason: 'Newer firebase-js-sdk array expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'coalesce',
      reason: 'Newer firebase-js-sdk expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'currentDocument',
      reason: 'Newer firebase-js-sdk document expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'documentMatches',
      reason: 'Newer firebase-js-sdk document expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'geoDistance',
      reason: 'Newer firebase-js-sdk geospatial expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'ifNull',
      reason: 'Newer firebase-js-sdk null-handling expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'nor',
      reason: 'Newer firebase-js-sdk boolean expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'score',
      reason: 'Newer firebase-js-sdk search score expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'subcollection',
      reason: 'Newer firebase-js-sdk subcollection stage helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'switchOn',
      reason: 'Newer firebase-js-sdk conditional expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'timestampDiff',
      reason: 'Newer firebase-js-sdk timestamp expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'timestampExtract',
      reason: 'Newer firebase-js-sdk timestamp expression helper not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'variable',
      reason: 'Newer firebase-js-sdk variable expression helper not yet exposed by RN Firebase pipelines.',
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
      reason: 'Newer firebase-js-sdk search stage options type not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'SubcollectionStageOptions',
      reason: 'Newer firebase-js-sdk subcollection stage options type not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'TimePart',
      reason: 'Newer firebase-js-sdk timestamp extraction type not yet exposed by RN Firebase pipelines.',
    },
    {
      name: 'TimeUnit',
      reason: 'Newer firebase-js-sdk timestamp unit type not yet exposed by RN Firebase pipelines.',
    },
  ],
  extraInRN: [
    {
      name: 'Type',
      reason: 'RN Firebase exposes a local type discriminator alias for pipeline expression helpers.',
    },
  ],
  differentShape: [
    {
      name: 'isType',
      reason: 'RN Firebase accepts its local `Type` alias where the firebase-js-sdk declaration accepts a string.',
    },
    {
      name: 'ExpressionType',
      reason: 'RN Firebase has not yet exposed the newer firebase-js-sdk `Variable` and `PipelineValue` expression kinds.',
    },
    {
      name: 'StageOptions',
      reason: 'Declaration formatting differs for the raw options object, but the public shape is equivalent.',
    },
    {
      name: 'TimeGranularity',
      reason: 'RN Firebase uses the existing `isoWeek` and `isoYear` casing while the firebase-js-sdk declaration includes lowercase variants.',
    },
  ],
};

export default config;
