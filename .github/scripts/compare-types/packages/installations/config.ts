/**
 * Known differences between the firebase-js-sdk @firebase/installations public
 * API and the @react-native-firebase/installations modular API.
 *
 * Each entry must have a `name` (the export name) and a `reason` explaining
 * why the difference exists. Any difference NOT listed here will cause CI to
 * fail so that new drift is caught and deliberately acknowledged.
 */

import type { PackageConfig } from '../../src/types';

const config: PackageConfig = {
  nameMapping: {},
  missingInRN: [],
  extraInRN: [],
  differentShape: [],
};

export default config;
