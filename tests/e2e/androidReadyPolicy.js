'use strict';

/**
 * CI settles the emulator and polls guest loadavg before the first Jet attempt.
 * Local skips that wait — matching the passing serial 1×3 (Android 1485) which
 * logged `android-ready: skipping settle/load (not CI)` then launched.
 *
 * Do not force local settle to paper over a different launch failure. A prior
 * attempt that always-settled locally then crashed in Fabric idling with
 * `ReactContext is null!` (~3s after `am instrument`) without proving the
 * skip-settle race.
 */
function shouldSkipAndroidSettleAndLoad(isCI) {
  return !isCI;
}

module.exports = {
  shouldSkipAndroidSettleAndLoad,
};
