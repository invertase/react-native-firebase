/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// This suite runs under plain Jest/Node — not Metro — so it cannot prove the
// babel `transform-inline-environment-variables` static-inlining behaviour
// (tests/.babelrc + e2e proof on-device cover that). What it does prove is
// that the platform-routing / precedence logic in helpers.js itself is
// correct, independent of how `process.env` is populated at runtime.
const helpers = require('../e2e/helpers');

const ENV_KEYS = [
  'RNFB_ANDROID_METRO_PORT',
  'RNFB_IOS_METRO_PORT',
  'RNFB_MACOS_METRO_PORT',
  'RNFB_ANDROID_JET_PORT',
  'RNFB_IOS_JET_PORT',
  'RNFB_MACOS_JET_PORT',
  'RNFB_ANDROID_EMULATOR_FIRESTORE_PORT',
  'RNFB_IOS_EMULATOR_FIRESTORE_PORT',
  'RNFB_MACOS_EMULATOR_FIRESTORE_PORT',
  'JET_REMOTE_PORT',
  'JET_METRO_PORT',
  'RCT_METRO_PORT',
  'RNFB_METRO_PORT',
];

const originalEnv = {};
const originalPlatform = global.Platform;

function setPlatform(pk) {
  global.Platform = {
    android: pk === 'android',
    ios: pk === 'ios',
    other: pk === 'macos',
  };
}

beforeEach(() => {
  ENV_KEYS.forEach(key => {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  });
});

afterEach(() => {
  ENV_KEYS.forEach(key => {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  });
  global.Platform = originalPlatform;
});

describe('app e2e helpers — slotted env resolution', () => {
  describe('getE2ePlatformKey', () => {
    it('maps Platform flags to android/ios/macos', () => {
      setPlatform('android');
      expect(helpers.getE2ePlatformKey()).toBe('android');
      setPlatform('ios');
      expect(helpers.getE2ePlatformKey()).toBe('ios');
      setPlatform('macos');
      expect(helpers.getE2ePlatformKey()).toBe('macos');
    });
  });

  describe('getE2eEmulatorPort', () => {
    it('falls back to the built-in default when nothing is set', () => {
      setPlatform('ios');
      expect(helpers.getE2eEmulatorPort('firestore')).toBe(8080);
      expect(helpers.getE2eEmulatorPort('auth')).toBe(9099);
    });

    it('uses the platform-prefixed port for the active platform only', () => {
      process.env.RNFB_ANDROID_EMULATOR_FIRESTORE_PORT = '18080';
      process.env.RNFB_IOS_EMULATOR_FIRESTORE_PORT = '28080';
      process.env.RNFB_MACOS_EMULATOR_FIRESTORE_PORT = '38080';

      setPlatform('android');
      expect(helpers.getE2eEmulatorPort('firestore')).toBe(18080);
      setPlatform('ios');
      expect(helpers.getE2eEmulatorPort('firestore')).toBe(28080);
      setPlatform('macos');
      expect(helpers.getE2eEmulatorPort('firestore')).toBe(38080);
    });
  });

  describe('getJetRemotePort (finding #4: platform-prefixed first)', () => {
    it('defaults to 8090 when nothing is set', () => {
      setPlatform('ios');
      expect(helpers.getJetRemotePort()).toBe(8090);
    });

    it('prefers the platform-prefixed port over global JET_REMOTE_PORT', () => {
      setPlatform('macos');
      process.env.JET_REMOTE_PORT = '9000';
      process.env.RNFB_MACOS_JET_PORT = '9500';
      expect(helpers.getJetRemotePort()).toBe(9500);
    });

    it('falls back to JET_REMOTE_PORT when no platform-prefixed port is set', () => {
      setPlatform('android');
      process.env.JET_REMOTE_PORT = '9001';
      expect(helpers.getJetRemotePort()).toBe(9001);
    });
  });

  describe('getMetroPort (finding #8: JET_METRO_PORT is a fallback)', () => {
    it('defaults to 8081 when nothing is set', () => {
      setPlatform('ios');
      expect(helpers.getMetroPort()).toBe(8081);
    });

    it('prefers the platform-prefixed port over every other source', () => {
      setPlatform('ios');
      process.env.RCT_METRO_PORT = '7001';
      process.env.RNFB_METRO_PORT = '7002';
      process.env.JET_METRO_PORT = '7003';
      process.env.RNFB_IOS_METRO_PORT = '7100';
      expect(helpers.getMetroPort()).toBe(7100);
    });

    it('prefers RCT_METRO_PORT over RNFB_METRO_PORT and JET_METRO_PORT', () => {
      setPlatform('android');
      process.env.RCT_METRO_PORT = '7001';
      process.env.RNFB_METRO_PORT = '7002';
      process.env.JET_METRO_PORT = '7003';
      expect(helpers.getMetroPort()).toBe(7001);
    });

    it('prefers RNFB_METRO_PORT over JET_METRO_PORT', () => {
      setPlatform('android');
      process.env.RNFB_METRO_PORT = '7002';
      process.env.JET_METRO_PORT = '7003';
      expect(helpers.getMetroPort()).toBe(7002);
    });

    it('falls back to JET_METRO_PORT when nothing else is set', () => {
      setPlatform('android');
      process.env.JET_METRO_PORT = '7003';
      expect(helpers.getMetroPort()).toBe(7003);
    });
  });

  describe('getE2eEmulatorHost', () => {
    it('uses 10.0.2.2 on android and 127.0.0.1 on ios/macos (never localhost)', () => {
      setPlatform('android');
      expect(helpers.getE2eEmulatorHost()).toBe('10.0.2.2');
      setPlatform('ios');
      expect(helpers.getE2eEmulatorHost()).toBe('127.0.0.1');
      setPlatform('macos');
      expect(helpers.getE2eEmulatorHost()).toBe('127.0.0.1');
    });
  });

  describe('getJetRemoteUrl', () => {
    it('builds a ws:// url from host + resolved jet port', () => {
      setPlatform('android');
      expect(helpers.getJetRemoteUrl()).toBe('ws://10.0.2.2:8090');
      setPlatform('ios');
      expect(helpers.getJetRemoteUrl()).toBe('ws://127.0.0.1:8090');
    });
  });
});
