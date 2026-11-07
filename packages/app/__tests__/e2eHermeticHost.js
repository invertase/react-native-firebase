const fs = require('fs');
const os = require('os');
const path = require('path');

// Scratch TMPDIR, run record dir, and a fake adb first on PATH for tests that
// run the real check/release/packager scripts: nothing lands in the host temp
// dir or in this checkout's .e2e-run record, and the host adb server (:5037) is
// never started. The fake adb lists no devices and fails every other command,
// so app probes read "not running". Callers that strip RNFB_* from env() must
// set RNFB_E2E_RUN_RECORD_DIR to `runRecordDir` again.
function createHermeticHost(prefix = 'rnfb-hermetic-') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const tmp = path.join(root, 'tmp');
  const bin = path.join(root, 'bin');
  const runRecordDir = path.join(root, 'rec');
  fs.mkdirSync(tmp);
  fs.mkdirSync(bin);
  const adb = path.join(bin, 'adb');
  fs.writeFileSync(
    adb,
    `#!/bin/bash
if [[ "$1" == devices ]]; then
  echo 'List of devices attached'
  exit 0
fi
exit 1
`,
  );
  fs.chmodSync(adb, 0o755);
  return {
    root,
    tmp,
    bin,
    runRecordDir,
    env(base = process.env) {
      return {
        ...base,
        TMPDIR: tmp,
        RNFB_E2E_RUN_RECORD_DIR: runRecordDir,
        PATH: `${bin}:${base.PATH || '/usr/bin:/bin'}`,
      };
    },
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

module.exports = { createHermeticHost };
