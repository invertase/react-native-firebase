/*
 * Known differences between the firebase-js-sdk AI public API and the
 * @react-native-firebase/ai public API.
 *
 * Reference: .github/scripts/compare-types/packages/ai/firebase-sdk.d.ts (JS SDK snapshot).
 * RN Firebase built types: packages/ai/dist/typescript/lib/(any subdir)/*.d.ts
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 *
 * Sections:
 *  nameMapping     - exports that exist in both but under different names
 *  missingInRN     - firebase-js-sdk exports absent from RN Firebase
 *  extraInRN       - RN Firebase exports not present in the firebase-js-sdk
 *  differentShape  - exports present in both but with differing signatures/members
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [],
  extraInRN: [],
  differentShape: [],
};

export default config;
