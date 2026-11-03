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
const fs = require('fs');
const path = require('path');

// Every slot's macOS run has this same command line; only its Jet port tells
// slots apart, so the pattern alone must never select what to stop.
const MACOS_RUN_PATTERN = /tests:macos:test-cover|jet --target=macos/;
// Any of these in a run's environment means it is slotted (not on the serial port).
const SLOT_ENV_PATTERN =
  /(?:^|\s)(?:RNFB_E2E_SLOT|RNFB_E2E_HOST_SLOT|RNFB_(?:[A-Z]+_)?JET_(?:CONTROL_)?PORT|JET_REMOTE_PORT)=/;
const MAX_ANCESTOR_DEPTH = 32;

function lsofListenPids(port) {
  try {
    return execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null || true`, {
      encoding: 'utf8',
      timeout: 5000,
    })
      .split(/\s+/)
      .filter(pid => /^\d+$/.test(pid))
      .map(Number);
  } catch (_) {
    return [];
  }
}

/** `{ ppid, args }` for pid, or null when ps cannot see it. */
function psProcessInfo(pid) {
  try {
    const out = execSync(`ps -www -o ppid= -o args= -p ${pid} 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 5000,
    }).trim();
    const match = /^(\d+)\s+(.*)$/s.exec(out);
    return match ? { ppid: Number(match[1]), args: match[2] } : null;
  } catch (_) {
    return null;
  }
}

/** Every process as `{ pid, uid, args }`; empty when ps fails. */
function psListProcesses() {
  try {
    return execSync('ps -A -www -o pid= -o uid= -o args= 2>/dev/null', {
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 64 * 1024 * 1024,
    })
      .split('\n')
      .map(line => /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line))
      .filter(Boolean)
      .map(m => ({ pid: Number(m[1]), uid: Number(m[2]), args: m[3] }));
  } catch (_) {
    return [];
  }
}

/** Working directory of pid, or null when lsof cannot read it. */
function lsofCwd(pid) {
  try {
    const out = execSync(`lsof -a -p ${pid} -d cwd -Fn 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 5000,
    });
    const line = out.split('\n').find(l => l.startsWith('n'));
    return line ? line.slice(1) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Environment text of pid (macOS `ps -E` appends it after the args), or null
 * when ps shows none, as it does for a process it may not inspect.
 */
function psEnvironment(pid) {
  try {
    const opts = { encoding: 'utf8', timeout: 5000 };
    const args = execSync(`ps -www -o command= -p ${pid} 2>/dev/null`, opts).trim();
    const withEnv = execSync(`ps -www -E -o command= -p ${pid} 2>/dev/null`, opts).trim();
    if (!args || !withEnv.startsWith(args) || withEnv.length === args.length) {
      return null;
    }
    return withEnv.slice(args.length);
  } catch (_) {
    return null;
  }
}

function ancestorChain(pid, processInfo) {
  const chain = [];
  let cur = pid;
  while (cur > 1 && chain.length < MAX_ANCESTOR_DEPTH) {
    const info = processInfo(cur);
    if (!info) {
      break;
    }
    chain.push({ pid: cur, args: info.args });
    cur = info.ppid;
  }
  return chain;
}

function selfAndAncestors(selfPid, processInfo) {
  const pids = new Set(ancestorChain(selfPid, processInfo).map(p => p.pid));
  pids.add(selfPid);
  return pids;
}

function realpathOr(p) {
  try {
    return fs.realpathSync(p);
  } catch (_) {
    return p;
  }
}

/**
 * PIDs of the macOS run (Jet plus its yarn / bash / npx wrappers) whose process
 * tree listens on one of `ports`. A macOS run on any other port, such as another
 * slot's, is never returned, and neither is this process or any of its ancestors.
 *
 * @param {number[]} ports
 * @param {{ listPids?: (port: number) => number[], processInfo?: (pid: number) => ({ ppid: number, args: string } | null), selfPid?: number }} [opts]
 */
function macosRunPidsOnPorts(ports, opts = {}) {
  const { listPids = lsofListenPids, processInfo = psProcessInfo, selfPid = process.pid } = opts;
  const protectedPids = selfAndAncestors(selfPid, processInfo);

  const pids = new Set();
  for (const port of ports) {
    for (const listener of listPids(port)) {
      const chain = ancestorChain(listener, processInfo);
      let top = -1;
      chain.forEach((p, i) => {
        if (MACOS_RUN_PATTERN.test(p.args)) {
          top = i;
        }
      });
      for (const p of chain.slice(0, top + 1)) {
        if (!protectedPids.has(p.pid)) {
          pids.add(p.pid);
        }
      }
    }
  }
  return [...pids];
}

/**
 * PIDs of this user's serial (unslotted) macOS run processes whose cwd is under
 * `repoRoot`, including ones that have not bound the serial Jet port yet. A
 * process is skipped unless both its cwd and its environment are readable, its
 * cwd is in this checkout (not another worktree), and its environment carries
 * no slot variable (not a slot run from this checkout). This process and its
 * ancestors are never returned.
 *
 * @param {string} repoRoot
 * @param {{ listProcesses?: () => { pid: number, uid: number, args: string }[], processCwd?: (pid: number) => string | null, processEnv?: (pid: number) => string | null, processInfo?: (pid: number) => ({ ppid: number, args: string } | null), selfPid?: number, uid?: number }} [opts]
 */
function macosSerialRunPidsInRepo(repoRoot, opts = {}) {
  const {
    listProcesses = psListProcesses,
    processCwd = lsofCwd,
    processEnv = psEnvironment,
    processInfo = psProcessInfo,
    selfPid = process.pid,
    uid = typeof process.getuid === 'function' ? process.getuid() : undefined,
  } = opts;
  if (uid === undefined) {
    return [];
  }
  const root = realpathOr(path.resolve(repoRoot));
  const protectedPids = selfAndAncestors(selfPid, processInfo);

  const pids = [];
  for (const p of listProcesses()) {
    if (p.uid !== uid || protectedPids.has(p.pid) || !MACOS_RUN_PATTERN.test(p.args)) {
      continue;
    }
    const cwd = processCwd(p.pid);
    if (!cwd) {
      continue;
    }
    const real = realpathOr(cwd);
    if (real !== root && !real.startsWith(root + path.sep)) {
      continue;
    }
    const env = processEnv(p.pid);
    if (env === null || SLOT_ENV_PATTERN.test(env)) {
      continue;
    }
    pids.push(p.pid);
  }
  return pids;
}

module.exports = {
  MACOS_RUN_PATTERN,
  SLOT_ENV_PATTERN,
  lsofCwd,
  macosRunPidsOnPorts,
  macosSerialRunPidsInRepo,
  psEnvironment,
  psProcessInfo,
};
