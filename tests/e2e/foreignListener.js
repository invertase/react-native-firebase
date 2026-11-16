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

const { execSync } = require('child_process');
const net = require('net');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * This user's LISTEN pids on `port`, or null when lsof is missing or did not
 * answer (an unknown owner must not read as "another user").
 */
function lsofListenPidsOrNull(port, env = process.env) {
  try {
    const out = execSync(
      `command -v lsof >/dev/null 2>&1 || exit 127; lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null; exit 0`,
      { encoding: 'utf8', timeout: 5000, env },
    );
    return out
      .split(/\s+/)
      .filter(Boolean)
      .filter(pid => /^\d+$/.test(pid));
  } catch (_) {
    return null;
  }
}

function tcpPortAccepts(port, host = '127.0.0.1', timeoutMs = 1000) {
  return new Promise(resolve => {
    const socket = net.connect(port, host);
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * lsof lists only this user's sockets, so another user's server on the port
 * (e.g. a root service in a cloud guest image) can never be stopped from here.
 * Throws when the port keeps accepting for `graceMs` with no listener lsof can
 * attribute to this user; returns when lsof cannot answer.
 */
async function failIfForeignListener(port, label, opts = {}) {
  const { graceMs = 2000, listPids = lsofListenPidsOrNull, accepts = tcpPortAccepts } = opts;
  const owned = () => {
    const pids = listPids(port);
    return pids === null || pids.length > 0;
  };
  if (owned()) {
    return;
  }
  const deadline = Date.now() + graceMs;
  do {
    if (!(await accepts(port))) {
      return;
    }
    await sleep(250);
  } while (Date.now() < deadline);
  if (owned()) {
    return;
  }
  throw new Error(
    `[rnfb-e2e] ${label}: 127.0.0.1:${port} accepts connections but has no listener lsof can attribute ` +
      `to this user (likely another user's process) owner=unrecorded; Jet and yarn tests:e2e:release ` +
      `cannot stop it. Free :${port} from its owner, or use a free slot: ` +
      `eval "$(yarn tests:e2e:export-slot-env <platform> N)" (yarn tests:e2e:check --services names one).`,
  );
}

module.exports = {
  failIfForeignListener,
  lsofListenPidsOrNull,
  tcpPortAccepts,
};
