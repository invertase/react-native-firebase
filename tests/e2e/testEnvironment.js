/*
 * Detox test environment + run record: Detox boots the device during setup, before the
 * test file runs. Record the device instance here too (only if it started during this
 * run) so a Detox boot/init failure does not leave a device release can never free.
 *
 * Caveat: "started during this run" means booted while this process was alive, not
 * booted by it. If another owner boots this identity's exact device in the setup()
 * window, it is recorded too. Serial / slot identities make that a same-identity
 * collision (already contention), so the window is accepted.
 */
const DetoxCircusEnvironment = require('detox/runners/jest/testEnvironment');
const { recordRunDevice } = require('./runRecord');

function detoxPlatform() {
  let name = process.env.DETOX_CONFIGURATION || '';
  try {
    name = name || require('detox/internals').config?.configurationName || '';
  } catch (_) {
    // config unavailable before Detox resolves it
  }
  const lower = name.toLowerCase();
  if (lower.includes('android')) {
    return 'android';
  }
  if (lower.includes('ios')) {
    return 'ios';
  }
  return null;
}

class RnfbE2eEnvironment extends DetoxCircusEnvironment {
  async setup() {
    try {
      await super.setup();
    } finally {
      recordRunDevice(detoxPlatform());
    }
  }
}

module.exports = RnfbE2eEnvironment;
