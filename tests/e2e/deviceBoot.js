/**
 * Every harness (re)boot of a device must re-record the new instance (qemu / launchd_sim
 * pid + start time) so `yarn tests:e2e:release --devices` can stop it. The new instance
 * is spawned by the Detox worker, which is not a recorded pid, so nothing else makes it
 * this checkout's. Record even when the boot throws: the new instance may already be up.
 */
async function bootAndRecord(boot, record) {
  try {
    return await boot();
  } finally {
    try {
      record();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[rnfb-e2e] run record after device boot failed: ${err?.message || err}`);
    }
  }
}

module.exports = { bootAndRecord };
