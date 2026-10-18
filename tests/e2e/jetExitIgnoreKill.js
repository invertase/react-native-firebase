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

/**
 * Kill Jet while holding ignoreExit so an outer Promise.race that includes
 * exitPromise keeps the caller's error (e.g. await-exit stall with
 * retryableAtJetLevel) instead of a bare `Error('Jet tests failed!')` from close.
 *
 * Leaves ignoreExit true — late close/error must not settle exitPromise.
 * Launch-retry respawn clears ignoreExit only after binding a new process.
 *
 * @param {{ setIgnoreExit: (value: boolean) => void, kill: () => Promise<void> | void }} opts
 */
async function killJetIgnoringExit({ setIgnoreExit, kill }) {
  setIgnoreExit(true);
  await kill();
}

/**
 * Simulate runJetE2eAttempt's outer Promise.race vs awaitJetExitWithStallGuard:
 * stall wins the inner race, then kill closes Jet. Without ignoreExit, the same
 * exitPromise rejects and wins the outer race with a bare "Jet tests failed!".
 *
 * @param {{
 *   callerError: Error,
 *   ignoreExitDuringKill: boolean,
 *   simulateCloseAfterKill?: boolean,
 * }} opts
 */
async function raceCallerErrorAgainstJetExit({
  callerError,
  ignoreExitDuringKill,
  simulateCloseAfterKill = true,
}) {
  let ignoreExit = false;
  let rejectExit;
  const exitPromise = new Promise((_, reject) => {
    rejectExit = reject;
  });

  const onClose = code => {
    if (ignoreExit) {
      return;
    }
    if (code !== 0) {
      const err = new Error('Jet tests failed!');
      rejectExit(err);
    }
  };

  // Mirrors awaitJetExitWithStallGuard catch → kill → rethrow.
  const awaitExitWithStallGuard = async () => {
    try {
      throw callerError;
    } catch (err) {
      const kill = async () => {
        if (simulateCloseAfterKill) {
          onClose(1);
        }
      };
      if (ignoreExitDuringKill) {
        await killJetIgnoringExit({
          setIgnoreExit: value => {
            ignoreExit = value;
          },
          kill,
        });
      } else {
        await kill();
      }
      // Real killJetForLaunchRetry awaits port drain; give exit rejection time to win.
      await new Promise(resolve => setImmediate(resolve));
      throw err;
    }
  };

  // Mirrors runJetE2eAttempt: orchestrate/stall path raced with exitPromise.
  return Promise.race([
    awaitExitWithStallGuard(),
    exitPromise.then(
      value => value,
      err => {
        throw err;
      },
    ),
  ]);
}

module.exports = {
  killJetIgnoringExit,
  raceCallerErrorAgainstJetExit,
};
