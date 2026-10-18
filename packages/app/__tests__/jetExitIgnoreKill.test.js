const fs = require('fs');
const path = require('path');

const {
  killJetIgnoringExit,
  raceCallerErrorAgainstJetExit,
} = require('../../../tests/e2e/jetExitIgnoreKill');

const repoRoot = path.resolve(__dirname, '../../..');

describe('jetExitIgnoreKill (await-exit stall vs exitPromise race)', function () {
  it('sets ignoreExit before invoking kill', async function () {
    const events = [];
    await killJetIgnoringExit({
      setIgnoreExit: value => {
        events.push(['setIgnoreExit', value]);
      },
      kill: async () => {
        events.push(['kill']);
      },
    });
    expect(events).toEqual([['setIgnoreExit', true], ['kill']]);
  });

  it('preserves retryable stall error when ignoreExit gates the close handler', async function () {
    const stallErr = new Error(
      '[rnfb-e2e] Jet awaiting-jet-exit stalled 1200000ms after launch-ready — aborting cell',
    );
    stallErr.retryableAtJetLevel = true;

    let caught;
    try {
      await raceCallerErrorAgainstJetExit({
        callerError: stallErr,
        ignoreExitDuringKill: true,
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBe(stallErr);
    expect(caught.retryableAtJetLevel).toBe(true);
    expect(caught.message).toMatch(/awaiting-jet-exit stalled/);
  });

  it('NEGATIVE: without ignoreExit, bare Jet exit error wins the race', async function () {
    const stallErr = new Error(
      '[rnfb-e2e] Jet awaiting-jet-exit stalled 1200000ms after launch-ready — aborting cell',
    );
    stallErr.retryableAtJetLevel = true;

    let caught;
    try {
      await raceCallerErrorAgainstJetExit({
        callerError: stallErr,
        ignoreExitDuringKill: false,
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).not.toBe(stallErr);
    expect(caught.message).toBe('Jet tests failed!');
    expect(caught.retryableAtJetLevel).toBeUndefined();
  });

  it('firebase.test.js wires stall kill through killIgnoringExit (not bare killJetForLaunchRetry)', function () {
    const src = fs.readFileSync(path.join(repoRoot, 'tests/e2e/firebase.test.js'), 'utf8');
    const guardStart = src.indexOf('async function awaitJetExitWithStallGuard');
    const guardEnd = src.indexOf('async function killJetForLaunchRetry');
    expect(guardStart).toBeGreaterThan(-1);
    expect(guardEnd).toBeGreaterThan(guardStart);
    const guardBody = src.slice(guardStart, guardEnd);
    expect(guardBody).toMatch(/jetSession\.killIgnoringExit\(/);
    expect(guardBody).not.toMatch(/killJetForLaunchRetry\(/);
    expect(src).toMatch(/require\('\.\/jetExitIgnoreKill'\)/);
    expect(src).toMatch(/async killIgnoringExit\(/);
    expect(src).toMatch(/stall-kill-jet/);
    expect(src).toMatch(/stall-diagnostics/);
  });
});
