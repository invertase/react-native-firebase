/* eslint-disable no-console */
/*
 * TCP listen ports by ownership (run record): kill only listeners this run spawned or
 * this checkout's runs recorded; any other holder fails fast and is never killed.
 */
const { execSync } = require('child_process');
const { describePid, foreignHolderError, isOwnedPid, pidOwner, recordPid } = require('./runRecord');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function listTcpListenPids(port) {
  let pidList = '';
  try {
    pidList = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null || true`, {
      encoding: 'utf8',
      timeout: 5000,
    }).trim();
  } catch (_) {
    return [];
  }
  return pidList
    .split(/\s+/)
    .filter(Boolean)
    .filter(pid => /^\d+$/.test(pid));
}

function listOwnedTcpListenPids(port) {
  return listTcpListenPids(port).filter(pid => isOwnedPid(pid));
}

// `category` is the yarn tests:e2e:release --only category for the fail-fast hint.
async function killTcpPortListener(port, label, category = 'jet') {
  if (listTcpListenPids(port).length === 0) {
    console.log(`[rnfb-e2e] ${label}: no listener on :${port}`);
    return;
  }

  let pids = listOwnedTcpListenPids(port);
  if (pids.length > 0) {
    console.warn(`[rnfb-e2e] ${label}: killing own listener on :${port} pid=${pids.join(',')}`);
    try {
      execSync(`kill ${pids.join(' ')}`, { stdio: 'inherit', timeout: 5000 });
    } catch (err) {
      console.warn(`[rnfb-e2e] ${label}: SIGTERM :${port} failed: ${err?.message || err}`);
    }
    await sleep(500);
    pids = listOwnedTcpListenPids(port);
  }
  if (pids.length > 0) {
    console.warn(`[rnfb-e2e] ${label}: SIGKILL own listener on :${port} pid=${pids.join(',')}`);
    try {
      execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'inherit', timeout: 5000 });
    } catch (err) {
      console.warn(`[rnfb-e2e] ${label}: SIGKILL :${port} failed: ${err?.message || err}`);
    }
    await sleep(500);
  }

  const foreign = listTcpListenPids(port).filter(pid => !isOwnedPid(pid));
  if (foreign.length > 0) {
    throw foreignHolderError(`${label}: :${port}`, foreign, category);
  }
}

/** For a port that stays open: what lsof sees on it now, with each holder's owner. */
function describeTcpListeners(port) {
  const pids = listTcpListenPids(port);
  if (pids.length === 0) {
    return `lsof lists no listener on :${port}`;
  }
  return pids.map(pid => `${describePid(pid)} owner=${pidOwner(pid)}`).join('; ');
}

/** Record owned listeners only (a foreign holder that won the bind is never recorded). */
function recordTcpPortListeners(port, label) {
  for (const pid of listOwnedTcpListenPids(port)) {
    recordPid(pid, label);
  }
}

module.exports = {
  describeTcpListeners,
  killTcpPortListener,
  listOwnedTcpListenPids,
  listTcpListenPids,
  recordTcpPortListeners,
};
