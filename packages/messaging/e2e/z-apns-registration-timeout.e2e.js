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

async function isSimulator() {
  const DeviceInfo = require('react-native-device-info');
  return await DeviceInfo.isEmulator();
}

/**
 * APNs registration timeout / supersede behavior.
 * Filename `z-…` keeps this after other messaging specs.
 *
 * Runs on CI and locally (no isCI / isAPNSCapableSimulator gates — do not re-couple).
 *
 * On ARM64 Simulator the native module intentionally skips UIKit
 * registerForRemoteNotifications so main stays free; the global-queue 10s timeout
 * rejects with messaging/registration-timeout (asserted below). Physical devices
 * still call UIKit register. Overlapping register calls reject the prior attempt
 * with messaging/registration-superseded.
 */
describe('messaging() APNs registration timeout', function () {
  // With `messaging_ios_auto_register_for_remote_messages: true` (default), each
  // explicit `registerDeviceForRemoteMessages()` call in this spec emits a JS
  // `console.warn` reminding users the manual call is not required. Filter that
  // specific message so log noise does not mask real warnings; other warns still
  // pass through. The API contract this spec verifies (timeout / supersede) is
  // independent of the auto-register setting.
  const NOT_REQUIRED_MARKER = 'Usage of "registerDeviceForRemoteMessages()" is not required';
  let originalConsoleWarn;
  before(function () {
    // eslint-disable-next-line no-console
    originalConsoleWarn = console.warn;
    // eslint-disable-next-line no-console
    console.warn = function filteredWarn(...args) {
      if (typeof args[0] === 'string' && args[0].indexOf(NOT_REQUIRED_MARKER) !== -1) {
        return;
      }
      return originalConsoleWarn.apply(console, args);
    };
  });
  after(function () {
    // eslint-disable-next-line no-console
    console.warn = originalConsoleWarn;
  });

  it('settles registerDeviceForRemoteMessages within timeout bound on ios simulator', async function () {
    const {
      getMessaging,
      unregisterDeviceForRemoteMessages,
      isDeviceRegisteredForRemoteMessages,
      registerDeviceForRemoteMessages,
    } = messagingModular;

    if (!Platform.ios) {
      this.skip();
      return;
    }

    const simulator = await isSimulator();
    if (!simulator) {
      this.skip();
      return;
    }

    await unregisterDeviceForRemoteMessages(getMessaging());
    should.equal(isDeviceRegisteredForRemoteMessages(getMessaging()), false);

    const startedAt = Date.now();
    let settled;
    try {
      await registerDeviceForRemoteMessages(getMessaging());
      settled = { ok: true };
    } catch (e) {
      settled = { ok: false, error: e };
    }
    const elapsedMs = Date.now() - startedAt;
    // Native bound is 10s; allow slack for bridge + Mocha. Must not hang forever.
    elapsedMs.should.be.below(20000);

    if (settled.ok) {
      should.equal(
        isDeviceRegisteredForRemoteMessages(getMessaging()),
        true,
        'unexpected resolve without device registration',
      );
    } else {
      should.exist(settled.error, 'reject path must provide an error');
      settled.error.code.should.equal('messaging/registration-timeout');
      should.equal(
        isDeviceRegisteredForRemoteMessages(getMessaging()),
        false,
        'rejected registration must preserve the previous state',
      );
    }
  });

  it('rejects an in-flight register when a second registerDeviceForRemoteMessages starts', async function () {
    const { getMessaging, unregisterDeviceForRemoteMessages, registerDeviceForRemoteMessages } =
      messagingModular;

    if (!Platform.ios) {
      this.skip();
      return;
    }

    const simulator = await isSimulator();
    if (!simulator) {
      this.skip();
      return;
    }

    await unregisterDeviceForRemoteMessages(getMessaging());

    const first = registerDeviceForRemoteMessages(getMessaging());
    const second = registerDeviceForRemoteMessages(getMessaging());

    let firstError;
    try {
      await first;
    } catch (e) {
      firstError = e;
    }

    should.exist(firstError, 'first overlapping call must reject');
    firstError.code.should.equal('messaging/registration-superseded');
    firstError.message.should.containEql(
      'called again before the previous APNs registration attempt settled',
    );

    // Second call may timeout on ARM64 Simulator or resolve on capable hosts.
    try {
      await second;
    } catch (e) {
      e.code.should.equal('messaging/registration-timeout');
    }
  });
});
