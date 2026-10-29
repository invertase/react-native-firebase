#!/usr/bin/env node
'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) =>
  function __init() {
    return (fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res);
  };
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// ../config/dist/build-info.generated.js
var require_build_info_generated = __commonJS({
  '../config/dist/build-info.generated.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.stamped = void 0;
    exports2.stamped = {
      version: '0.1.0',
      commit: 'cd69c7ee1d15feac2f7587fa501b88512f4f0185',
      dirty: false,
      builtAt: '2026-10-29T19:19:11.935Z',
      source: 'git',
    };
  },
});

// ../config/dist/build-info.js
var require_build_info = __commonJS({
  '../config/dist/build-info.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.getBuildIdentity = getBuildIdentity;
    exports2.formatBuildIdentity = formatBuildIdentity;
    var node_fs_1 = require('node:fs');
    var node_path_1 = require('node:path');
    var build_info_generated_1 = require_build_info_generated();
    function readReleaseTip() {
      const candidates = [
        (0, node_path_1.join)(process.cwd(), 'RELEASE_TIP'),
        (0, node_path_1.join)(__dirname, '..', 'RELEASE_TIP'),
        (0, node_path_1.join)(__dirname, '..', '..', 'RELEASE_TIP'),
      ];
      for (const p of candidates) {
        if (!(0, node_fs_1.existsSync)(p)) {
          continue;
        }
        try {
          const tip = (0, node_fs_1.readFileSync)(p, 'utf8').trim().split(/\r?\n/)[0]?.trim();
          if (tip) {
            return tip;
          }
        } catch {}
      }
      return null;
    }
    function getBuildIdentity() {
      const base = {
        version: build_info_generated_1.stamped.version ?? null,
        commit: build_info_generated_1.stamped.commit ?? null,
        dirty: build_info_generated_1.stamped.dirty ?? null,
        builtAt: build_info_generated_1.stamped.builtAt ?? null,
        source: build_info_generated_1.stamped.source ?? null,
      };
      if (base.commit) {
        return base;
      }
      const tip = readReleaseTip();
      if (!tip) {
        return base;
      }
      return {
        version: base.version,
        commit: tip,
        dirty: false,
        builtAt: base.builtAt,
        source: 'release-tip',
      };
    }
    function formatBuildIdentity(b = getBuildIdentity()) {
      const commit = b.commit ?? 'null';
      const dirty = b.dirty === null ? 'null' : String(b.dirty);
      const version = b.version ?? 'null';
      const builtAt = b.builtAt ?? 'null';
      const source = b.source ?? 'null';
      return `version=${version} commit=${commit} dirty=${dirty} builtAt=${builtAt} source=${source}`;
    }
  },
});

// ../config/dist/errors.js
var require_errors = __commonJS({
  '../config/dist/errors.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.MelliferaConfigError = void 0;
    exports2.formatMode = formatMode;
    var MelliferaConfigError = class extends Error {
      code;
      file;
      constructor(code, message, file) {
        super(message);
        this.name = 'MelliferaConfigError';
        this.code = code;
        this.file = file;
      }
    };
    exports2.MelliferaConfigError = MelliferaConfigError;
    function formatMode(mode) {
      return `0${(mode & 511).toString(8).padStart(3, '0')}`;
    }
  },
});

// ../config/dist/host-budget.js
var require_host_budget = __commonJS({
  '../config/dist/host-budget.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.TART_CLASS_ID = exports2.DESK_SLOT_CLASS_ID = exports2.MAX_HOST_TART_GUESTS = void 0;
    exports2.parseHostBudget = parseHostBudget;
    exports2.loadHostBudget = loadHostBudget;
    exports2.federationBudget = federationBudget;
    exports2.tartShare = tartShare;
    exports2.deskSlotHostKey = deskSlotHostKey;
    exports2.checkLedgerAgainstBudget = checkLedgerAgainstBudget;
    var node_fs_1 = __importDefault2(require('node:fs'));
    var errors_1 = require_errors();
    exports2.MAX_HOST_TART_GUESTS = 2;
    exports2.DESK_SLOT_CLASS_ID = 'slot';
    exports2.TART_CLASS_ID = 'tart-macos-slot';
    var BACKEND_FOR_CLASS = {
      [exports2.TART_CLASS_ID]: 'tart',
      linux: 'colima',
      'linux-nested-virt': 'fusion',
    };
    function budgetError(file, detail) {
      return new errors_1.MelliferaConfigError(
        'host-budget-invalid',
        `host-budget-invalid: ${file}: ${detail}`,
        file,
      );
    }
    function budgetRefuse(file, detail) {
      return new errors_1.MelliferaConfigError(
        'host-budget-refused',
        `host-budget-refused: ${file}: ${detail}`,
        file,
      );
    }
    function isPlainObject(v) {
      return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
    }
    function parsePortRange(file, at, raw) {
      if (!isPlainObject(raw)) {
        throw budgetError(file, `${at} must be an object { min, max }`);
      }
      const min = raw.min;
      const max = raw.max;
      if (typeof min !== 'number' || !Number.isInteger(min) || min < 1 || min > 65535) {
        throw budgetError(file, `${at}.min must be an integer 1..65535`);
      }
      if (typeof max !== 'number' || !Number.isInteger(max) || max < 1 || max > 65535) {
        throw budgetError(file, `${at}.max must be an integer 1..65535`);
      }
      if (min > max) {
        throw budgetError(file, `${at}: min ${min} > max ${max}`);
      }
      return { min, max };
    }
    function parseDeskSlot(file, at, raw) {
      if (!isPlainObject(raw)) {
        throw budgetError(file, `${at} must be an object`);
      }
      const index = raw.index;
      const account = raw.account;
      const sshHostPublicKey = raw.sshHostPublicKey;
      if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
        throw budgetError(file, `${at}.index must be an integer >= 0`);
      }
      if (typeof account !== 'string' || account.trim() === '') {
        throw budgetError(file, `${at}.account must be a non-empty string`);
      }
      if (typeof sshHostPublicKey !== 'string' || sshHostPublicKey.trim() === '') {
        throw budgetError(file, `${at}.sshHostPublicKey must be a non-empty string`);
      }
      return {
        index,
        account: account.trim(),
        sshHostPublicKey: sshHostPublicKey.trim(),
      };
    }
    function parseFederation(file, fedId, raw) {
      if (!isPlainObject(raw)) {
        throw budgetError(file, `federations.${fedId} must be an object`);
      }
      if (!Array.isArray(raw.deskSlots)) {
        throw budgetError(file, `federations.${fedId}.deskSlots must be an array`);
      }
      const deskSlots = raw.deskSlots.map((slot, i) =>
        parseDeskSlot(file, `federations.${fedId}.deskSlots[${i}]`, slot),
      );
      const indexes = /* @__PURE__ */ new Set();
      const accounts = /* @__PURE__ */ new Set();
      for (const slot of deskSlots) {
        if (indexes.has(slot.index)) {
          throw budgetError(file, `federations.${fedId}: duplicate desk slot index ${slot.index}`);
        }
        indexes.add(slot.index);
        if (accounts.has(slot.account)) {
          throw budgetError(
            file,
            `federations.${fedId}: duplicate desk slot account ${slot.account}`,
          );
        }
        accounts.add(slot.account);
      }
      const tartGuests = raw.tartGuests;
      if (typeof tartGuests !== 'number' || !Number.isInteger(tartGuests) || tartGuests < 0) {
        throw budgetError(file, `federations.${fedId}.tartGuests must be an integer >= 0`);
      }
      let concurrentGuests;
      if (raw.concurrentGuests !== void 0) {
        if (!isPlainObject(raw.concurrentGuests)) {
          throw budgetError(file, `federations.${fedId}.concurrentGuests must be an object`);
        }
        concurrentGuests = {};
        for (const [backend, cap] of Object.entries(raw.concurrentGuests)) {
          if (backend !== 'tart' && backend !== 'colima' && backend !== 'fusion') {
            throw budgetError(
              file,
              `federations.${fedId}.concurrentGuests: unknown backend ${backend}`,
            );
          }
          if (typeof cap !== 'number' || !Number.isInteger(cap) || cap < 0) {
            throw budgetError(
              file,
              `federations.${fedId}.concurrentGuests.${backend} must be an integer >= 0`,
            );
          }
          concurrentGuests[backend] = cap;
        }
        if (concurrentGuests.tart !== void 0 && concurrentGuests.tart > tartGuests) {
          throw budgetError(
            file,
            `federations.${fedId}: concurrentGuests.tart (${concurrentGuests.tart}) exceeds tartGuests (${tartGuests})`,
          );
        }
      }
      const ports = parsePortRange(file, `federations.${fedId}.ports`, raw.ports);
      return { deskSlots, tartGuests, concurrentGuests, ports };
    }
    function parseHostBudget(file, raw) {
      if (!isPlainObject(raw)) {
        throw budgetError(file, 'root must be an object');
      }
      const version = raw.version;
      if (version !== 1) {
        throw budgetError(file, `version must be 1 (got ${String(version)})`);
      }
      if (!isPlainObject(raw.federations) || Object.keys(raw.federations).length === 0) {
        throw budgetError(file, 'federations must be a non-empty object');
      }
      const federations = {};
      let tartSum = 0;
      const hostDeskIndexes = /* @__PURE__ */ new Set();
      const hostAccounts = /* @__PURE__ */ new Set();
      for (const [fedId, fedRaw] of Object.entries(raw.federations)) {
        if (!fedId.trim()) {
          throw budgetError(file, 'federation id must be non-empty');
        }
        const fed = parseFederation(file, fedId, fedRaw);
        for (const slot of fed.deskSlots) {
          if (hostDeskIndexes.has(slot.index)) {
            throw budgetError(
              file,
              `desk slot index ${slot.index} assigned to more than one federation`,
            );
          }
          hostDeskIndexes.add(slot.index);
          if (hostAccounts.has(slot.account)) {
            throw budgetError(
              file,
              `desk slot account ${slot.account} assigned to more than one federation`,
            );
          }
          hostAccounts.add(slot.account);
        }
        for (const [otherId, other] of Object.entries(federations)) {
          if (rangesOverlap(fed.ports, other.ports)) {
            throw budgetError(
              file,
              `port ranges overlap between ${fedId} [${fed.ports.min}-${fed.ports.max}] and ${otherId} [${other.ports.min}-${other.ports.max}]`,
            );
          }
        }
        tartSum += fed.tartGuests;
        federations[fedId] = fed;
      }
      if (tartSum > exports2.MAX_HOST_TART_GUESTS) {
        throw budgetError(
          file,
          `sum of tartGuests is ${tartSum}; host cap is ${exports2.MAX_HOST_TART_GUESTS}`,
        );
      }
      return { version: 1, federations };
    }
    function rangesOverlap(a, b) {
      return a.min <= b.max && b.min <= a.max;
    }
    function loadHostBudget(file) {
      let text;
      try {
        text = node_fs_1.default.readFileSync(file, 'utf8');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new errors_1.MelliferaConfigError(
          'host-budget-missing',
          `host-budget-missing: ${file}: ${msg}`,
          file,
        );
      }
      let raw;
      try {
        raw = JSON.parse(text);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw budgetError(file, `JSON parse failed: ${msg}`);
      }
      return parseHostBudget(file, raw);
    }
    function federationBudget(budget, federationId) {
      return budget.federations[federationId];
    }
    function tartShare(fed) {
      return fed.tartGuests;
    }
    function deskSlotHostKey(fed, index) {
      return fed.deskSlots.find(s => s.index === index)?.sshHostPublicKey;
    }
    function checkLedgerAgainstBudget(file, budget, federationId, ledger, opts = {}) {
      const fed = budget.federations[federationId];
      if (!fed) {
        throw budgetRefuse(file, `federation ${federationId} is not in the host budget`);
      }
      if (ledger.federationId && ledger.federationId !== federationId) {
        throw budgetRefuse(
          file,
          `ledger federationId ${ledger.federationId} does not match ${federationId}`,
        );
      }
      const indexByAccount = new Map(fed.deskSlots.map(s => [s.account, s.index]));
      const allowedIndexes = new Set(fed.deskSlots.map(s => s.index));
      const allowedAccounts = new Set(fed.deskSlots.map(s => s.account));
      let tartCount = 0;
      const backendCounts = { tart: 0, colima: 0, fusion: 0 };
      for (const unit of ledger.units) {
        if (unit.classId === exports2.DESK_SLOT_CLASS_ID) {
          const index = Number.parseInt(unit.id, 10);
          if (!Number.isInteger(index) || String(index) !== unit.id) {
            throw budgetRefuse(file, `desk unit id ${unit.id} is not a slot index`);
          }
          if (!allowedIndexes.has(index)) {
            throw budgetRefuse(
              file,
              `desk slot index ${index} is outside federation ${federationId}`,
            );
          }
          if (unit.account) {
            if (!allowedAccounts.has(unit.account)) {
              throw budgetRefuse(
                file,
                `slot account ${unit.account} is outside federation ${federationId}`,
              );
            }
            const expected = indexByAccount.get(unit.account);
            if (expected !== index) {
              throw budgetRefuse(
                file,
                `slot account ${unit.account} belongs to index ${expected}, not ${index}`,
              );
            }
          }
          continue;
        }
        if (unit.account) {
          if (!allowedAccounts.has(unit.account)) {
            throw budgetRefuse(
              file,
              `slot account ${unit.account} is outside federation ${federationId}`,
            );
          }
        }
        const backend = BACKEND_FOR_CLASS[unit.classId];
        if (backend === 'tart') {
          tartCount += 1;
          backendCounts.tart += 1;
        } else if (backend) {
          backendCounts[backend] += 1;
        }
      }
      if (tartCount > fed.tartGuests) {
        throw budgetRefuse(
          file,
          `ledger has ${tartCount} ${exports2.TART_CLASS_ID} unit(s); federation ${federationId} tartGuests=${fed.tartGuests}`,
        );
      }
      if (fed.concurrentGuests) {
        for (const backend of Object.keys(backendCounts)) {
          const cap = fed.concurrentGuests[backend];
          if (cap === void 0) continue;
          if (backendCounts[backend] > cap) {
            throw budgetRefuse(
              file,
              `ledger has ${backendCounts[backend]} ${backend} unit(s); concurrentGuests.${backend}=${cap}`,
            );
          }
        }
      }
      for (const port of opts.ports ?? []) {
        if (port < fed.ports.min || port > fed.ports.max) {
          throw budgetRefuse(
            file,
            `port ${port} is outside federation ${federationId} range ${fed.ports.min}-${fed.ports.max}`,
          );
        }
      }
    }
  },
});

// ../config/dist/instance.js
var require_instance = __commonJS({
  '../config/dist/instance.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.HOST_BUDGET_FILE_NAME =
      exports2.DEFAULT_INSTANCE =
      exports2.DEFAULT_FEDERATION_ID =
      exports2.CONFIG_FILE_NAME =
      exports2.CONFIG_DIR_NAME =
      exports2.INSTANCE_KINDS =
        void 0;
    exports2.isInstanceKind = isInstanceKind;
    exports2.melliferaHome = melliferaHome;
    exports2.resolveHostBudgetPath = resolveHostBudgetPath;
    exports2.resolveInstanceDir = resolveInstanceDir;
    exports2.instanceConfigPath = instanceConfigPath;
    exports2.instanceStatePath = instanceStatePath;
    exports2.instanceLedgerPath = instanceLedgerPath;
    exports2.resolveInstanceDirFromEnv = resolveInstanceDirFromEnv;
    var node_os_1 = __importDefault2(require('node:os'));
    var node_path_1 = __importDefault2(require('node:path'));
    exports2.INSTANCE_KINDS = ['global', 'local', 'scaler', 'adapter', 'bastion'];
    exports2.CONFIG_DIR_NAME = '.mellifera';
    exports2.CONFIG_FILE_NAME = 'config.jsonc';
    exports2.DEFAULT_FEDERATION_ID = 'default';
    exports2.DEFAULT_INSTANCE = 'local';
    exports2.HOST_BUDGET_FILE_NAME = 'host-budget.json';
    function isInstanceKind(value) {
      return exports2.INSTANCE_KINDS.includes(value);
    }
    function melliferaHome(home = node_os_1.default.homedir()) {
      return node_path_1.default.join(home, exports2.CONFIG_DIR_NAME);
    }
    function resolveHostBudgetPath(home = node_os_1.default.homedir()) {
      return node_path_1.default.join(melliferaHome(home), exports2.HOST_BUDGET_FILE_NAME);
    }
    function resolveInstanceDir(input) {
      const federationId = input.federationId.trim();
      const instance = input.instance.trim();
      if (!federationId) {
        throw new Error('federationId is required');
      }
      if (!instance) {
        throw new Error('instance is required');
      }
      const home = input.home ?? node_os_1.default.homedir();
      return node_path_1.default.join(melliferaHome(home), federationId, instance);
    }
    function instanceConfigPath(instanceDir) {
      return node_path_1.default.join(instanceDir, exports2.CONFIG_FILE_NAME);
    }
    function instanceStatePath(instanceDir) {
      return node_path_1.default.join(instanceDir, 'state.json');
    }
    function instanceLedgerPath(instanceDir) {
      return node_path_1.default.join(instanceDir, 'ledger.json');
    }
    function resolveInstanceDirFromEnv(env = process.env, home) {
      const explicit = env.MELLIFERA_INSTANCE_DIR;
      if (explicit && explicit.trim() !== '') {
        return node_path_1.default.resolve(explicit.trim());
      }
      const federationId =
        (env.MELLIFERA_FEDERATION_ID || exports2.DEFAULT_FEDERATION_ID).trim() ||
        exports2.DEFAULT_FEDERATION_ID;
      const instance =
        (env.MELLIFERA_INSTANCE || exports2.DEFAULT_INSTANCE).trim() || exports2.DEFAULT_INSTANCE;
      return resolveInstanceDir({
        federationId,
        instance,
        home: home ?? env.HOME ?? node_os_1.default.homedir(),
      });
    }
  },
});

// ../../node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0,
    value = '',
    tokenOffset = 0,
    token = 16,
    lineNumber = 0,
    lineStartOffset = 0,
    tokenLineStartOffset = 0,
    prevTokenLineStartOffset = 0,
    scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = '';
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if ((pos < text.length && text.charCodeAt(pos) === 43) || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = '',
      start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += '\\';
            break;
          case 47:
            result += '/';
            break;
          case 98:
            result += '\b';
            break;
          case 102:
            result += '\f';
            break;
          case 110:
            result += '\n';
            break;
          case 114:
            result += '\r';
            break;
          case 116:
            result += '	';
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = '';
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return (token = 17);
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return (token = 15);
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += '\n';
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return (token = 14);
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return (token = 1);
      case 125:
        pos++;
        return (token = 2);
      case 91:
        pos++;
        return (token = 3);
      case 93:
        pos++;
        return (token = 4);
      case 58:
        pos++;
        return (token = 6);
      case 44:
        pos++;
        return (token = 5);
      // strings
      case 34:
        pos++;
        value = scanString();
        return (token = 10);
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return (token = 12);
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return (token = 13);
        }
        value += String.fromCharCode(code);
        pos++;
        return (token = 16);
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return (token = 16);
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return (token = 11);
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case 'true':
              return (token = 8);
            case 'false':
              return (token = 9);
            case 'null':
              return (token = 7);
          }
          return (token = 16);
        }
        value += String.fromCharCode(code);
        pos++;
        return (token = 16);
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError,
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
var init_scanner = __esm({
  '../../node_modules/jsonc-parser/lib/esm/impl/scanner.js'() {
    'use strict';
    (function (CharacterCodes2) {
      CharacterCodes2[(CharacterCodes2['lineFeed'] = 10)] = 'lineFeed';
      CharacterCodes2[(CharacterCodes2['carriageReturn'] = 13)] = 'carriageReturn';
      CharacterCodes2[(CharacterCodes2['space'] = 32)] = 'space';
      CharacterCodes2[(CharacterCodes2['_0'] = 48)] = '_0';
      CharacterCodes2[(CharacterCodes2['_1'] = 49)] = '_1';
      CharacterCodes2[(CharacterCodes2['_2'] = 50)] = '_2';
      CharacterCodes2[(CharacterCodes2['_3'] = 51)] = '_3';
      CharacterCodes2[(CharacterCodes2['_4'] = 52)] = '_4';
      CharacterCodes2[(CharacterCodes2['_5'] = 53)] = '_5';
      CharacterCodes2[(CharacterCodes2['_6'] = 54)] = '_6';
      CharacterCodes2[(CharacterCodes2['_7'] = 55)] = '_7';
      CharacterCodes2[(CharacterCodes2['_8'] = 56)] = '_8';
      CharacterCodes2[(CharacterCodes2['_9'] = 57)] = '_9';
      CharacterCodes2[(CharacterCodes2['a'] = 97)] = 'a';
      CharacterCodes2[(CharacterCodes2['b'] = 98)] = 'b';
      CharacterCodes2[(CharacterCodes2['c'] = 99)] = 'c';
      CharacterCodes2[(CharacterCodes2['d'] = 100)] = 'd';
      CharacterCodes2[(CharacterCodes2['e'] = 101)] = 'e';
      CharacterCodes2[(CharacterCodes2['f'] = 102)] = 'f';
      CharacterCodes2[(CharacterCodes2['g'] = 103)] = 'g';
      CharacterCodes2[(CharacterCodes2['h'] = 104)] = 'h';
      CharacterCodes2[(CharacterCodes2['i'] = 105)] = 'i';
      CharacterCodes2[(CharacterCodes2['j'] = 106)] = 'j';
      CharacterCodes2[(CharacterCodes2['k'] = 107)] = 'k';
      CharacterCodes2[(CharacterCodes2['l'] = 108)] = 'l';
      CharacterCodes2[(CharacterCodes2['m'] = 109)] = 'm';
      CharacterCodes2[(CharacterCodes2['n'] = 110)] = 'n';
      CharacterCodes2[(CharacterCodes2['o'] = 111)] = 'o';
      CharacterCodes2[(CharacterCodes2['p'] = 112)] = 'p';
      CharacterCodes2[(CharacterCodes2['q'] = 113)] = 'q';
      CharacterCodes2[(CharacterCodes2['r'] = 114)] = 'r';
      CharacterCodes2[(CharacterCodes2['s'] = 115)] = 's';
      CharacterCodes2[(CharacterCodes2['t'] = 116)] = 't';
      CharacterCodes2[(CharacterCodes2['u'] = 117)] = 'u';
      CharacterCodes2[(CharacterCodes2['v'] = 118)] = 'v';
      CharacterCodes2[(CharacterCodes2['w'] = 119)] = 'w';
      CharacterCodes2[(CharacterCodes2['x'] = 120)] = 'x';
      CharacterCodes2[(CharacterCodes2['y'] = 121)] = 'y';
      CharacterCodes2[(CharacterCodes2['z'] = 122)] = 'z';
      CharacterCodes2[(CharacterCodes2['A'] = 65)] = 'A';
      CharacterCodes2[(CharacterCodes2['B'] = 66)] = 'B';
      CharacterCodes2[(CharacterCodes2['C'] = 67)] = 'C';
      CharacterCodes2[(CharacterCodes2['D'] = 68)] = 'D';
      CharacterCodes2[(CharacterCodes2['E'] = 69)] = 'E';
      CharacterCodes2[(CharacterCodes2['F'] = 70)] = 'F';
      CharacterCodes2[(CharacterCodes2['G'] = 71)] = 'G';
      CharacterCodes2[(CharacterCodes2['H'] = 72)] = 'H';
      CharacterCodes2[(CharacterCodes2['I'] = 73)] = 'I';
      CharacterCodes2[(CharacterCodes2['J'] = 74)] = 'J';
      CharacterCodes2[(CharacterCodes2['K'] = 75)] = 'K';
      CharacterCodes2[(CharacterCodes2['L'] = 76)] = 'L';
      CharacterCodes2[(CharacterCodes2['M'] = 77)] = 'M';
      CharacterCodes2[(CharacterCodes2['N'] = 78)] = 'N';
      CharacterCodes2[(CharacterCodes2['O'] = 79)] = 'O';
      CharacterCodes2[(CharacterCodes2['P'] = 80)] = 'P';
      CharacterCodes2[(CharacterCodes2['Q'] = 81)] = 'Q';
      CharacterCodes2[(CharacterCodes2['R'] = 82)] = 'R';
      CharacterCodes2[(CharacterCodes2['S'] = 83)] = 'S';
      CharacterCodes2[(CharacterCodes2['T'] = 84)] = 'T';
      CharacterCodes2[(CharacterCodes2['U'] = 85)] = 'U';
      CharacterCodes2[(CharacterCodes2['V'] = 86)] = 'V';
      CharacterCodes2[(CharacterCodes2['W'] = 87)] = 'W';
      CharacterCodes2[(CharacterCodes2['X'] = 88)] = 'X';
      CharacterCodes2[(CharacterCodes2['Y'] = 89)] = 'Y';
      CharacterCodes2[(CharacterCodes2['Z'] = 90)] = 'Z';
      CharacterCodes2[(CharacterCodes2['asterisk'] = 42)] = 'asterisk';
      CharacterCodes2[(CharacterCodes2['backslash'] = 92)] = 'backslash';
      CharacterCodes2[(CharacterCodes2['closeBrace'] = 125)] = 'closeBrace';
      CharacterCodes2[(CharacterCodes2['closeBracket'] = 93)] = 'closeBracket';
      CharacterCodes2[(CharacterCodes2['colon'] = 58)] = 'colon';
      CharacterCodes2[(CharacterCodes2['comma'] = 44)] = 'comma';
      CharacterCodes2[(CharacterCodes2['dot'] = 46)] = 'dot';
      CharacterCodes2[(CharacterCodes2['doubleQuote'] = 34)] = 'doubleQuote';
      CharacterCodes2[(CharacterCodes2['minus'] = 45)] = 'minus';
      CharacterCodes2[(CharacterCodes2['openBrace'] = 123)] = 'openBrace';
      CharacterCodes2[(CharacterCodes2['openBracket'] = 91)] = 'openBracket';
      CharacterCodes2[(CharacterCodes2['plus'] = 43)] = 'plus';
      CharacterCodes2[(CharacterCodes2['slash'] = 47)] = 'slash';
      CharacterCodes2[(CharacterCodes2['formFeed'] = 12)] = 'formFeed';
      CharacterCodes2[(CharacterCodes2['tab'] = 9)] = 'tab';
    })(CharacterCodes || (CharacterCodes = {}));
  },
});

// ../../node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces, maxCachedValues, cachedBreakLinesWithSpaces, supportedEols;
var init_string_intern = __esm({
  '../../node_modules/jsonc-parser/lib/esm/impl/string-intern.js'() {
    cachedSpaces = new Array(20).fill(0).map((_, index) => {
      return ' '.repeat(index);
    });
    maxCachedValues = 200;
    cachedBreakLinesWithSpaces = {
      ' ': {
        '\n': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\n' + ' '.repeat(index);
        }),
        '\r': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\r' + ' '.repeat(index);
        }),
        '\r\n': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\r\n' + ' '.repeat(index);
        }),
      },
      '	': {
        '\n': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\n' + '	'.repeat(index);
        }),
        '\r': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\r' + '	'.repeat(index);
        }),
        '\r\n': new Array(maxCachedValues).fill(0).map((_, index) => {
          return '\r\n' + '	'.repeat(index);
        }),
      },
    };
    supportedEols = ['\n', '\r', '\r\n'];
  },
});

// ../../node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue =
      cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = '	';
  }
  const indentType = indentValue === '	' ? '	' : ' ';
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (
      !eolFastPathSupported ||
      amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length
    ) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (
      !hasError &&
      (!range || (startOffset < rangeEnd && endOffset > rangeStart)) &&
      documentText.substring(startOffset, endOffset) !== text
    ) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent =
      indentValue.length * initialIndentLevel < 20 && options.insertSpaces
        ? cachedSpaces[indentValue.length * initialIndentLevel]
        : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = '';
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : '';
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      if ((options.keepLines && numberLineBreaks > 0) || (!options.keepLines && firstToken !== 1)) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      if ((options.keepLines && numberLineBreaks > 0) || (!options.keepLines && firstToken !== 3)) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if ((options.keepLines && numberLineBreaks > 0) || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if ((options.keepLines && numberLineBreaks > 0) || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = '';
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : '';
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content.length) {
    let ch = content.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === '	') {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === '\r') {
      if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
        return '\r\n';
      }
      return '\r';
    } else if (ch === '\n') {
      return '\n';
    }
  }
  return (options && options.eol) || '\n';
}
function isEOL(text, offset) {
  return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}
var init_format = __esm({
  '../../node_modules/jsonc-parser/lib/esm/impl/format.js'() {
    'use strict';
    init_scanner();
    init_string_intern();
  },
});

// ../../node_modules/jsonc-parser/lib/esm/impl/parser.js
function getLocation(text, position) {
  const segments = [];
  const earlyReturnException = new Object();
  let previousNode = void 0;
  const previousNodeInst = {
    value: {},
    offset: 0,
    length: 0,
    type: 'object',
    parent: void 0,
  };
  let isAtPropertyKey = false;
  function setPreviousNode(value, offset, length, type) {
    previousNodeInst.value = value;
    previousNodeInst.offset = offset;
    previousNodeInst.length = length;
    previousNodeInst.type = type;
    previousNodeInst.colonOffset = void 0;
    previousNode = previousNodeInst;
  }
  try {
    visit(text, {
      onObjectBegin: (offset, length) => {
        if (position <= offset) {
          throw earlyReturnException;
        }
        previousNode = void 0;
        isAtPropertyKey = position > offset;
        segments.push('');
      },
      onObjectProperty: (name, offset, length) => {
        if (position < offset) {
          throw earlyReturnException;
        }
        setPreviousNode(name, offset, length, 'property');
        segments[segments.length - 1] = name;
        if (position <= offset + length) {
          throw earlyReturnException;
        }
      },
      onObjectEnd: (offset, length) => {
        if (position <= offset) {
          throw earlyReturnException;
        }
        previousNode = void 0;
        segments.pop();
      },
      onArrayBegin: (offset, length) => {
        if (position <= offset) {
          throw earlyReturnException;
        }
        previousNode = void 0;
        segments.push(0);
      },
      onArrayEnd: (offset, length) => {
        if (position <= offset) {
          throw earlyReturnException;
        }
        previousNode = void 0;
        segments.pop();
      },
      onLiteralValue: (value, offset, length) => {
        if (position < offset) {
          throw earlyReturnException;
        }
        setPreviousNode(value, offset, length, getNodeType(value));
        if (position <= offset + length) {
          throw earlyReturnException;
        }
      },
      onSeparator: (sep, offset, length) => {
        if (position <= offset) {
          throw earlyReturnException;
        }
        if (sep === ':' && previousNode && previousNode.type === 'property') {
          previousNode.colonOffset = offset;
          isAtPropertyKey = false;
          previousNode = void 0;
        } else if (sep === ',') {
          const last = segments[segments.length - 1];
          if (typeof last === 'number') {
            segments[segments.length - 1] = last + 1;
          } else {
            isAtPropertyKey = true;
            segments[segments.length - 1] = '';
          }
          previousNode = void 0;
        }
      },
    });
  } catch (e) {
    if (e !== earlyReturnException) {
      throw e;
    }
  }
  return {
    path: segments,
    previousNode,
    isAtPropertyKey,
    matches: pattern => {
      let k = 0;
      for (let i = 0; k < pattern.length && i < segments.length; i++) {
        if (pattern[k] === segments[i] || pattern[k] === '*') {
          k++;
        } else if (pattern[k] !== '**') {
          return false;
        }
      }
      return k === pattern.length;
    },
  };
}
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: name => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    },
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function parseTree(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === 'property') {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: offset => {
      currentParent = onValue({
        type: 'object',
        offset,
        length: -1,
        parent: currentParent,
        children: [],
      });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({
        type: 'property',
        offset,
        length: -1,
        parent: currentParent,
        children: [],
      });
      currentParent.children.push({
        type: 'string',
        value: name,
        offset,
        length,
        parent: currentParent,
      });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({
        type: 'array',
        offset,
        length: -1,
        parent: currentParent,
        children: [],
      });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep, offset, length) => {
      if (currentParent.type === 'property') {
        if (sep === ':') {
          currentParent.colonOffset = offset;
        } else if (sep === ',') {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    },
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (let segment of path) {
    if (typeof segment === 'string') {
      if (node.type !== 'object' || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (
          Array.isArray(propertyNode.children) &&
          propertyNode.children[0].value === segment &&
          propertyNode.children.length === 2
        ) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index = segment;
      if (
        node.type !== 'array' ||
        index < 0 ||
        !Array.isArray(node.children) ||
        index >= node.children.length
      ) {
        return void 0;
      }
      node = node.children[index];
    }
  }
  return node;
}
function getNodePath(node) {
  if (!node.parent || !node.parent.children) {
    return [];
  }
  const path = getNodePath(node.parent);
  if (node.parent.type === 'property') {
    const key = node.parent.children[0].value;
    path.push(key);
  } else if (node.parent.type === 'array') {
    const index = node.parent.children.indexOf(node);
    if (index !== -1) {
      path.push(index);
    }
  }
  return path;
}
function getNodeValue(node) {
  switch (node.type) {
    case 'array':
      return node.children.map(getNodeValue);
    case 'object':
      const obj = /* @__PURE__ */ Object.create(null);
      for (let prop of node.children) {
        const valueNode = prop.children[1];
        if (valueNode) {
          obj[prop.children[0].value] = getNodeValue(valueNode);
        }
      }
      return obj;
    case 'null':
    case 'string':
    case 'number':
    case 'boolean':
      return node.value;
    default:
      return void 0;
  }
}
function contains(node, offset, includeRightBound = false) {
  return (
    (offset >= node.offset && offset < node.offset + node.length) ||
    (includeRightBound && offset === node.offset + node.length)
  );
}
function findNodeAtOffset(node, offset, includeRightBound = false) {
  if (contains(node, offset, includeRightBound)) {
    const children = node.children;
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
        const item = findNodeAtOffset(children[i], offset, includeRightBound);
        if (item) {
          return item;
        }
      }
    }
    return node;
  }
  return void 0;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction
      ? () =>
          suppressedCallbacks === 0 &&
          visitFunction(
            _scanner.getTokenOffset(),
            _scanner.getTokenLength(),
            _scanner.getTokenStartLine(),
            _scanner.getTokenStartCharacter(),
          )
      : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction
      ? arg =>
          suppressedCallbacks === 0 &&
          visitFunction(
            arg,
            _scanner.getTokenOffset(),
            _scanner.getTokenLength(),
            _scanner.getTokenStartLine(),
            _scanner.getTokenStartCharacter(),
          )
      : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction
      ? arg =>
          suppressedCallbacks === 0 &&
          visitFunction(
            arg,
            _scanner.getTokenOffset(),
            _scanner.getTokenLength(),
            _scanner.getTokenStartLine(),
            _scanner.getTokenStartCharacter(),
            () => _jsonPath.slice(),
          )
      : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction
      ? () => {
          if (suppressedCallbacks > 0) {
            suppressedCallbacks++;
          } else {
            let cbReturn = visitFunction(
              _scanner.getTokenOffset(),
              _scanner.getTokenLength(),
              _scanner.getTokenStartLine(),
              _scanner.getTokenStartCharacter(),
              () => _jsonPath.slice(),
            );
            if (cbReturn === false) {
              suppressedCallbacks = 1;
            }
          }
        }
      : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction
      ? () => {
          if (suppressedCallbacks > 0) {
            suppressedCallbacks--;
          }
          if (suppressedCallbacks === 0) {
            visitFunction(
              _scanner.getTokenOffset(),
              _scanner.getTokenLength(),
              _scanner.getTokenStartLine(),
              _scanner.getTokenStartCharacter(),
            );
          }
        }
      : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin),
    onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty),
    onObjectEnd = toEndVisit(visitor.onObjectEnd),
    onArrayBegin = toBeginVisit(visitor.onArrayBegin),
    onArrayEnd = toEndVisit(visitor.onArrayEnd),
    onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue),
    onSeparator = toOneArgVisit(visitor.onSeparator),
    onComment = toNoArgVisit(visitor.onComment),
    onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14,
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15,
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13,
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11,
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12,
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16,
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10,
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1,
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2,
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(
        3,
        [],
        [
          2, 5,
          /* SyntaxKind.CommaToken */
        ],
      );
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(':');
      scanNext();
      if (!parseValue()) {
        handleError(
          4,
          [],
          [
            2, 5,
            /* SyntaxKind.CommaToken */
          ],
        );
      }
    } else {
      handleError(
        5,
        [],
        [
          2, 5,
          /* SyntaxKind.CommaToken */
        ],
      );
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(',');
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(
          4,
          [],
          [
            2, 5,
            /* SyntaxKind.CommaToken */
          ],
        );
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(
        7,
        [
          2,
          /* SyntaxKind.CloseBraceToken */
        ],
        [],
      );
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(',');
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(
          4,
          [],
          [
            4, 5,
            /* SyntaxKind.CommaToken */
          ],
        );
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(
        8,
        [
          4,
          /* SyntaxKind.CloseBracketToken */
        ],
        [],
      );
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function stripComments(text, replaceCh) {
  let _scanner = createScanner(text),
    parts = [],
    kind,
    offset = 0,
    pos;
  do {
    pos = _scanner.getPosition();
    kind = _scanner.scan();
    switch (kind) {
      case 12:
      case 13:
      case 17:
        if (offset !== pos) {
          parts.push(text.substring(offset, pos));
        }
        if (replaceCh !== void 0) {
          parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
        }
        offset = _scanner.getPosition();
        break;
    }
  } while (kind !== 17);
  return parts.join('');
}
function getNodeType(value) {
  switch (typeof value) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'object': {
      if (!value) {
        return 'null';
      } else if (Array.isArray(value)) {
        return 'array';
      }
      return 'object';
    }
    default:
      return 'null';
  }
}
var ParseOptions;
var init_parser = __esm({
  '../../node_modules/jsonc-parser/lib/esm/impl/parser.js'() {
    'use strict';
    init_scanner();
    (function (ParseOptions2) {
      ParseOptions2.DEFAULT = {
        allowTrailingComma: false,
      };
    })(ParseOptions || (ParseOptions = {}));
  },
});

// ../../node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path = originalPath.slice();
  const errors = [];
  const root = parseTree(text, errors);
  let parent = void 0;
  let lastSegment = void 0;
  while (path.length > 0) {
    lastSegment = path.pop();
    parent = findNodeAtLocation(root, path);
    if (parent === void 0 && value !== void 0) {
      if (typeof lastSegment === 'string') {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === void 0) {
      throw new Error('Can not delete in empty document');
    }
    return withFormatting(
      text,
      {
        offset: root ? root.offset : 0,
        length: root ? root.length : 0,
        content: JSON.stringify(value),
      },
      options,
    );
  } else if (
    parent.type === 'object' &&
    typeof lastSegment === 'string' &&
    Array.isArray(parent.children)
  ) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== void 0) {
      if (value === void 0) {
        if (!existing.parent) {
          throw new Error('Malformed AST');
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(
          text,
          { offset: removeBegin, length: removeEnd - removeBegin, content: '' },
          options,
        );
      } else {
        return withFormatting(
          text,
          { offset: existing.offset, length: existing.length, content: JSON.stringify(value) },
          options,
        );
      }
    } else {
      if (value === void 0) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex
        ? options.getInsertionIndex(parent.children.map(p => p.children[0].value))
        : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + ',' };
      }
      return withFormatting(text, edit, options);
    }
  } else if (
    parent.type === 'array' &&
    typeof lastSegment === 'number' &&
    Array.isArray(parent.children)
  ) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === void 0 && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: '' };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: '' };
      } else {
        edit = {
          offset: toRemove.offset,
          length: parent.children[removalIndex + 1].offset - toRemove.offset,
          content: '',
        };
      }
      return withFormatting(text, edit, options);
    } else if (value !== void 0) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = {
          offset: parent.offset + 1,
          length: 0,
          content: parent.children.length === 0 ? newProperty : newProperty + ',',
        };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: ',' + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(
        `Can not ${value === void 0 ? 'remove' : options.isArrayInsertion ? 'insert' : 'modify'} Array index ${insertIndex} as length is not sufficient`,
      );
    }
  } else {
    throw new Error(
      `Can not add ${typeof lastSegment !== 'number' ? 'index' : 'property'} to parent of type ${parent.type}`,
    );
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(
    newText,
    { offset: begin, length: end - begin },
    { ...options.formattingOptions, keepLines: false },
  );
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}
var init_edit = __esm({
  '../../node_modules/jsonc-parser/lib/esm/impl/edit.js'() {
    'use strict';
    init_format();
    init_parser();
  },
});

// ../../node_modules/jsonc-parser/lib/esm/main.js
var main_exports = {};
__export(main_exports, {
  ParseErrorCode: () => ParseErrorCode,
  ScanError: () => ScanError,
  SyntaxKind: () => SyntaxKind,
  applyEdits: () => applyEdits,
  createScanner: () => createScanner2,
  findNodeAtLocation: () => findNodeAtLocation2,
  findNodeAtOffset: () => findNodeAtOffset2,
  format: () => format2,
  getLocation: () => getLocation2,
  getNodePath: () => getNodePath2,
  getNodeValue: () => getNodeValue2,
  modify: () => modify,
  parse: () => parse2,
  parseTree: () => parseTree2,
  printParseErrorCode: () => printParseErrorCode,
  stripComments: () => stripComments2,
  visit: () => visit2,
});
function printParseErrorCode(code) {
  switch (code) {
    case 1:
      return 'InvalidSymbol';
    case 2:
      return 'InvalidNumberFormat';
    case 3:
      return 'PropertyNameExpected';
    case 4:
      return 'ValueExpected';
    case 5:
      return 'ColonExpected';
    case 6:
      return 'CommaExpected';
    case 7:
      return 'CloseBraceExpected';
    case 8:
      return 'CloseBracketExpected';
    case 9:
      return 'EndOfFileExpected';
    case 10:
      return 'InvalidCommentToken';
    case 11:
      return 'UnexpectedEndOfComment';
    case 12:
      return 'UnexpectedEndOfString';
    case 13:
      return 'UnexpectedEndOfNumber';
    case 14:
      return 'InvalidUnicode';
    case 15:
      return 'InvalidEscapeCharacter';
    case 16:
      return 'InvalidCharacter';
  }
  return '<unknown ParseErrorCode>';
}
function format2(documentText, range, options) {
  return format(documentText, range, options);
}
function modify(text, path, value, options) {
  return setProperty(text, path, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1; i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error('Overlapping edit');
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}
var createScanner2,
  ScanError,
  SyntaxKind,
  getLocation2,
  parse2,
  parseTree2,
  findNodeAtLocation2,
  findNodeAtOffset2,
  getNodePath2,
  getNodeValue2,
  visit2,
  stripComments2,
  ParseErrorCode;
var init_main = __esm({
  '../../node_modules/jsonc-parser/lib/esm/main.js'() {
    'use strict';
    init_format();
    init_edit();
    init_scanner();
    init_parser();
    createScanner2 = createScanner;
    (function (ScanError2) {
      ScanError2[(ScanError2['None'] = 0)] = 'None';
      ScanError2[(ScanError2['UnexpectedEndOfComment'] = 1)] = 'UnexpectedEndOfComment';
      ScanError2[(ScanError2['UnexpectedEndOfString'] = 2)] = 'UnexpectedEndOfString';
      ScanError2[(ScanError2['UnexpectedEndOfNumber'] = 3)] = 'UnexpectedEndOfNumber';
      ScanError2[(ScanError2['InvalidUnicode'] = 4)] = 'InvalidUnicode';
      ScanError2[(ScanError2['InvalidEscapeCharacter'] = 5)] = 'InvalidEscapeCharacter';
      ScanError2[(ScanError2['InvalidCharacter'] = 6)] = 'InvalidCharacter';
    })(ScanError || (ScanError = {}));
    (function (SyntaxKind2) {
      SyntaxKind2[(SyntaxKind2['OpenBraceToken'] = 1)] = 'OpenBraceToken';
      SyntaxKind2[(SyntaxKind2['CloseBraceToken'] = 2)] = 'CloseBraceToken';
      SyntaxKind2[(SyntaxKind2['OpenBracketToken'] = 3)] = 'OpenBracketToken';
      SyntaxKind2[(SyntaxKind2['CloseBracketToken'] = 4)] = 'CloseBracketToken';
      SyntaxKind2[(SyntaxKind2['CommaToken'] = 5)] = 'CommaToken';
      SyntaxKind2[(SyntaxKind2['ColonToken'] = 6)] = 'ColonToken';
      SyntaxKind2[(SyntaxKind2['NullKeyword'] = 7)] = 'NullKeyword';
      SyntaxKind2[(SyntaxKind2['TrueKeyword'] = 8)] = 'TrueKeyword';
      SyntaxKind2[(SyntaxKind2['FalseKeyword'] = 9)] = 'FalseKeyword';
      SyntaxKind2[(SyntaxKind2['StringLiteral'] = 10)] = 'StringLiteral';
      SyntaxKind2[(SyntaxKind2['NumericLiteral'] = 11)] = 'NumericLiteral';
      SyntaxKind2[(SyntaxKind2['LineCommentTrivia'] = 12)] = 'LineCommentTrivia';
      SyntaxKind2[(SyntaxKind2['BlockCommentTrivia'] = 13)] = 'BlockCommentTrivia';
      SyntaxKind2[(SyntaxKind2['LineBreakTrivia'] = 14)] = 'LineBreakTrivia';
      SyntaxKind2[(SyntaxKind2['Trivia'] = 15)] = 'Trivia';
      SyntaxKind2[(SyntaxKind2['Unknown'] = 16)] = 'Unknown';
      SyntaxKind2[(SyntaxKind2['EOF'] = 17)] = 'EOF';
    })(SyntaxKind || (SyntaxKind = {}));
    getLocation2 = getLocation;
    parse2 = parse;
    parseTree2 = parseTree;
    findNodeAtLocation2 = findNodeAtLocation;
    findNodeAtOffset2 = findNodeAtOffset;
    getNodePath2 = getNodePath;
    getNodeValue2 = getNodeValue;
    visit2 = visit;
    stripComments2 = stripComments;
    (function (ParseErrorCode2) {
      ParseErrorCode2[(ParseErrorCode2['InvalidSymbol'] = 1)] = 'InvalidSymbol';
      ParseErrorCode2[(ParseErrorCode2['InvalidNumberFormat'] = 2)] = 'InvalidNumberFormat';
      ParseErrorCode2[(ParseErrorCode2['PropertyNameExpected'] = 3)] = 'PropertyNameExpected';
      ParseErrorCode2[(ParseErrorCode2['ValueExpected'] = 4)] = 'ValueExpected';
      ParseErrorCode2[(ParseErrorCode2['ColonExpected'] = 5)] = 'ColonExpected';
      ParseErrorCode2[(ParseErrorCode2['CommaExpected'] = 6)] = 'CommaExpected';
      ParseErrorCode2[(ParseErrorCode2['CloseBraceExpected'] = 7)] = 'CloseBraceExpected';
      ParseErrorCode2[(ParseErrorCode2['CloseBracketExpected'] = 8)] = 'CloseBracketExpected';
      ParseErrorCode2[(ParseErrorCode2['EndOfFileExpected'] = 9)] = 'EndOfFileExpected';
      ParseErrorCode2[(ParseErrorCode2['InvalidCommentToken'] = 10)] = 'InvalidCommentToken';
      ParseErrorCode2[(ParseErrorCode2['UnexpectedEndOfComment'] = 11)] = 'UnexpectedEndOfComment';
      ParseErrorCode2[(ParseErrorCode2['UnexpectedEndOfString'] = 12)] = 'UnexpectedEndOfString';
      ParseErrorCode2[(ParseErrorCode2['UnexpectedEndOfNumber'] = 13)] = 'UnexpectedEndOfNumber';
      ParseErrorCode2[(ParseErrorCode2['InvalidUnicode'] = 14)] = 'InvalidUnicode';
      ParseErrorCode2[(ParseErrorCode2['InvalidEscapeCharacter'] = 15)] = 'InvalidEscapeCharacter';
      ParseErrorCode2[(ParseErrorCode2['InvalidCharacter'] = 16)] = 'InvalidCharacter';
    })(ParseErrorCode || (ParseErrorCode = {}));
  },
});

// ../config/dist/schema.js
var require_schema = __commonJS({
  '../config/dist/schema.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.SECRET_SOURCE_PAIRS =
      exports2.SLOT_BAND_MAX =
      exports2.SLOT_BAND_MIN =
      exports2.PRINCIPAL_ROLES =
        void 0;
    exports2.validateAuthKeys = validateAuthKeys;
    exports2.validateStandingDonations = validateStandingDonations;
    exports2.validateConfig = validateConfig;
    var errors_1 = require_errors();
    exports2.PRINCIPAL_ROLES = ['client', 'worker', 'scaler', 'admin', 'observer', 'ci', 'service'];
    exports2.SLOT_BAND_MIN = 0;
    exports2.SLOT_BAND_MAX = 7;
    exports2.SECRET_SOURCE_PAIRS = [
      ['token', 'tokenFile'],
      ['globalToken', 'globalTokenFile'],
      ['authKeys', 'authKeysFile'],
    ];
    var TOP_LEVEL_KEYS = /* @__PURE__ */ new Set([
      'listen',
      'localUrl',
      'token',
      'tokenFile',
      'globalUrl',
      'globalToken',
      'globalTokenFile',
      'globalCaFile',
      'bastionKnownHostsFile',
      'federationId',
      'federationRole',
      'siteProfile',
      'authKeys',
      'authKeysFile',
      'desk',
      'donate',
      'pool',
      'update',
      'acquire',
      'melliferaCheckout',
    ]);
    var AUTH_KEY_FIELDS = /* @__PURE__ */ new Set([
      'id',
      'role',
      'keyHash',
      'repos',
      'maxTtlMs',
      'maxConcurrentGrants',
    ]);
    var DONATE_FIELDS = /* @__PURE__ */ new Set([
      'classId',
      'slots',
      'workerId',
      'accepts',
      'trustCeiling',
      'warm',
      'kinds',
      'scope',
      'window',
      'reclaim',
      'capabilities',
    ]);
    var POOL_POLICY_FIELDS = /* @__PURE__ */ new Set([
      'classWeights',
      'accountWeights',
      'halfLifeMinutes',
      'agingMinutes',
      'accountCapUnderContention',
      'ci',
    ]);
    var UPDATE_FIELDS = /* @__PURE__ */ new Set(['check', 'apply', 'channel', 'intervalHours']);
    function invalid(file, field, rule) {
      return new errors_1.MelliferaConfigError(
        'config-invalid',
        `config-invalid: ${file} field "${field}" ${rule}`,
        file,
      );
    }
    function isPlainObject(v) {
      return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
    }
    function checkKeys(file, prefix, obj, allowed) {
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
          throw invalid(file, `${prefix}${key}`, 'is not a known setting');
        }
      }
    }
    function optString(file, field, v) {
      if (v !== void 0 && (typeof v !== 'string' || v.trim() === '')) {
        throw invalid(file, field, 'must be a non-empty string');
      }
    }
    function optUrl(file, field, v) {
      optString(file, field, v);
      if (typeof v === 'string') {
        let u;
        try {
          u = new URL(v);
        } catch {
          throw invalid(file, field, 'must be an absolute http(s) URL');
        }
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          throw invalid(file, field, 'must be an absolute http(s) URL');
        }
      }
    }
    function optNonNegativeInt(file, field, v, nullable = false) {
      if (v === void 0 || (nullable && v === null)) {
        return;
      }
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
        throw invalid(file, field, `must be a non-negative integer${nullable ? ' or null' : ''}`);
      }
    }
    function optSlots(file, field, v) {
      if (v === void 0) {
        return;
      }
      if (!Array.isArray(v)) {
        throw invalid(file, field, 'must be an array of slot indices');
      }
      for (const n of v) {
        if (typeof n !== 'number' || !Number.isInteger(n)) {
          throw invalid(file, field, 'must contain only integer slot indices');
        }
        if (n < exports2.SLOT_BAND_MIN || n > exports2.SLOT_BAND_MAX) {
          throw new errors_1.MelliferaConfigError(
            'slot-out-of-range',
            `slot-out-of-range: ${file} field "${field}" has slot ${n}; the shared supported band is ${exports2.SLOT_BAND_MIN}\u2013${exports2.SLOT_BAND_MAX}`,
            file,
          );
        }
      }
    }
    function optPositiveInt(file, field, v) {
      if (v === void 0) {
        return void 0;
      }
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) {
        throw invalid(file, field, 'must be a positive integer');
      }
      return v;
    }
    function validateAuthKeyRepos(file, at, role, raw) {
      if (raw === void 0) {
        if (role === 'ci') {
          throw invalid(file, `${at}.repos`, 'is required when role is "ci"');
        }
        return void 0;
      }
      if (!Array.isArray(raw) || raw.length === 0) {
        throw invalid(file, `${at}.repos`, 'must be a non-empty array of owner/name strings');
      }
      const repos = [];
      for (let i = 0; i < raw.length; i += 1) {
        const r = raw[i];
        if (typeof r !== 'string' || !r.trim()) {
          throw invalid(file, `${at}.repos[${i}]`, 'must be a non-empty string');
        }
        repos.push(r.trim());
      }
      return repos;
    }
    function validateAuthKeys(file, field, v) {
      if (!Array.isArray(v)) {
        throw invalid(file, field, 'must be an array of { id, role, keyHash }');
      }
      return v.map((item, i) => {
        const at = `${field}[${i}]`;
        if (!isPlainObject(item)) {
          throw invalid(file, at, 'must be an object { id, role, keyHash }');
        }
        checkKeys(file, `${at}.`, item, AUTH_KEY_FIELDS);
        if (typeof item.id !== 'string' || !item.id.trim()) {
          throw invalid(file, `${at}.id`, 'must be a non-empty string');
        }
        if (typeof item.role !== 'string' || !exports2.PRINCIPAL_ROLES.includes(item.role)) {
          throw invalid(
            file,
            `${at}.role`,
            `must be one of ${exports2.PRINCIPAL_ROLES.join(', ')}`,
          );
        }
        if (typeof item.keyHash !== 'string' || !/^[0-9a-fA-F]{64}$/.test(item.keyHash)) {
          throw invalid(file, `${at}.keyHash`, 'must be a 64-character SHA-256 hex digest');
        }
        const role = item.role;
        const repos = validateAuthKeyRepos(file, at, role, item.repos);
        const maxTtlMs = optPositiveInt(file, `${at}.maxTtlMs`, item.maxTtlMs);
        const maxConcurrentGrants = optPositiveInt(
          file,
          `${at}.maxConcurrentGrants`,
          item.maxConcurrentGrants,
        );
        return {
          id: item.id.trim(),
          role,
          keyHash: item.keyHash.toLowerCase(),
          ...(repos !== void 0 ? { repos } : {}),
          ...(maxTtlMs !== void 0 ? { maxTtlMs } : {}),
          ...(maxConcurrentGrants !== void 0 ? { maxConcurrentGrants } : {}),
        };
      });
    }
    function validateStringList(file, field, v) {
      if (!Array.isArray(v) || v.length === 0) {
        throw invalid(file, field, 'must be a non-empty array of non-empty strings');
      }
      return v.map((item, i) => {
        if (typeof item !== 'string' || !item.trim()) {
          throw invalid(file, `${field}[${i}]`, 'must be a non-empty string');
        }
        return item.trim();
      });
    }
    function validateDonorOfferFields(file, at, item) {
      const out = {};
      if (item.accepts !== void 0) {
        if (!Array.isArray(item.accepts) || item.accepts.length === 0) {
          throw invalid(
            file,
            `${at}.accepts`,
            'must be a non-empty array of "interactive" and/or "ci"',
          );
        }
        const accepts = [];
        for (let i = 0; i < item.accepts.length; i += 1) {
          const a = item.accepts[i];
          if (a !== 'interactive' && a !== 'ci') {
            throw invalid(file, `${at}.accepts[${i}]`, 'must be "interactive" or "ci"');
          }
          accepts.push(a);
        }
        out.accepts = accepts;
      }
      if (item.trustCeiling !== void 0) {
        if (item.trustCeiling !== 'trusted' && item.trustCeiling !== 'untrusted-ok') {
          throw invalid(file, `${at}.trustCeiling`, 'must be "trusted" or "untrusted-ok"');
        }
        out.trustCeiling = item.trustCeiling;
      }
      if (item.warm !== void 0) {
        out.warm = optNonNegativeIntValue(file, `${at}.warm`, item.warm);
      }
      if (item.kinds !== void 0) {
        out.kinds = validateStringList(file, `${at}.kinds`, item.kinds);
      }
      if (item.scope !== void 0) {
        if (!isPlainObject(item.scope)) {
          throw invalid(file, `${at}.scope`, 'must be an object { repos?, principals? }');
        }
        checkKeys(
          file,
          `${at}.scope.`,
          item.scope,
          /* @__PURE__ */ new Set(['repos', 'principals']),
        );
        const scope = {};
        if (item.scope.repos !== void 0) {
          scope.repos = validateStringList(file, `${at}.scope.repos`, item.scope.repos);
        }
        if (item.scope.principals !== void 0) {
          scope.principals = validateStringList(
            file,
            `${at}.scope.principals`,
            item.scope.principals,
          );
        }
        out.scope = scope;
      }
      if (item.window !== void 0) {
        if (!isPlainObject(item.window)) {
          throw invalid(file, `${at}.window`, 'must be an object { tz, rules }');
        }
        checkKeys(file, `${at}.window.`, item.window, /* @__PURE__ */ new Set(['tz', 'rules']));
        if (typeof item.window.tz !== 'string' || !item.window.tz.trim()) {
          throw invalid(file, `${at}.window.tz`, 'must be a non-empty string');
        }
        if (!Array.isArray(item.window.rules) || item.window.rules.length === 0) {
          throw invalid(file, `${at}.window.rules`, 'must be a non-empty array');
        }
        const rules = item.window.rules.map((rule, i) => {
          const rat = `${at}.window.rules[${i}]`;
          if (!isPlainObject(rule)) {
            throw invalid(file, rat, 'must be an object { days, from, to }');
          }
          checkKeys(file, `${rat}.`, rule, /* @__PURE__ */ new Set(['days', 'from', 'to']));
          for (const f of ['days', 'from', 'to']) {
            if (typeof rule[f] !== 'string' || !rule[f].trim()) {
              throw invalid(file, `${rat}.${f}`, 'must be a non-empty string');
            }
          }
          return {
            days: rule.days.trim(),
            from: rule.from.trim(),
            to: rule.to.trim(),
          };
        });
        out.window = { tz: item.window.tz.trim(), rules };
      }
      if (item.reclaim !== void 0) {
        if (!isPlainObject(item.reclaim)) {
          throw invalid(file, `${at}.reclaim`, 'must be an object { drainMinutes }');
        }
        checkKeys(file, `${at}.reclaim.`, item.reclaim, /* @__PURE__ */ new Set(['drainMinutes']));
        out.reclaim = {
          drainMinutes: optNonNegativeIntValue(
            file,
            `${at}.reclaim.drainMinutes`,
            item.reclaim.drainMinutes,
          ),
        };
      }
      if (item.capabilities !== void 0) {
        if (!isPlainObject(item.capabilities)) {
          throw invalid(file, `${at}.capabilities`, 'must be an object');
        }
        checkKeys(
          file,
          `${at}.capabilities.`,
          item.capabilities,
          /* @__PURE__ */ new Set(['arch', 'os', 'xcode', 'image', 'size']),
        );
        const caps = {};
        if (item.capabilities.arch !== void 0) {
          if (item.capabilities.arch !== 'arm64' && item.capabilities.arch !== 'x86_64') {
            throw invalid(file, `${at}.capabilities.arch`, 'must be "arm64" or "x86_64"');
          }
          caps.arch = item.capabilities.arch;
        }
        if (item.capabilities.os !== void 0) {
          optString(file, `${at}.capabilities.os`, item.capabilities.os);
          caps.os = item.capabilities.os;
        }
        if (item.capabilities.xcode !== void 0) {
          caps.xcode = validateStringList(
            file,
            `${at}.capabilities.xcode`,
            item.capabilities.xcode,
          );
        }
        if (item.capabilities.image !== void 0) {
          optString(file, `${at}.capabilities.image`, item.capabilities.image);
          caps.image = item.capabilities.image;
        }
        if (item.capabilities.size !== void 0) {
          if (
            item.capabilities.size !== 'S' &&
            item.capabilities.size !== 'M' &&
            item.capabilities.size !== 'L'
          ) {
            throw invalid(file, `${at}.capabilities.size`, 'must be "S", "M", or "L"');
          }
          caps.size = item.capabilities.size;
        }
        out.capabilities = caps;
      }
      return out;
    }
    function optNonNegativeIntValue(file, field, v) {
      if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
        throw invalid(file, field, 'must be a non-negative integer');
      }
      return v;
    }
    function validateStandingDonations(file, field, v, knownClassIds) {
      if (!Array.isArray(v)) {
        throw invalid(file, field, 'must be an array of { classId, slots, workerId? }');
      }
      const seen = /* @__PURE__ */ new Set();
      return v.map((item, i) => {
        const at = `${field}[${i}]`;
        if (!isPlainObject(item)) {
          throw invalid(file, at, 'must be an object { classId, slots, workerId? }');
        }
        checkKeys(file, `${at}.`, item, DONATE_FIELDS);
        if (typeof item.classId !== 'string' || !item.classId.trim()) {
          throw invalid(file, `${at}.classId`, 'must be a non-empty string');
        }
        const classId = item.classId.trim();
        if (knownClassIds && !knownClassIds.includes(classId)) {
          throw new errors_1.MelliferaConfigError(
            'unknown-class',
            `unknown-class: ${file} field "${at}.classId" is ${JSON.stringify(classId)}, which is not a provisionable class; known classes are ${knownClassIds.join(', ')}`,
            file,
          );
        }
        if (typeof item.slots !== 'number' || !Number.isInteger(item.slots) || item.slots < 1) {
          throw invalid(file, `${at}.slots`, 'must be an integer count of at least 1');
        }
        if (
          item.workerId !== void 0 &&
          (typeof item.workerId !== 'string' || !/^[A-Za-z0-9._-]+$/.test(item.workerId))
        ) {
          throw invalid(
            file,
            `${at}.workerId`,
            'must be a non-empty string of letters, digits, ".", "_", or "-"',
          );
        }
        const key = `${classId}\0${item.workerId ?? ''}`;
        if (seen.has(key)) {
          throw invalid(
            file,
            at,
            'repeats an earlier classId and workerId; merge them into one entry',
          );
        }
        seen.add(key);
        const offerFields = validateDonorOfferFields(file, at, item);
        return {
          classId,
          slots: item.slots,
          ...(item.workerId !== void 0 ? { workerId: item.workerId } : {}),
          ...offerFields,
        };
      });
    }
    function validatePoolPolicy(file, field, v) {
      if (!isPlainObject(v)) {
        throw invalid(file, field, 'must be an object');
      }
      checkKeys(file, `${field}.`, v, POOL_POLICY_FIELDS);
      const out = {};
      if (v.classWeights !== void 0) {
        if (!isPlainObject(v.classWeights)) {
          throw invalid(file, `${field}.classWeights`, 'must be an object { interactive?, ci? }');
        }
        checkKeys(
          file,
          `${field}.classWeights.`,
          v.classWeights,
          /* @__PURE__ */ new Set(['interactive', 'ci']),
        );
        const weights = {};
        for (const k of ['interactive', 'ci']) {
          if (v.classWeights[k] !== void 0) {
            const n = v.classWeights[k];
            if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
              throw invalid(file, `${field}.classWeights.${k}`, 'must be a positive number');
            }
            weights[k] = n;
          }
        }
        out.classWeights = weights;
      }
      if (v.accountWeights !== void 0) {
        if (!isPlainObject(v.accountWeights)) {
          throw invalid(
            file,
            `${field}.accountWeights`,
            'must be an object of account id \u2192 positive number',
          );
        }
        const weights = {};
        for (const [k, n] of Object.entries(v.accountWeights)) {
          if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) {
            throw invalid(file, `${field}.accountWeights.${k}`, 'must be a positive number');
          }
          weights[k] = n;
        }
        out.accountWeights = weights;
      }
      if (v.halfLifeMinutes !== void 0) {
        out.halfLifeMinutes = optNonNegativeIntValue(
          file,
          `${field}.halfLifeMinutes`,
          v.halfLifeMinutes,
        );
      }
      if (v.agingMinutes !== void 0) {
        out.agingMinutes = optNonNegativeIntValue(file, `${field}.agingMinutes`, v.agingMinutes);
      }
      if (v.accountCapUnderContention !== void 0) {
        const n = v.accountCapUnderContention;
        if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1) {
          throw invalid(
            file,
            `${field}.accountCapUnderContention`,
            'must be a number between 0 and 1',
          );
        }
        out.accountCapUnderContention = n;
      }
      if (v.ci !== void 0) {
        if (!isPlainObject(v.ci)) {
          throw invalid(file, `${field}.ci`, 'must be an object { secretsOnDonated }');
        }
        checkKeys(file, `${field}.ci.`, v.ci, /* @__PURE__ */ new Set(['secretsOnDonated']));
        const sod = v.ci.secretsOnDonated;
        if (sod === void 0) {
          out.ci = {};
        } else if (sod === 'allow' || sod === 'deny') {
          out.ci = { secretsOnDonated: sod };
        } else if (Array.isArray(sod)) {
          out.ci = {
            secretsOnDonated: validateStringList(file, `${field}.ci.secretsOnDonated`, sod),
          };
        } else {
          throw invalid(
            file,
            `${field}.ci.secretsOnDonated`,
            'must be "allow", "deny", or an array of owner/name strings',
          );
        }
      }
      return out;
    }
    function validateUpdateConfig(file, field, v) {
      if (!isPlainObject(v)) {
        throw invalid(file, field, 'must be an object');
      }
      checkKeys(file, `${field}.`, v, UPDATE_FIELDS);
      const out = {};
      for (const k of ['check', 'apply']) {
        if (v[k] !== void 0) {
          if (typeof v[k] !== 'boolean' && (typeof v[k] !== 'string' || !v[k].trim())) {
            throw invalid(file, `${field}.${k}`, 'must be a boolean or non-empty string');
          }
          out[k] = v[k];
        }
      }
      if (v.channel !== void 0) {
        optString(file, `${field}.channel`, v.channel);
        out.channel = v.channel.trim();
      }
      if (v.intervalHours !== void 0) {
        out.intervalHours = optNonNegativeIntValue(file, `${field}.intervalHours`, v.intervalHours);
      }
      return out;
    }
    function validateConfig(file, parsed, opts = {}) {
      if (parsed === void 0) {
        return {};
      }
      if (!isPlainObject(parsed)) {
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          `config-invalid: ${file} must contain one JSON object at the top level`,
          file,
        );
      }
      checkKeys(file, '', parsed, TOP_LEVEL_KEYS);
      if (parsed.listen !== void 0) {
        if (!isPlainObject(parsed.listen)) {
          throw invalid(file, 'listen', 'must be an object { host, port }');
        }
        checkKeys(file, 'listen.', parsed.listen, /* @__PURE__ */ new Set(['host', 'port']));
        optString(file, 'listen.host', parsed.listen.host);
        const port = parsed.listen.port;
        if (
          port !== void 0 &&
          (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535)
        ) {
          throw invalid(file, 'listen.port', 'must be an integer 1\u201365535');
        }
      }
      optUrl(file, 'localUrl', parsed.localUrl);
      optUrl(file, 'globalUrl', parsed.globalUrl);
      for (const f of [
        'token',
        'tokenFile',
        'globalToken',
        'globalTokenFile',
        'globalCaFile',
        'bastionKnownHostsFile',
        'authKeysFile',
        'federationId',
      ]) {
        optString(file, f, parsed[f]);
      }
      if (typeof parsed.federationId === 'string') {
        parsed.federationId = parsed.federationId.trim();
      }
      if (
        parsed.federationRole !== void 0 &&
        parsed.federationRole !== 'local' &&
        parsed.federationRole !== 'global' &&
        parsed.federationRole !== 'none'
      ) {
        throw invalid(file, 'federationRole', 'must be "local", "global", or "none"');
      }
      if (parsed.siteProfile !== void 0) {
        const sp = parsed.siteProfile;
        if (typeof sp === 'string') {
          optString(file, 'siteProfile', sp);
        } else if (!isPlainObject(sp)) {
          throw invalid(file, 'siteProfile', 'must be a name or an object');
        } else {
          for (const key of ['name', 'siteId', 'siteLabel', 'attendant']) {
            if (sp[key] !== void 0 && typeof sp[key] !== 'string') {
              throw invalid(file, `siteProfile.${key}`, 'must be a string');
            }
          }
          if (sp.floor !== void 0 && sp.floor !== 'homelab' && sp.floor !== 'dc') {
            throw invalid(file, 'siteProfile.floor', 'must be homelab or dc');
          }
          if (sp.attended !== void 0 && typeof sp.attended !== 'boolean') {
            throw invalid(file, 'siteProfile.attended', 'must be a boolean');
          }
          if (Buffer.byteLength(JSON.stringify(sp), 'utf8') > 4096) {
            throw invalid(file, 'siteProfile', 'must be at most 4096 bytes as JSON');
          }
        }
      }
      if (parsed.authKeys !== void 0) {
        parsed.authKeys = validateAuthKeys(file, 'authKeys', parsed.authKeys);
      }
      if (parsed.desk !== void 0) {
        if (!isPlainObject(parsed.desk)) {
          throw invalid(file, 'desk', 'must be an object');
        }
        checkKeys(
          file,
          'desk.',
          parsed.desk,
          /* @__PURE__ */ new Set(['registerSlots', 'donateSlots', 'defaultSlotCount']),
        );
        optSlots(file, 'desk.registerSlots', parsed.desk.registerSlots);
        optSlots(file, 'desk.donateSlots', parsed.desk.donateSlots);
        optNonNegativeInt(file, 'desk.defaultSlotCount', parsed.desk.defaultSlotCount, true);
      }
      if (parsed.donate !== void 0) {
        parsed.donate = validateStandingDonations(
          file,
          'donate',
          parsed.donate,
          opts.knownClassIds,
        );
      }
      if (parsed.pool !== void 0) {
        if (!isPlainObject(parsed.pool)) {
          throw invalid(file, 'pool', 'must be an object { policy? }');
        }
        checkKeys(file, 'pool.', parsed.pool, /* @__PURE__ */ new Set(['policy']));
        if (parsed.pool.policy !== void 0) {
          parsed.pool.policy = validatePoolPolicy(file, 'pool.policy', parsed.pool.policy);
        }
      }
      if (parsed.update !== void 0) {
        parsed.update = validateUpdateConfig(file, 'update', parsed.update);
      }
      if (parsed.acquire !== void 0) {
        if (!isPlainObject(parsed.acquire)) {
          throw invalid(file, 'acquire', 'must be an object');
        }
        checkKeys(
          file,
          'acquire.',
          parsed.acquire,
          /* @__PURE__ */ new Set(['localWaitMs', 'remoteWaitMs', 'allowAutoscale', 'timeoutMs']),
        );
        optNonNegativeInt(file, 'acquire.localWaitMs', parsed.acquire.localWaitMs);
        optNonNegativeInt(file, 'acquire.remoteWaitMs', parsed.acquire.remoteWaitMs);
        optNonNegativeInt(file, 'acquire.timeoutMs', parsed.acquire.timeoutMs, true);
        if (
          parsed.acquire.allowAutoscale !== void 0 &&
          typeof parsed.acquire.allowAutoscale !== 'boolean'
        ) {
          throw invalid(file, 'acquire.allowAutoscale', 'must be a boolean');
        }
      }
      if (parsed.melliferaCheckout !== void 0 && parsed.melliferaCheckout !== null) {
        optString(file, 'melliferaCheckout', parsed.melliferaCheckout);
      }
      return parsed;
    }
  },
});

// ../config/dist/load.js
var require_load = __commonJS({
  '../config/dist/load.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.CONFIG_FILE_NAME = exports2.CONFIG_DIR_NAME = void 0;
    exports2.homeDir = homeDir2;
    exports2.configPaths = configPaths;
    exports2.prefersInstanceConfig = prefersInstanceConfig;
    exports2.resolveConfigPaths = resolveConfigPaths;
    exports2.insecureModeError = insecureModeError;
    exports2.readGatedFile = readGatedFile;
    exports2.parseConfigText = parseConfigText;
    exports2.loadHomeConfig = loadHomeConfig;
    var node_fs_1 = __importDefault2(require('node:fs'));
    var node_path_1 = __importDefault2(require('node:path'));
    var jsonc_parser_1 = (init_main(), __toCommonJS(main_exports));
    var errors_1 = require_errors();
    var instance_1 = require_instance();
    Object.defineProperty(exports2, 'CONFIG_DIR_NAME', {
      enumerable: true,
      get: function () {
        return instance_1.CONFIG_DIR_NAME;
      },
    });
    Object.defineProperty(exports2, 'CONFIG_FILE_NAME', {
      enumerable: true,
      get: function () {
        return instance_1.CONFIG_FILE_NAME;
      },
    });
    var schema_1 = require_schema();
    function homeDir2(env = process.env, platform = process.platform) {
      const home = env.HOME || (platform === 'win32' ? env.USERPROFILE : void 0);
      return home && home.trim() ? home : void 0;
    }
    function configPaths(home) {
      const dir = node_path_1.default.join(home, instance_1.CONFIG_DIR_NAME);
      return { dir, file: node_path_1.default.join(dir, instance_1.CONFIG_FILE_NAME) };
    }
    function prefersInstanceConfig(env = process.env) {
      return Boolean(
        (env.MELLIFERA_INSTANCE_DIR && env.MELLIFERA_INSTANCE_DIR.trim()) ||
        (env.MELLIFERA_FEDERATION_ID && env.MELLIFERA_FEDERATION_ID.trim()) ||
        (env.MELLIFERA_INSTANCE && env.MELLIFERA_INSTANCE.trim()),
      );
    }
    function resolveConfigPaths(env = process.env, platform = process.platform) {
      const home = homeDir2(env, platform);
      if (!home) {
        return void 0;
      }
      if (prefersInstanceConfig(env)) {
        const dir = (0, instance_1.resolveInstanceDirFromEnv)(env, home);
        const file = (0, instance_1.instanceConfigPath)(dir);
        if (node_fs_1.default.existsSync(file)) {
          return { dir, file, source: 'instance' };
        }
        const homePaths2 = configPaths(home);
        if (node_fs_1.default.existsSync(homePaths2.file)) {
          return { ...homePaths2, source: 'home' };
        }
        return { dir, file, source: 'instance' };
      }
      const homePaths = configPaths(home);
      return { ...homePaths, source: 'home' };
    }
    function insecureModeError(file, mode) {
      return new errors_1.MelliferaConfigError(
        'config-permissions-insecure',
        `config-permissions-insecure: ${file} has mode ${(0, errors_1.formatMode)(mode)}; group/other permission bits must be clear. Run: chmod 600 ${file}. No secret was loaded from it.`,
        file,
      );
    }
    function readGatedFile(file, platform) {
      const fd = node_fs_1.default.openSync(file, 'r');
      try {
        const st = node_fs_1.default.fstatSync(fd);
        if (!st.isFile()) {
          throw new errors_1.MelliferaConfigError(
            'config-invalid',
            `config-invalid: ${file} is not a regular file`,
            file,
          );
        }
        if (platform !== 'win32' && (st.mode & 63) !== 0) {
          throw insecureModeError(file, st.mode);
        }
        return { text: node_fs_1.default.readFileSync(fd, 'utf8'), mode: st.mode & 511 };
      } finally {
        node_fs_1.default.closeSync(fd);
      }
    }
    function lineCol(text, offset) {
      const before = text.slice(0, offset);
      const line = before.split('\n').length;
      const col = offset - before.lastIndexOf('\n');
      return `${line}:${col}`;
    }
    function parseConfigText(file, text, opts = {}) {
      const errors = [];
      const parsed = (0, jsonc_parser_1.parse)(text, errors, {
        allowTrailingComma: true,
        disallowComments: false,
      });
      if (errors.length) {
        const e = errors[0];
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          `config-invalid: ${file}:${lineCol(text, e.offset)} ${(0, jsonc_parser_1.printParseErrorCode)(e.error)}`,
          file,
        );
      }
      return (0, schema_1.validateConfig)(file, parsed, opts);
    }
    function resolveSecretPath(configDir, p) {
      return node_path_1.default.resolve(configDir, p);
    }
    function readSecretFile(configDir, field, p, platform) {
      const file = resolveSecretPath(configDir, p);
      let out;
      try {
        out = readGatedFile(file, platform);
      } catch (err) {
        if (err instanceof errors_1.MelliferaConfigError) {
          throw err;
        }
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          `config-invalid: field "${field}" points at ${file}, which cannot be read (${err.code || 'error'})`,
          file,
        );
      }
      return out.text;
    }
    function absentOrSkipped(state, extra) {
      return { state, config: {}, secretSources: {}, warnings: [], ...extra };
    }
    function loadHomeConfig(opts = {}) {
      const env = opts.env ?? process.env;
      const platform = opts.platform ?? process.platform;
      if (opts.noConfig) {
        return absentOrSkipped('skipped', { skipReason: 'no-config' });
      }
      const resolved = resolveConfigPaths(env, platform);
      if (!resolved) {
        return absentOrSkipped('skipped', { skipReason: 'no-home' });
      }
      const { dir, file } = resolved;
      if (!node_fs_1.default.existsSync(file)) {
        return absentOrSkipped('absent', { dir, path: file });
      }
      const warnings = [];
      let dirMode;
      if (platform === 'win32') {
        warnings.push({
          code: 'config-mode-gate-skipped',
          message: `config-mode-gate-skipped: Windows does not enforce POSIX modes; ${file} permissions were not checked. Restrict it with your OS ACLs.`,
        });
      } else {
        dirMode = node_fs_1.default.statSync(dir).mode & 511;
        if ((dirMode & 63) !== 0) {
          warnings.push({
            code: 'config-directory-permissive',
            message: `config-directory-permissive: ${dir} has mode ${(0, errors_1.formatMode)(dirMode)}; prefer 0700 (chmod 700 ${dir}).`,
          });
        }
      }
      const { text, mode } = readGatedFile(file, platform);
      const config = parseConfigText(file, text, { knownClassIds: opts.knownClassIds });
      for (const [inline, viaFile] of schema_1.SECRET_SOURCE_PAIRS) {
        if (config[inline] !== void 0 && config[viaFile] !== void 0) {
          throw new errors_1.MelliferaConfigError(
            'config-secret-source-conflict',
            `config-secret-source-conflict: ${file} sets both "${inline}" and "${viaFile}"; keep exactly one.`,
            file,
          );
        }
      }
      const secretSources = {};
      if (config.token !== void 0) {
        secretSources.token = 'inline';
      } else if (config.tokenFile) {
        config.token = readSecretFile(dir, 'tokenFile', config.tokenFile, platform).trim();
        secretSources.token = 'file';
      }
      if (config.globalToken !== void 0) {
        secretSources.globalToken = 'inline';
      } else if (config.globalTokenFile) {
        config.globalToken = readSecretFile(
          dir,
          'globalTokenFile',
          config.globalTokenFile,
          platform,
        ).trim();
        secretSources.globalToken = 'file';
      }
      if (config.authKeys !== void 0) {
        secretSources.authKeys = 'inline';
      } else if (config.authKeysFile) {
        const keysPath = resolveSecretPath(dir, config.authKeysFile);
        const raw = readSecretFile(dir, 'authKeysFile', config.authKeysFile, platform);
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          throw new errors_1.MelliferaConfigError(
            'config-invalid',
            `config-invalid: field "authKeysFile" points at ${keysPath}, which is not valid JSON`,
            keysPath,
          );
        }
        config.authKeys = (0, schema_1.validateAuthKeys)(keysPath, 'authKeysFile', parsed);
        secretSources.authKeys = 'file';
      }
      for (const f of ['token', 'globalToken']) {
        if (config[f] === '') {
          throw new errors_1.MelliferaConfigError(
            'config-invalid',
            `config-invalid: ${file} field "${f}File" points at an empty file`,
            file,
          );
        }
      }
      return {
        state: 'loaded',
        dir,
        path: file,
        fileMode: mode,
        dirMode,
        config,
        secretSources,
        warnings,
      };
    }
  },
});

// ../config/dist/naming.js
var require_naming = __commonJS({
  '../config/dist/naming.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.federationNamePrefix = federationNamePrefix;
    exports2.guestName = guestName;
    exports2.warmSpareName = warmSpareName;
    exports2.runnerName = runnerName;
    exports2.recordName = recordName;
    exports2.matchesFederationPrefix = matchesFederationPrefix;
    function federationNamePrefix(federationId) {
      const id = federationId.trim();
      if (!id) {
        throw new Error('federationId is required for names');
      }
      return `mlf-${id}-`;
    }
    function guestName(federationId, grantId) {
      const grant = grantId.trim();
      if (!grant) {
        throw new Error('grantId is required for guest names');
      }
      return `${federationNamePrefix(federationId)}${grant}`;
    }
    function warmSpareName(federationId, hex) {
      const h = hex.trim().toLowerCase();
      if (!h) {
        throw new Error('hex is required for warm spare names');
      }
      return `${federationNamePrefix(federationId)}warm-${h}`;
    }
    function runnerName(federationId, grantId) {
      return guestName(federationId, grantId);
    }
    function recordName(federationId, grantId) {
      return guestName(federationId, grantId);
    }
    function matchesFederationPrefix(federationId, name) {
      return name.startsWith(federationNamePrefix(federationId));
    }
  },
});

// ../config/dist/redact.js
var require_redact = __commonJS({
  '../config/dist/redact.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.sha256Hex = sha256Hex2;
    exports2.fingerprint = fingerprint;
    exports2.redactSecrets = redactSecrets;
    var node_crypto_1 = require('node:crypto');
    function sha256Hex2(raw) {
      return (0, node_crypto_1.createHash)('sha256').update(raw, 'utf8').digest('hex');
    }
    function fingerprint(raw) {
      return `sha256:${sha256Hex2(raw).slice(0, 12)}`;
    }
    function redactSecrets(text, secrets) {
      let out = text;
      for (const s of secrets) {
        if (s && s.length >= 4) {
          out = out.split(s).join(`<redacted ${fingerprint(s)}>`);
        }
      }
      return out;
    }
  },
});

// ../config/dist/tls-trust.js
var require_tls_trust = __commonJS({
  '../config/dist/tls-trust.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.GLOBAL_CA_TRUST_NEXT = void 0;
    exports2.expandHomePath = expandHomePath;
    exports2.readCaFile = readCaFile;
    exports2.installFetchCaTrust = installFetchCaTrust;
    exports2.isTlsTrustText = isTlsTrustText;
    exports2.isTlsTrustError = isTlsTrustError;
    var node_fs_1 = __importDefault2(require('node:fs'));
    var node_path_1 = __importDefault2(require('node:path'));
    var node_tls_1 = __importDefault2(require('node:tls'));
    var TLS_TRUST_CODES = /* @__PURE__ */ new Set([
      'DEPTH_ZERO_SELF_SIGNED_CERT',
      'SELF_SIGNED_CERT_IN_CHAIN',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'UNABLE_TO_GET_ISSUER_CERT',
      'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
      'CERT_UNTRUSTED',
    ]);
    var TLS_TRUST_TEXT_RE =
      /DEPTH_ZERO_SELF_SIGNED_CERT|SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_VERIFY_LEAF_SIGNATURE|UNABLE_TO_GET_ISSUER_CERT(?:_LOCALLY)?|CERT_UNTRUSTED|self-signed certificate|unable to verify the first certificate/i;
    exports2.GLOBAL_CA_TRUST_NEXT =
      'Set globalCaFile in ~/.mellifera/config.jsonc (or MELLIFERA_TLS_CA / NODE_EXTRA_CA_CERTS) to a PEM that trusts the global core certificate; see packages/cli/README.md#status-and-doctor.';
    function expandHomePath(raw, home) {
      if (raw === void 0 || raw === null) {
        return void 0;
      }
      const trimmed = String(raw).trim();
      if (!trimmed) {
        return void 0;
      }
      if (trimmed === '~') {
        return home;
      }
      if (trimmed.startsWith('~/') || trimmed.startsWith('~\\')) {
        return node_path_1.default.join(home, trimmed.slice(2));
      }
      if (node_path_1.default.isAbsolute(trimmed)) {
        return trimmed;
      }
      return node_path_1.default.join(home, trimmed);
    }
    function readCaFile(caPath) {
      if (!caPath) {
        return void 0;
      }
      try {
        return node_fs_1.default.readFileSync(caPath);
      } catch {
        return void 0;
      }
    }
    function installFetchCaTrust(caPem) {
      if (
        !caPem ||
        (typeof caPem === 'string' && !caPem.trim()) ||
        (Buffer.isBuffer(caPem) && caPem.length === 0)
      ) {
        return false;
      }
      const undici = require('undici');
      const extra = typeof caPem === 'string' ? Buffer.from(caPem) : caPem;
      undici.setGlobalDispatcher(
        new undici.Agent({
          connect: { ca: [...node_tls_1.default.rootCertificates, extra] },
        }),
      );
      return true;
    }
    function isTlsTrustText(text) {
      if (!text) {
        return false;
      }
      if (TLS_TRUST_CODES.has(text)) {
        return true;
      }
      return TLS_TRUST_TEXT_RE.test(text);
    }
    function collectTrustSignals(err, depth = 0) {
      if (!err || depth > 4) {
        return [];
      }
      const e = err;
      const out = [];
      if (typeof e.code === 'string') {
        out.push(e.code);
      }
      if (typeof e.message === 'string') {
        out.push(e.message);
      }
      if (e.cause) {
        out.push(...collectTrustSignals(e.cause, depth + 1));
      }
      return out;
    }
    function isTlsTrustError(err) {
      return collectTrustSignals(err).some(isTlsTrustText);
    }
  },
});

// ../config/dist/resolve.js
var require_resolve = __commonJS({
  '../config/dist/resolve.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.DEFAULT_LISTEN_PORT = exports2.DEFAULT_LISTEN_HOST = void 0;
    exports2.parseDonateEnv = parseDonateEnv;
    exports2.resolveSettings = resolveSettings;
    exports2.projectCoreEnv = projectCoreEnv;
    var errors_1 = require_errors();
    var load_1 = require_load();
    var schema_1 = require_schema();
    var tls_trust_1 = require_tls_trust();
    exports2.DEFAULT_LISTEN_HOST = '127.0.0.1';
    exports2.DEFAULT_LISTEN_PORT = 8790;
    function parseDonateEnv(raw, knownClassIds) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          'config-invalid: MELLIFERA_DONATE must be a JSON array of { classId, slots, workerId? }',
        );
      }
      return (0, schema_1.validateStandingDonations)(
        'MELLIFERA_DONATE',
        'donate',
        parsed,
        knownClassIds,
      );
    }
    function envValue(env, ...names) {
      for (const name of names) {
        const raw = env[name];
        if (raw !== void 0 && raw.trim() !== '') {
          return { name, value: raw.trim() };
        }
      }
      return void 0;
    }
    function nonNegativeInt(label, raw) {
      if (!/^\d+$/.test(raw)) {
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          `config-invalid: ${label} must be a non-negative integer`,
        );
      }
      return Number(raw);
    }
    function bool(label, raw) {
      const v = raw.toLowerCase();
      if (v === '1' || v === 'true' || v === 'yes') {
        return true;
      }
      if (v === '0' || v === 'false' || v === 'no') {
        return false;
      }
      throw new errors_1.MelliferaConfigError(
        'config-invalid',
        `config-invalid: ${label} must be true or false`,
      );
    }
    function pick(flag, env, parseEnv, config) {
      if (flag !== void 0) {
        return { value: flag, source: 'flag' };
      }
      if (env) {
        return { value: parseEnv(env.name, env.value), source: 'env' };
      }
      if (config !== void 0) {
        return { value: config, source: 'config' };
      }
      return void 0;
    }
    var asString = (_name, raw) => raw;
    function urlHost(host) {
      if (host === '0.0.0.0' || host === '::') {
        return '127.0.0.1';
      }
      return host.includes(':') ? `[${host}]` : host;
    }
    function listenScheme(env) {
      const cert = (env.MELLIFERA_TLS_CERT || '').trim();
      const key = (env.MELLIFERA_TLS_KEY || '').trim();
      return cert && key ? 'https' : 'http';
    }
    function resolveSettings(input = {}) {
      const flags = input.flags ?? {};
      const env = input.env ?? process.env;
      const cfg = input.loaded?.config ?? {};
      const flagInt = (label, raw) => (raw === void 0 ? void 0 : nonNegativeInt(label, raw));
      const envInt = (name, raw) => nonNegativeInt(name, raw);
      const listenHost = pick(
        void 0,
        envValue(env, 'HOST', 'MELLIFERA_HOST'),
        asString,
        cfg.listen?.host,
      ) ?? {
        value: exports2.DEFAULT_LISTEN_HOST,
        source: 'default',
      };
      const listenPort = pick(
        void 0,
        envValue(env, 'PORT', 'MELLIFERA_PORT'),
        (name, raw) => {
          const n = nonNegativeInt(name, raw);
          if (n < 1 || n > 65535) {
            throw new errors_1.MelliferaConfigError(
              'config-invalid',
              `config-invalid: ${name} must be an integer 1\u201365535`,
            );
          }
          return n;
        },
        cfg.listen?.port,
      ) ?? { value: exports2.DEFAULT_LISTEN_PORT, source: 'default' };
      const scheme = listenScheme(env);
      let localUrl = pick(flags.url, envValue(env, 'MELLIFERA_URL'), asString, cfg.localUrl);
      if (!localUrl && cfg.listen) {
        const host = urlHost(cfg.listen.host ?? exports2.DEFAULT_LISTEN_HOST);
        localUrl = {
          value: `${scheme}://${host}:${cfg.listen.port ?? exports2.DEFAULT_LISTEN_PORT}`,
          source: 'derived',
        };
      }
      const localUrlResolved = localUrl ?? {
        value: `${scheme}://${exports2.DEFAULT_LISTEN_HOST}:${exports2.DEFAULT_LISTEN_PORT}`,
        source: 'default',
      };
      const token = pick(flags.token, envValue(env, 'MELLIFERA_TOKEN'), asString, cfg.token) ?? {
        value: void 0,
        source: 'unset',
      };
      const globalTokenPicked = pick(
        flags.globalToken,
        envValue(env, 'MELLIFERA_GLOBAL_TOKEN'),
        asString,
        cfg.globalToken,
      );
      const globalToken =
        globalTokenPicked ??
        (token.value !== void 0
          ? { value: token.value, source: 'inherited' }
          : { value: void 0, source: 'unset' });
      const federationId = pick(
        flags.federationId,
        envValue(env, 'MELLIFERA_FEDERATION_ID'),
        asString,
        cfg.federationId,
      ) ?? { value: void 0, source: 'unset' };
      const roleEnv = envValue(env, 'MELLIFERA_FEDERATION_ROLE');
      const federationRole = pick(
        void 0,
        roleEnv,
        (_n, raw) => raw.toLowerCase(),
        cfg.federationRole,
      ) ?? { value: void 0, source: 'unset' };
      const siteEnv = envValue(env, 'MELLIFERA_SITE_PROFILE');
      const siteProfile = siteEnv
        ? { value: siteEnv.value, source: 'env' }
        : cfg.siteProfile !== void 0
          ? {
              value:
                typeof cfg.siteProfile === 'string'
                  ? cfg.siteProfile
                  : JSON.stringify(cfg.siteProfile),
              source: 'config',
            }
          : { value: void 0, source: 'unset' };
      const authEnv = envValue(env, 'MELLIFERA_AUTH_KEYS');
      const authKeysJson = authEnv
        ? { value: authEnv.value, source: 'env' }
        : cfg.authKeys !== void 0
          ? { value: JSON.stringify(cfg.authKeys), source: 'config' }
          : { value: void 0, source: 'unset' };
      const slotCountCfg = cfg.desk?.defaultSlotCount ?? void 0;
      const donateEnv = envValue(env, 'MELLIFERA_DONATE');
      const donate = donateEnv
        ? { value: parseDonateEnv(donateEnv.value, input.knownClassIds), source: 'env' }
        : cfg.donate !== void 0
          ? { value: cfg.donate, source: 'config' }
          : { value: void 0, source: 'unset' };
      const home = (0, load_1.homeDir)(env) ?? '';
      const caEnv = envValue(env, 'MELLIFERA_TLS_CA');
      const globalCaFile = caEnv
        ? {
            value: (0, tls_trust_1.expandHomePath)(caEnv.value, home || caEnv.value) ?? caEnv.value,
            source: 'env',
          }
        : cfg.globalCaFile !== void 0 && home
          ? { value: (0, tls_trust_1.expandHomePath)(cfg.globalCaFile, home), source: 'config' }
          : cfg.globalCaFile !== void 0
            ? { value: cfg.globalCaFile, source: 'config' }
            : { value: void 0, source: 'unset' };
      const khEnv = envValue(env, 'MELLIFERA_BASTION_KNOWN_HOSTS');
      const bastionKnownHostsFile = khEnv
        ? {
            value: (0, tls_trust_1.expandHomePath)(khEnv.value, home || khEnv.value) ?? khEnv.value,
            source: 'env',
          }
        : cfg.bastionKnownHostsFile !== void 0 && home
          ? {
              value: (0, tls_trust_1.expandHomePath)(cfg.bastionKnownHostsFile, home),
              source: 'config',
            }
          : cfg.bastionKnownHostsFile !== void 0
            ? { value: cfg.bastionKnownHostsFile, source: 'config' }
            : { value: void 0, source: 'unset' };
      return {
        localUrl: localUrlResolved,
        token,
        globalUrl: pick(
          flags.globalUrl,
          envValue(env, 'MELLIFERA_GLOBAL_URL'),
          asString,
          cfg.globalUrl,
        ) ?? {
          value: void 0,
          source: 'unset',
        },
        globalToken,
        federationId,
        federationRole,
        siteProfile,
        listenHost,
        listenPort,
        authKeysJson,
        registerSlots: cfg.desk?.registerSlots
          ? { value: cfg.desk.registerSlots, source: 'config' }
          : { value: void 0, source: 'unset' },
        donateSlots: cfg.desk?.donateSlots
          ? { value: cfg.desk.donateSlots, source: 'config' }
          : { value: void 0, source: 'unset' },
        defaultSlotCount: pick(
          void 0,
          envValue(env, 'MELLIFERA_DEFAULT_SLOT_COUNT'),
          envInt,
          slotCountCfg,
        ) ?? {
          value: void 0,
          source: 'unset',
        },
        donate,
        localWaitMs: pick(
          flagInt('--local-wait-ms', flags.localWaitMs),
          envValue(env, 'MELLIFERA_LOCAL_WAIT_MS'),
          envInt,
          cfg.acquire?.localWaitMs,
        ) ?? {
          value: 0,
          source: 'default',
        },
        remoteWaitMs: pick(
          flagInt('--remote-wait-ms', flags.remoteWaitMs),
          envValue(env, 'MELLIFERA_REMOTE_WAIT_MS'),
          envInt,
          cfg.acquire?.remoteWaitMs,
        ) ?? {
          value: 0,
          source: 'default',
        },
        allowAutoscale: pick(
          flags.allowAutoscale,
          envValue(env, 'MELLIFERA_ALLOW_AUTOSCALE'),
          bool,
          cfg.acquire?.allowAutoscale,
        ) ?? {
          value: true,
          source: 'default',
        },
        timeoutMs: pick(
          flagInt('--timeout-ms', flags.timeoutMs),
          envValue(env, 'MELLIFERA_ACQUIRE_TIMEOUT_MS'),
          envInt,
          cfg.acquire?.timeoutMs ?? void 0,
        ) ?? {
          value: void 0,
          source: 'unset',
        },
        melliferaCheckout: cfg.melliferaCheckout
          ? { value: cfg.melliferaCheckout, source: 'config' }
          : { value: void 0, source: 'unset' },
        update: cfg.update
          ? { value: cfg.update, source: 'config' }
          : { value: void 0, source: 'unset' },
        globalCaFile,
        bastionKnownHostsFile,
      };
    }
    function projectCoreEnv(resolved, env = process.env) {
      const projected = [];
      const set = (name, r) => {
        if ((r.source === 'config' || r.source === 'inherited') && r.value !== void 0) {
          env[name] = String(r.value);
          projected.push(name);
        }
      };
      set('MELLIFERA_HOST', resolved.listenHost);
      set('MELLIFERA_PORT', resolved.listenPort);
      set('MELLIFERA_AUTH_KEYS', resolved.authKeysJson);
      set('MELLIFERA_GLOBAL_URL', resolved.globalUrl);
      if (resolved.globalToken.source !== 'inherited' || resolved.token.source === 'config') {
        set('MELLIFERA_GLOBAL_TOKEN', resolved.globalToken);
      }
      set('MELLIFERA_FEDERATION_ID', resolved.federationId);
      set('MELLIFERA_FEDERATION_ROLE', resolved.federationRole);
      set('MELLIFERA_SITE_PROFILE', resolved.siteProfile);
      set('MELLIFERA_DEFAULT_SLOT_COUNT', resolved.defaultSlotCount);
      set('MELLIFERA_TLS_CA', resolved.globalCaFile);
      if (resolved.donate.source === 'config' && resolved.donate.value !== void 0) {
        env.MELLIFERA_DONATE = JSON.stringify(resolved.donate.value);
        projected.push('MELLIFERA_DONATE');
      }
      if (resolved.update.source === 'config' && resolved.update.value) {
        const u = resolved.update.value;
        const projectIfUnset = (name, value) => {
          if (value === void 0) {
            return;
          }
          const cur = env[name];
          if (cur !== void 0 && String(cur).trim() !== '') {
            return;
          }
          env[name] = value;
          projected.push(name);
        };
        if (u.check !== void 0 && u.check !== null) {
          const raw =
            typeof u.check === 'boolean'
              ? u.check
                ? 'notify'
                : 'off'
              : String(u.check).trim().toLowerCase();
          if (raw === 'off' || raw === '0' || raw === 'false' || raw === 'no') {
            projectIfUnset('MELLIFERA_UPDATE_CHECK', 'off');
          } else if (
            raw === 'notify' ||
            raw === 'on' ||
            raw === '1' ||
            raw === 'true' ||
            raw === 'yes'
          ) {
            projectIfUnset('MELLIFERA_UPDATE_CHECK', 'notify');
          }
        }
        if (typeof u.channel === 'string' && u.channel.trim()) {
          projectIfUnset('MELLIFERA_UPDATE_CHANNEL', u.channel.trim());
        }
        if (u.apply !== void 0 && u.apply !== null) {
          const raw =
            typeof u.apply === 'boolean'
              ? u.apply
                ? 'prompt'
                : 'off'
              : String(u.apply).trim().toLowerCase();
          if (raw === 'off' || raw === '0' || raw === 'false' || raw === 'no') {
            projectIfUnset('MELLIFERA_UPDATE_APPLY', 'off');
          } else if (raw === 'auto') {
            projectIfUnset('MELLIFERA_UPDATE_APPLY', 'auto');
          } else if (raw) {
            projectIfUnset('MELLIFERA_UPDATE_APPLY', 'prompt');
          }
        }
      }
      return projected;
    }
  },
});

// ../config/dist/update-check.js
var require_update_check = __commonJS({
  '../config/dist/update-check.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.UPDATE_CACHE_FILE =
      exports2.RACE_GUARD_MS =
      exports2.FIRST_CHECK_JITTER_MS =
      exports2.FIRST_CHECK_DELAY_MS =
      exports2.MIN_INTERVAL_MS =
      exports2.DEFAULT_INTERVAL_MS =
      exports2.DEFAULT_UPDATE_CHANNEL =
      exports2.DEFAULT_UPDATE_API_URL =
      exports2.DEFAULT_UPDATE_REPO =
      exports2.UPDATE_APPLY_ENV =
      exports2.UPDATE_API_URL_ENV =
      exports2.UPDATE_TOKEN_ENV =
      exports2.UPDATE_CHECK_ENV =
        void 0;
    exports2.isUpdateCheckForcedOff = isUpdateCheckForcedOff;
    exports2.resolveUpdatePolicy = resolveUpdatePolicy;
    exports2.resolveUpdateCachePath = resolveUpdateCachePath;
    exports2.emptyUpdateCache = emptyUpdateCache;
    exports2.readUpdateCache = readUpdateCache;
    exports2.writeUpdateCache = writeUpdateCache;
    exports2.resolveUpdateToken = resolveUpdateToken;
    exports2.resolveUpdateApiBase = resolveUpdateApiBase;
    exports2.formatUpdateSummary = formatUpdateSummary;
    exports2.mapCompareStatus = mapCompareStatus;
    exports2.refreshUpdateCheck = refreshUpdateCheck;
    exports2.updateRowsFromCache = updateRowsFromCache;
    exports2.firstCheckDelayMs = firstCheckDelayMs;
    exports2.scheduleDeskUpdateChecker = scheduleDeskUpdateChecker;
    var node_child_process_1 = require('node:child_process');
    var node_fs_1 = require('node:fs');
    var node_path_1 = require('node:path');
    var node_os_1 = __importDefault2(require('node:os'));
    var instance_1 = require_instance();
    exports2.UPDATE_CHECK_ENV = 'MELLIFERA_UPDATE_CHECK';
    exports2.UPDATE_TOKEN_ENV = 'MELLIFERA_UPDATE_TOKEN';
    exports2.UPDATE_API_URL_ENV = 'MELLIFERA_UPDATE_API_URL';
    exports2.UPDATE_APPLY_ENV = 'MELLIFERA_UPDATE_APPLY';
    exports2.DEFAULT_UPDATE_REPO = 'invertase/mellifera';
    exports2.DEFAULT_UPDATE_API_URL = 'https://api.github.com';
    exports2.DEFAULT_UPDATE_CHANNEL = 'github-main';
    exports2.DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1e3;
    exports2.MIN_INTERVAL_MS = 60 * 60 * 1e3;
    exports2.FIRST_CHECK_DELAY_MS = 6e4;
    exports2.FIRST_CHECK_JITTER_MS = 3e4;
    exports2.RACE_GUARD_MS = 5 * 60 * 1e3;
    exports2.UPDATE_CACHE_FILE = 'update-check.json';
    function envOf(opts) {
      return opts?.env ?? process.env;
    }
    function nowMs(opts) {
      return opts?.now?.() ?? Date.now();
    }
    function trim(v) {
      return typeof v === 'string' ? v.trim() : '';
    }
    function isUpdateCheckForcedOff(env = process.env) {
      if (trim(env.CI)) {
        return true;
      }
      if (trim(env.GITHUB_ACTIONS)) {
        return true;
      }
      if (trim(env.NODE_ENV).toLowerCase() === 'test') {
        return true;
      }
      const raw = trim(env[exports2.UPDATE_CHECK_ENV]).toLowerCase();
      return raw === 'off' || raw === '0' || raw === 'false' || raw === 'no';
    }
    function normalizeCheckMode(raw) {
      if (raw === void 0 || raw === null) {
        return void 0;
      }
      if (typeof raw === 'boolean') {
        return raw ? 'notify' : 'off';
      }
      const s = String(raw).trim().toLowerCase();
      if (!s) {
        return void 0;
      }
      if (s === 'off' || s === '0' || s === 'false' || s === 'no') {
        return 'off';
      }
      if (s === 'notify' || s === 'on' || s === '1' || s === 'true' || s === 'yes') {
        return 'notify';
      }
      return void 0;
    }
    function normalizeApplyMode(raw) {
      if (raw === void 0 || raw === null) {
        return void 0;
      }
      if (typeof raw === 'boolean') {
        return raw ? 'prompt' : 'off';
      }
      const s = String(raw).trim().toLowerCase();
      if (s === 'off' || s === '0' || s === 'false' || s === 'no') {
        return 'off';
      }
      if (
        s === 'prompt' ||
        s === 'notify' ||
        s === 'on' ||
        s === '1' ||
        s === 'true' ||
        s === 'yes'
      ) {
        return 'prompt';
      }
      if (s === 'auto') {
        return 'auto';
      }
      return void 0;
    }
    function resolveUpdatePolicy(opts = {}) {
      const env = envOf(opts);
      const channel =
        trim(opts.updateConfig?.channel) ||
        trim(env.MELLIFERA_UPDATE_CHANNEL) ||
        exports2.DEFAULT_UPDATE_CHANNEL;
      let intervalMs = exports2.DEFAULT_INTERVAL_MS;
      if (opts.updateConfig?.intervalHours !== void 0) {
        intervalMs = Math.max(
          exports2.MIN_INTERVAL_MS,
          opts.updateConfig.intervalHours * 60 * 60 * 1e3,
        );
      }
      const applyEnv = normalizeApplyMode(env[exports2.UPDATE_APPLY_ENV]);
      const applyCfg = normalizeApplyMode(opts.updateConfig?.apply);
      const apply =
        applyEnv === 'off' || applyCfg === 'off' ? 'off' : applyEnv || applyCfg || 'prompt';
      const applySafe = apply === 'auto' ? 'prompt' : apply;
      if (opts.noUpdateCheck) {
        return {
          enabled: false,
          reason: 'flag --no-update-check',
          channel,
          intervalMs,
          apply: 'off',
        };
      }
      if (isUpdateCheckForcedOff(env)) {
        return {
          enabled: false,
          reason: 'forced off (CI/tests/UPDATE_CHECK)',
          channel,
          intervalMs,
          apply: 'off',
        };
      }
      const envMode = normalizeCheckMode(env[exports2.UPDATE_CHECK_ENV]);
      const cfgMode = normalizeCheckMode(opts.updateConfig?.check);
      const mode = envMode ?? cfgMode;
      if (mode === 'off') {
        return { enabled: false, reason: 'check=off', channel, intervalMs, apply: applySafe };
      }
      if (mode === 'notify') {
        return { enabled: true, channel, intervalMs, apply: applySafe };
      }
      if (opts.noConfig) {
        return {
          enabled: false,
          reason: 'no-config default off',
          channel,
          intervalMs,
          apply: applySafe,
        };
      }
      const role = opts.role ?? 'none';
      if (role === 'local' || role === 'global') {
        return {
          enabled: false,
          reason: 'fleet host (desks only)',
          channel,
          intervalMs,
          apply: 'off',
        };
      }
      return { enabled: true, channel, intervalMs, apply: applySafe };
    }
    function resolveUpdateCachePath(opts = {}) {
      if (opts.cachePath) {
        return opts.cachePath;
      }
      const env = envOf(opts);
      const statePath = trim(env.MELLIFERA_STATE_PATH);
      if (statePath) {
        return (0, node_path_1.join)(
          (0, node_path_1.dirname)(statePath),
          exports2.UPDATE_CACHE_FILE,
        );
      }
      const home = opts.home ?? env.HOME ?? node_os_1.default.homedir();
      return (0, node_path_1.join)((0, instance_1.melliferaHome)(home), exports2.UPDATE_CACHE_FILE);
    }
    function emptyUpdateCache(
      channel = exports2.DEFAULT_UPDATE_CHANNEL,
      repo = exports2.DEFAULT_UPDATE_REPO,
    ) {
      return { channel, repo, checkedAt: null, etags: {}, entries: {} };
    }
    function readUpdateCache(opts = {}) {
      const path = resolveUpdateCachePath(opts);
      if (!(0, node_fs_1.existsSync)(path)) {
        return emptyUpdateCache();
      }
      try {
        const raw = JSON.parse((0, node_fs_1.readFileSync)(path, 'utf8'));
        return {
          channel: typeof raw.channel === 'string' ? raw.channel : exports2.DEFAULT_UPDATE_CHANNEL,
          repo: typeof raw.repo === 'string' ? raw.repo : exports2.DEFAULT_UPDATE_REPO,
          checkedAt: typeof raw.checkedAt === 'string' ? raw.checkedAt : null,
          etags: raw.etags && typeof raw.etags === 'object' ? { ...raw.etags } : {},
          entries: raw.entries && typeof raw.entries === 'object' ? { ...raw.entries } : {},
          lastAttemptAt: typeof raw.lastAttemptAt === 'string' ? raw.lastAttemptAt : void 0,
          backoffUntil: typeof raw.backoffUntil === 'string' ? raw.backoffUntil : void 0,
        };
      } catch {
        return emptyUpdateCache();
      }
    }
    function writeUpdateCache(cache, opts = {}) {
      const path = resolveUpdateCachePath(opts);
      (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true, mode: 448 });
      const tmp = `${path}.${process.pid}.tmp`;
      (0, node_fs_1.writeFileSync)(
        tmp,
        `${JSON.stringify(cache, null, 2)}
`,
        { encoding: 'utf8', mode: 384 },
      );
      (0, node_fs_1.renameSync)(tmp, path);
    }
    function resolveUpdateToken(env = process.env) {
      const explicit = trim(env[exports2.UPDATE_TOKEN_ENV]);
      if (explicit) {
        return explicit;
      }
      try {
        const r = (0, node_child_process_1.spawnSync)('gh', ['auth', 'token'], {
          encoding: 'utf8',
          timeout: 3e3,
          env: {
            // Do not forward GITHUB_TOKEN/GH_TOKEN into gh; use gh's own store only.
            PATH: env.PATH || process.env.PATH || '',
            HOME: env.HOME || process.env.HOME || '',
            GH_CONFIG_DIR: env.GH_CONFIG_DIR,
            XDG_CONFIG_HOME: env.XDG_CONFIG_HOME,
          },
        });
        if (r.status === 0) {
          const token = trim(r.stdout);
          if (token) {
            return token;
          }
        }
      } catch {}
      return void 0;
    }
    function resolveUpdateApiBase(env = process.env) {
      const raw = trim(env[exports2.UPDATE_API_URL_ENV]);
      return (raw || exports2.DEFAULT_UPDATE_API_URL).replace(/\/+$/, '');
    }
    function shortSha(sha) {
      if (!sha) {
        return 'unknown';
      }
      return sha.length > 12 ? sha.slice(0, 12) : sha;
    }
    function formatUpdateSummary(entry) {
      const dirty = entry.dirty ? 'modified build of ' : '';
      const commit = shortSha(entry.commit);
      switch (entry.state) {
        case 'current':
          return `${dirty}${commit} current`;
        case 'behind':
          return `${dirty}${commit} behind by ${entry.behindBy ?? '?'} (main ${shortSha(entry.mainSha)})`;
        case 'ahead':
          return `${dirty}${commit} ahead of main by ${entry.aheadBy ?? '?'}`;
        case 'diverged':
          return `${dirty}${commit} diverged (${entry.behindBy ?? '?'} behind, ${entry.aheadBy ?? '?'} ahead)`;
        case 'unpublished':
          return `${dirty}${commit} unpublished build`;
        case 'unchecked':
          return `${dirty}${commit} unchecked: ${entry.reason || 'unknown'}`;
        default:
          return `${dirty}${commit} unchecked`;
      }
    }
    function mapCompareStatus(body) {
      const status = trim(body.status).toLowerCase();
      if (status === 'identical') {
        return { state: 'current' };
      }
      if (status === 'ahead') {
        return { state: 'behind', behindBy: Number(body.ahead_by) || 0 };
      }
      if (status === 'behind') {
        return { state: 'ahead', aheadBy: Number(body.behind_by) || 0 };
      }
      if (status === 'diverged') {
        return {
          state: 'diverged',
          behindBy: Number(body.ahead_by) || 0,
          aheadBy: Number(body.behind_by) || 0,
        };
      }
      return { state: 'unchecked', behindBy: void 0, aheadBy: void 0 };
    }
    async function githubCompare(commit, opts, etag) {
      const env = envOf(opts);
      const repo = opts.repo || exports2.DEFAULT_UPDATE_REPO;
      const api = resolveUpdateApiBase(env);
      const token = resolveUpdateToken(env);
      const checkedAt = new Date(nowMs(opts)).toISOString();
      const base = {
        commit,
        dirty: null,
        checkedAt,
      };
      if (!token) {
        const partial2 = { ...base, state: 'unchecked', reason: 'no credential' };
        return { entry: { ...partial2, summary: formatUpdateSummary(partial2) } };
      }
      const url = `${api}/repos/${repo}/compare/${encodeURIComponent(commit)}...main`;
      const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'mellifera-update-check',
        'X-GitHub-Api-Version': '2022-11-28',
      };
      if (etag) {
        headers['If-None-Match'] = etag;
      }
      const fetchImpl = opts.fetchImpl || fetch;
      let res;
      try {
        res = await fetchImpl(url, { headers });
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'network error';
        const partial2 = { ...base, state: 'unchecked', reason };
        return {
          entry: { ...partial2, summary: formatUpdateSummary(partial2) },
          retryAfterMs: 6e4,
        };
      }
      const newEtag = res.headers.get('etag') || void 0;
      if (res.status === 304) {
        return {
          notModified: true,
          etag: newEtag || etag,
          entry: {
            ...base,
            state: 'current',
            summary: formatUpdateSummary({ ...base, state: 'current' }),
          },
        };
      }
      const retryAfter = res.headers.get('retry-after');
      const reset = res.headers.get('x-ratelimit-reset');
      let retryAfterMs;
      if (retryAfter && /^\d+$/.test(retryAfter)) {
        retryAfterMs = Number(retryAfter) * 1e3;
      } else if (reset && /^\d+$/.test(reset)) {
        retryAfterMs = Math.max(0, Number(reset) * 1e3 - nowMs(opts));
      }
      if (res.status === 404) {
        const partial2 = { ...base, state: 'unpublished' };
        return { entry: { ...partial2, summary: formatUpdateSummary(partial2) }, etag: newEtag };
      }
      if (res.status === 401 || res.status === 403) {
        const reason = res.status === 401 ? 'no credential' : 'forbidden or rate-limited';
        const partial2 = { ...base, state: 'unchecked', reason };
        return {
          entry: { ...partial2, summary: formatUpdateSummary(partial2) },
          etag: newEtag,
          retryAfterMs: retryAfterMs ?? (res.status === 403 ? 6e4 : void 0),
        };
      }
      if (res.status === 429) {
        const partial2 = { ...base, state: 'unchecked', reason: 'rate-limited' };
        return {
          entry: { ...partial2, summary: formatUpdateSummary(partial2) },
          etag: newEtag,
          retryAfterMs: retryAfterMs ?? 6e4,
        };
      }
      if (!res.ok) {
        const partial2 = { ...base, state: 'unchecked', reason: `HTTP ${res.status}` };
        return {
          entry: { ...partial2, summary: formatUpdateSummary(partial2) },
          etag: newEtag,
          retryAfterMs: retryAfterMs ?? 6e4,
        };
      }
      let body;
      try {
        body = await res.json();
      } catch {
        const partial2 = { ...base, state: 'unchecked', reason: 'invalid compare body' };
        return { entry: { ...partial2, summary: formatUpdateSummary(partial2) }, etag: newEtag };
      }
      const mapped = mapCompareStatus(body);
      if (mapped.state === 'unchecked') {
        const partial2 = {
          ...base,
          state: 'unchecked',
          reason: `compare status ${body.status || 'unknown'}`,
        };
        return { entry: { ...partial2, summary: formatUpdateSummary(partial2) }, etag: newEtag };
      }
      const commits = body.commits;
      const tip =
        Array.isArray(commits) && commits.length > 0
          ? commits[commits.length - 1]?.sha || null
          : null;
      const partial = {
        ...base,
        state: mapped.state,
        behindBy: mapped.behindBy,
        aheadBy: mapped.aheadBy,
        mainSha: tip,
      };
      return { entry: { ...partial, summary: formatUpdateSummary(partial) }, etag: newEtag };
    }
    function shouldSkipForInterval(cache, opts, intervalMs) {
      if (opts.force) {
        return false;
      }
      const t = nowMs(opts);
      if (cache.backoffUntil) {
        const until = Date.parse(cache.backoffUntil);
        if (!Number.isNaN(until) && t < until) {
          return true;
        }
      }
      if (!cache.checkedAt && !cache.lastAttemptAt) {
        return false;
      }
      const last = Date.parse(cache.checkedAt || cache.lastAttemptAt || '');
      if (Number.isNaN(last)) {
        return false;
      }
      if (t - last < exports2.RACE_GUARD_MS) {
        return true;
      }
      return t - last < intervalMs;
    }
    async function refreshUpdateCheck(components, opts = {}) {
      const policy = resolveUpdatePolicy(opts);
      const cache = readUpdateCache(opts);
      cache.channel = policy.channel;
      cache.repo = opts.repo || cache.repo || exports2.DEFAULT_UPDATE_REPO;
      if (isUpdateCheckForcedOff(envOf(opts))) {
        return {
          cache,
          ran: false,
          policy: { ...policy, enabled: false, reason: 'forced off (CI/tests/UPDATE_CHECK)' },
        };
      }
      if (!policy.enabled && !opts.force) {
        return { cache, ran: false, policy };
      }
      if (shouldSkipForInterval(cache, opts, policy.intervalMs)) {
        return { cache, ran: false, policy };
      }
      const t = nowMs(opts);
      cache.lastAttemptAt = new Date(t).toISOString();
      let anyNetwork = false;
      let maxRetry;
      for (const { component, identity } of components) {
        const commit = identity.commit;
        const dirty = identity.dirty;
        if (!commit) {
          const partial = {
            component,
            commit: null,
            dirty,
            state: 'unchecked',
            reason: 'unknown identity',
            checkedAt: new Date(t).toISOString(),
            summary: '',
          };
          partial.summary = formatUpdateSummary(partial);
          cache.entries[component] = partial;
          continue;
        }
        const prev = cache.entries[component];
        if (prev && prev.commit && prev.commit !== commit) {
          delete cache.etags[commit];
        }
        const etag = cache.etags[commit];
        const result = await githubCompare(commit, opts, etag);
        anyNetwork = true;
        if (result.retryAfterMs !== void 0) {
          maxRetry = Math.max(maxRetry ?? 0, result.retryAfterMs);
        }
        if (result.etag) {
          cache.etags[commit] = result.etag;
        }
        if (result.notModified && prev && prev.commit === commit) {
          cache.entries[component] = {
            ...prev,
            dirty,
            checkedAt: new Date(t).toISOString(),
          };
          continue;
        }
        const entry = {
          component,
          commit,
          dirty,
          state: result.entry.state,
          behindBy: result.entry.behindBy,
          aheadBy: result.entry.aheadBy,
          mainSha: result.entry.mainSha,
          reason: result.entry.reason,
          checkedAt: new Date(t).toISOString(),
          summary: formatUpdateSummary({
            commit,
            dirty,
            state: result.entry.state,
            behindBy: result.entry.behindBy,
            aheadBy: result.entry.aheadBy,
            mainSha: result.entry.mainSha,
            reason: result.entry.reason,
          }),
        };
        cache.entries[component] = entry;
      }
      if (anyNetwork) {
        cache.checkedAt = new Date(t).toISOString();
        if (maxRetry !== void 0 && maxRetry > 0) {
          const backoff = Math.min(
            policy.intervalMs,
            Math.max(exports2.MIN_INTERVAL_MS / 60, maxRetry),
          );
          cache.backoffUntil = new Date(t + backoff).toISOString();
        } else {
          delete cache.backoffUntil;
        }
        writeUpdateCache(cache, opts);
      }
      return { cache, ran: anyNetwork, policy };
    }
    function rowStateFor(entry) {
      if (entry.state === 'behind') {
        return 'warn';
      }
      if (entry.state === 'current') {
        return 'ok';
      }
      return 'note';
    }
    function nextHint(entry, apply) {
      if (entry.state !== 'behind' || apply === 'off') {
        return void 0;
      }
      return 'Update from a current Mellifera checkout (git pull && yarn install && yarn build), then restart; never applied automatically.';
    }
    function updateRowsFromCache(opts = {}) {
      const policy = resolveUpdatePolicy(opts);
      const cache = readUpdateCache(opts);
      const wanted = opts.components || ['cli', 'local', 'global'];
      const rows = [];
      if (isUpdateCheckForcedOff(envOf(opts))) {
        return wanted.map(c => ({
          id: `${c}-update`,
          state: 'skip',
          summary: 'update check off',
        }));
      }
      for (const component of wanted) {
        const entry = cache.entries[component];
        if (!entry) {
          rows.push({
            id: `${component}-update`,
            state: 'skip',
            summary: policy.enabled
              ? 'update not checked yet'
              : `update check disabled (${policy.reason || 'off'})`,
          });
          continue;
        }
        const state = rowStateFor(entry);
        rows.push({
          id: `${component}-update`,
          state,
          code: entry.state === 'behind' ? 'update-behind' : void 0,
          summary: entry.summary,
          next: opts.withNext ? nextHint(entry, policy.apply) : void 0,
        });
      }
      return rows;
    }
    function firstCheckDelayMs(random = Math.random) {
      return exports2.FIRST_CHECK_DELAY_MS + Math.floor(random() * exports2.FIRST_CHECK_JITTER_MS);
    }
    function scheduleDeskUpdateChecker(input) {
      const policy = resolveUpdatePolicy(input);
      if (!policy.enabled) {
        return () => void 0;
      }
      const setTimeoutFn = input.setTimeoutFn || setTimeout;
      const clearTimeoutFn = input.clearTimeoutFn || clearTimeout;
      let timer;
      let stopped = false;
      let lastSummaries = '';
      const tick = async () => {
        if (stopped) {
          return;
        }
        try {
          const components = await input.getComponents();
          const { cache, ran } = await refreshUpdateCheck(components, { ...input, force: false });
          if (ran && input.onChange) {
            const entries = ['cli', 'local', 'global']
              .map(c => cache.entries[c])
              .filter(e => Boolean(e));
            const summaries = entries.map(e => `${e.component}:${e.summary}`).join('|');
            if (summaries && summaries !== lastSummaries) {
              lastSummaries = summaries;
              const behind = entries.filter(e => e.state === 'behind');
              if (behind.length) {
                input.onChange(
                  `[mellifera] update: ${behind.map(e => `${e.component} ${e.summary}`).join('; ')}; run mellifera-cli update check`,
                  behind,
                );
              }
            }
          }
        } catch {}
        if (!stopped) {
          timer = setTimeoutFn(() => {
            void tick();
          }, policy.intervalMs);
        }
      };
      timer = setTimeoutFn(() => {
        void tick();
      }, firstCheckDelayMs(input.random));
      return () => {
        stopped = true;
        if (timer !== void 0) {
          clearTimeoutFn(timer);
        }
      };
    }
  },
});

// ../config/dist/upsert.js
var require_upsert = __commonJS({
  '../config/dist/upsert.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.CONFIG_TEMPLATE = void 0;
    exports2.upsertMintedKey = upsertMintedKey;
    var node_crypto_1 = require('node:crypto');
    var node_fs_1 = __importDefault2(require('node:fs'));
    var node_path_1 = __importDefault2(require('node:path'));
    var jsonc_parser_1 = (init_main(), __toCommonJS(main_exports));
    var errors_1 = require_errors();
    var load_1 = require_load();
    var FORMATTING = { insertSpaces: true, tabSize: 2, eol: '\n' };
    exports2.CONFIG_TEMPLATE = `// Mellifera host configuration (JSONC). Read by mellifera-cli and mellifera-core.
// Precedence: CLI flag > non-empty MELLIFERA_* env > this file > built-in default.
// Keep this file mode 0600 and its directory 0700. Mode 0600 does not stop backups,
// cloud sync, \`cat\`, or an accidental paste from exposing the secrets below.
//
// mellifera-cli reads: localUrl, token, globalUrl, globalToken, globalCaFile,
// bastionKnownHostsFile, desk, acquire.
// mellifera-core reads: listen, authKeys, globalUrl, globalToken (omitted: inherits
// token), globalCaFile (\u2192 MELLIFERA_TLS_CA), federationRole, desk.defaultSlotCount.
// "token" and "authKeys" below are written by \`mellifera-cli mint-client-api-key\`.
{
}
`;
    function editOne(text, jsonPath, value, isArrayInsertion = false) {
      return (0, jsonc_parser_1.applyEdits)(
        text,
        (0, jsonc_parser_1.modify)(text, jsonPath, value, {
          formattingOptions: FORMATTING,
          isArrayInsertion,
        }),
      );
    }
    function upsertMintedKey(opts) {
      const env = opts.env ?? process.env;
      const platform = opts.platform ?? process.platform;
      const home = (0, load_1.homeDir)(env, platform);
      if (!home) {
        throw new errors_1.MelliferaConfigError(
          'config-invalid',
          'config-invalid: HOME is not set, so there is no ~/.mellifera/config.jsonc to write; pass --no-config --out-raw PATH instead',
        );
      }
      const { dir, file } = (0, load_1.configPaths)(home);
      const warnings = [];
      if (!node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.mkdirSync(dir, { recursive: true, mode: 448 });
        if (platform !== 'win32') {
          node_fs_1.default.chmodSync(dir, 448);
        }
      } else if (platform !== 'win32') {
        const dirMode = node_fs_1.default.statSync(dir).mode & 511;
        if ((dirMode & 63) !== 0) {
          warnings.push({
            code: 'config-directory-permissive',
            message: `config-directory-permissive: ${dir} has mode ${(0, errors_1.formatMode)(dirMode)}; prefer 0700 (chmod 700 ${dir}).`,
          });
        }
      }
      const created = !node_fs_1.default.existsSync(file);
      let tightenedFrom;
      let text = exports2.CONFIG_TEMPLATE;
      if (!created) {
        const st = node_fs_1.default.statSync(file);
        if (!st.isFile()) {
          throw new errors_1.MelliferaConfigError(
            'config-invalid',
            `config-invalid: ${file} is not a regular file`,
            file,
          );
        }
        if (platform !== 'win32' && (st.mode & 63) !== 0) {
          tightenedFrom = (0, errors_1.formatMode)(st.mode);
          node_fs_1.default.chmodSync(file, 384);
        }
        text = node_fs_1.default.readFileSync(file, 'utf8');
      }
      const current = (0, load_1.parseConfigText)(file, text);
      if (current.tokenFile !== void 0) {
        throw new errors_1.MelliferaConfigError(
          'config-secret-source-conflict',
          `config-secret-source-conflict: ${file} sets "tokenFile"; mint writes inline "token". Remove "tokenFile" first.`,
          file,
        );
      }
      if (current.authKeysFile !== void 0) {
        throw new errors_1.MelliferaConfigError(
          'config-secret-source-conflict',
          `config-secret-source-conflict: ${file} sets "authKeysFile"; mint writes inline "authKeys". Remove "authKeysFile" first.`,
          file,
        );
      }
      text = editOne(text, ['token'], opts.rawToken);
      const keys = (0, jsonc_parser_1.parse)(text).authKeys;
      if (!Array.isArray(keys)) {
        text = editOne(text, ['authKeys'], [opts.entry]);
      } else {
        const idx = keys.findIndex(k => k && k.id === opts.entry.id);
        text =
          idx >= 0
            ? editOne(text, ['authKeys', idx], opts.entry)
            : editOne(text, ['authKeys', keys.length], opts.entry, true);
      }
      (0, load_1.parseConfigText)(file, text);
      const tmp = node_path_1.default.join(
        dir,
        `.${node_path_1.default.basename(file)}.${process.pid}.${(0, node_crypto_1.randomBytes)(4).toString('hex')}.tmp`,
      );
      try {
        node_fs_1.default.writeFileSync(tmp, text, { mode: 384, flag: 'wx' });
        if (platform !== 'win32') {
          node_fs_1.default.chmodSync(tmp, 384);
        }
        node_fs_1.default.renameSync(tmp, file);
      } finally {
        node_fs_1.default.rmSync(tmp, { force: true });
      }
      return { path: file, created, tightenedFrom, warnings };
    }
  },
});

// ../config/dist/index.js
var require_dist = __commonJS({
  '../config/dist/index.js'(exports2) {
    'use strict';
    var __createBinding2 =
      (exports2 && exports2.__createBinding) ||
      (Object.create
        ? function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
              desc = {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              };
            }
            Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
    var __exportStar =
      (exports2 && exports2.__exportStar) ||
      function (m, exports3) {
        for (var p in m)
          if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding2(exports3, m, p);
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    __exportStar(require_build_info(), exports2);
    __exportStar(require_errors(), exports2);
    __exportStar(require_host_budget(), exports2);
    __exportStar(require_instance(), exports2);
    __exportStar(require_load(), exports2);
    __exportStar(require_naming(), exports2);
    __exportStar(require_redact(), exports2);
    __exportStar(require_resolve(), exports2);
    __exportStar(require_schema(), exports2);
    __exportStar(require_tls_trust(), exports2);
    __exportStar(require_update_check(), exports2);
    __exportStar(require_upsert(), exports2);
  },
});

// dist/build-info.generated.js
var require_build_info_generated2 = __commonJS({
  'dist/build-info.generated.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.stamped = void 0;
    exports2.stamped = {
      version: '0.1.0',
      commit: 'cd69c7ee1d15feac2f7587fa501b88512f4f0185',
      dirty: false,
      builtAt: '2026-10-29T19:19:12.644Z',
      source: 'git',
    };
  },
});

// dist/build-info.js
var require_build_info2 = __commonJS({
  'dist/build-info.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.getBuildIdentity = getBuildIdentity;
    exports2.formatBuildIdentity = formatBuildIdentity;
    var node_fs_1 = require('node:fs');
    var node_path_1 = require('node:path');
    var build_info_generated_1 = require_build_info_generated2();
    function readReleaseTip() {
      const candidates = [
        (0, node_path_1.join)(process.cwd(), 'RELEASE_TIP'),
        (0, node_path_1.join)(__dirname, '..', 'RELEASE_TIP'),
        (0, node_path_1.join)(__dirname, '..', '..', 'RELEASE_TIP'),
      ];
      for (const p of candidates) {
        if (!(0, node_fs_1.existsSync)(p)) {
          continue;
        }
        try {
          const tip = (0, node_fs_1.readFileSync)(p, 'utf8').trim().split(/\r?\n/)[0]?.trim();
          if (tip) {
            return tip;
          }
        } catch {}
      }
      return null;
    }
    function getBuildIdentity() {
      const base = {
        version: build_info_generated_1.stamped.version ?? null,
        commit: build_info_generated_1.stamped.commit ?? null,
        dirty: build_info_generated_1.stamped.dirty ?? null,
        builtAt: build_info_generated_1.stamped.builtAt ?? null,
        source: build_info_generated_1.stamped.source ?? null,
      };
      if (base.commit) {
        return base;
      }
      const tip = readReleaseTip();
      if (!tip) {
        return base;
      }
      return {
        version: base.version,
        commit: tip,
        dirty: false,
        builtAt: base.builtAt,
        source: 'release-tip',
      };
    }
    function formatBuildIdentity(b = getBuildIdentity()) {
      const commit = b.commit ?? 'null';
      const dirty = b.dirty === null ? 'null' : String(b.dirty);
      const version = b.version ?? 'null';
      const builtAt = b.builtAt ?? 'null';
      const source = b.source ?? 'null';
      return `version=${version} commit=${commit} dirty=${dirty} builtAt=${builtAt} source=${source}`;
    }
  },
});

// dist/diagnostics.js
var require_diagnostics = __commonJS({
  'dist/diagnostics.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.KNOWN_DONATE_CLASS_IDS = void 0;
    exports2.federationVersionRows = federationVersionRows;
    exports2.startHint = startHint;
    exports2.unreachableCause = unreachableCause;
    exports2.schemeMismatchHint = schemeMismatchHint;
    exports2.runDiagnostics = runDiagnostics;
    exports2.updateDiagRows = updateDiagRows;
    exports2.renderReport = renderReport;
    exports2.poolDoctorRow = poolDoctorRow;
    exports2.formatPoolStderr = formatPoolStderr;
    var mellifera_config_12 = require_dist();
    function federationVersionRows(v) {
      if (!v) {
        return [];
      }
      const fmt = x => (x.protocol === null ? 'unknown (pre-cutover)' : `protocol ${x.protocol}`);
      const rows = [
        {
          id: 'fed-protocol',
          state: 'ok',
          summary: `local ${fmt(v.local)}; global ${fmt(v.global)}`,
        },
        {
          id: 'fed-build',
          state: 'ok',
          summary: `local build ${v.local.build ?? 'unknown'}; global build ${v.global.build ?? 'unknown'}`,
        },
      ];
      if (v.local.protocol !== null && v.global.protocol !== null) {
        if (v.global.protocol < v.local.protocol) {
          rows.push({
            id: 'fed-version',
            state: 'warn',
            code: 'federation-global-behind',
            summary: `global protocol ${v.global.protocol} is behind local protocol ${v.local.protocol}`,
            next: 'Redeploy the global core from a current Mellifera build (CLUSTER.md#cl1-tip-redeploy-before-spill).',
          });
        } else if (v.local.protocol < v.global.protocol) {
          rows.push({
            id: 'fed-version',
            state: 'warn',
            code: 'federation-local-behind',
            summary: `local protocol ${v.local.protocol} is behind global protocol ${v.global.protocol}`,
            next: 'Rebuild and restart the local core from a current Mellifera checkout.',
          });
        }
      }
      return rows;
    }
    exports2.KNOWN_DONATE_CLASS_IDS = ['tart-macos-slot', 'linux', 'linux-nested-virt'];
    var PROBE_TIMEOUT_MS = 3e3;
    function startHint(settings) {
      const where = settings.melliferaCheckout.value
        ? `Run \`yarn start\` in ${settings.melliferaCheckout.value}`
        : 'Start it from the Mellifera checkout (`yarn start`) or its host service';
      return `${where}; mellifera-cli never starts the core. If it listens elsewhere, set MELLIFERA_URL or localUrl in ~/.mellifera/config.jsonc.`;
    }
    function unreachableCause(err) {
      const e = err;
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        return 'timed out';
      }
      const raw =
        `${e?.cause?.code || ''} ${e?.code || ''} ${e?.cause?.message || ''} ${e?.message || ''}`.toLowerCase();
      if (
        raw.includes('empty reply') ||
        raw.includes('econnreset') ||
        raw.includes('socket hang up') ||
        raw.includes('wrong version number') ||
        raw.includes('err_ssl') ||
        raw.includes('ssl23') ||
        raw.includes('packet length too long')
      ) {
        return 'connection closed (often HTTP dialed against an HTTPS core \u2014 use https:// in MELLIFERA_URL / localUrl)';
      }
      return e?.cause?.code || e?.code || e?.cause?.message || 'connection failed';
    }
    function schemeMismatchHint(localUrl, cause) {
      if (!localUrl.startsWith('http://')) {
        return void 0;
      }
      if (
        !/HTTPS core|empty reply|ECONNRESET|socket hang up|wrong version|ERR_SSL|scheme/i.test(
          cause,
        )
      ) {
        return void 0;
      }
      const httpsUrl = `https://${localUrl.slice('http://'.length)}`;
      return `If the local core logs "listening on https://\u2026", set MELLIFERA_URL=${httpsUrl} (and globalCaFile / MELLIFERA_TLS_CA when the cert is private).`;
    }
    async function probe(base, pathName, token) {
      let res;
      try {
        res = await fetch(`${base.replace(/\/$/, '')}${pathName}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : void 0,
          signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
        });
      } catch (err) {
        return { kind: 'unreachable', cause: unreachableCause(err) };
      }
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }
      return { kind: 'http', status: res.status, json };
    }
    function principalLabel(p) {
      return p ? `${p.id} (${p.role})` : 'none';
    }
    function secretLabel(name, r) {
      if (r.value === void 0) {
        return `${name}: unset`;
      }
      if (r.source === 'inherited') {
        return `${name}: inherited from token (${(0, mellifera_config_12.fingerprint)(r.value)})`;
      }
      return `${name}: ${(0, mellifera_config_12.fingerprint)(r.value)} (${r.source})`;
    }
    function configRow(loaded, error) {
      if (error) {
        const next =
          error.code === 'config-permissions-insecure'
            ? `chmod 600 ${error.file ?? '~/.mellifera/config.jsonc'}`
            : error.code === 'config-secret-source-conflict'
              ? 'Keep exactly one of the two named fields.'
              : 'Fix the named field or location, then re-run doctor.';
        return {
          id: 'config',
          state: 'fail',
          code: error.code,
          summary: `${error.message} Diagnostics below ignore the file.`,
          next,
        };
      }
      if (!loaded || loaded.state === 'skipped') {
        const why = loaded?.skipReason === 'no-home' ? 'HOME is not set' : '--no-config';
        return {
          id: 'config',
          state: 'skip',
          summary: `home config skipped (${why}); using env and built-in defaults`,
        };
      }
      if (loaded.state === 'absent') {
        return {
          id: 'config',
          state: 'note',
          summary: `absent at ${loaded.path}; using env and built-in defaults`,
          next: '`mellifera-cli mint-client-api-key --id ID` creates it with a minted token.',
        };
      }
      const mode = loaded.fileMode !== void 0 ? `0${loaded.fileMode.toString(8)}` : 'unchecked';
      if (loaded.warnings.length) {
        return {
          id: 'config',
          state: 'warn',
          code: loaded.warnings[0].code,
          summary: `present ${loaded.path} (mode ${mode}); ${loaded.warnings.map(w => w.message).join(' ')}`,
        };
      }
      return {
        id: 'config',
        state: 'ok',
        summary: `present ${loaded.path} (mode ${mode} accepted)`,
      };
    }
    function reconnectDetail(r) {
      if (!r || typeof r.attempts !== 'number') {
        return '';
      }
      const parts = [];
      if (r.lastDisconnectReason) {
        parts.push(`last disconnect: ${r.lastDisconnectReason}`);
      }
      parts.push(`${r.attempts} attempt(s)`);
      if (r.nextRetryAt) {
        const inMs = Date.parse(r.nextRetryAt) - Date.now();
        parts.push(
          `next retry ${r.nextRetryAt}${Number.isFinite(inMs) ? ` (in ${Math.max(0, Math.round(inMs / 1e3))}s)` : ''}`,
        );
      }
      return `; ${parts.join('; ')}`;
    }
    async function runDiagnostics(opts) {
      const env = opts.env ?? process.env;
      let loaded;
      let configError;
      try {
        loaded = (0, mellifera_config_12.loadHomeConfig)({
          env,
          noConfig: opts.noConfig,
          platform: opts.platform,
          knownClassIds: exports2.KNOWN_DONATE_CLASS_IDS,
        });
      } catch (err) {
        if (!(err instanceof mellifera_config_12.MelliferaConfigError)) {
          throw err;
        }
        configError = err;
      }
      const settings = (0, mellifera_config_12.resolveSettings)({
        flags: opts.flags,
        env,
        loaded: configError ? void 0 : loaded,
        knownClassIds: exports2.KNOWN_DONATE_CLASS_IDS,
      });
      (0, mellifera_config_12.installFetchCaTrust)(
        (0, mellifera_config_12.readCaFile)(settings.globalCaFile.value),
      );
      const rows = [configRow(loaded, configError)];
      rows.push({
        id: 'principals',
        state: settings.token.value ? 'ok' : 'note',
        summary: `${secretLabel('token', settings.token)}; ${secretLabel('globalToken', settings.globalToken)}`,
      });
      const localUrl = settings.localUrl.value;
      const health = await probe(localUrl, '/health');
      let local;
      if (
        health.kind === 'unreachable' ||
        health.status !== 200 ||
        health.json?.service !== 'mellifera'
      ) {
        const why =
          health.kind === 'unreachable'
            ? health.cause
            : `HTTP ${health.status} from something that is not a Mellifera core`;
        rows.push({
          id: 'local-core',
          state: 'fail',
          code: 'local-core-unreachable',
          summary: `no local core at ${localUrl} (${why})`,
          next: schemeMismatchHint(localUrl, why) ?? startHint(settings),
        });
      } else {
        const r = await probe(localUrl, '/v1/status/readiness', settings.token.value);
        if (r.kind === 'http' && r.status === 200) {
          local = r.json;
          rows.push({
            id: 'local-core',
            state: 'ok',
            summary: local.authConfigured
              ? `reachable at ${localUrl}; principal ${principalLabel(local.principal)}`
              : `reachable at ${localUrl}; auth not configured on this core`,
          });
        } else if (r.kind === 'http' && (r.status === 401 || r.status === 403)) {
          rows.push({
            id: 'local-core',
            state: 'fail',
            code: 'local-principal-rejected',
            summary: settings.token.value
              ? `reachable at ${localUrl}, but it rejected token ${(0, mellifera_config_12.fingerprint)(settings.token.value)}`
              : `reachable at ${localUrl}, but it requires a Bearer token and none is configured`,
            next: 'Install the keyHash for this token in the local core authKeys (mint-client-api-key does this) and restart the core.',
          });
        } else {
          rows.push({
            id: 'local-core',
            state: 'fail',
            code: 'local-core-unreachable',
            summary: `reachable at ${localUrl}, but /v1/status/readiness failed (${r.kind === 'http' ? `HTTP ${r.status}` : r.cause}); the core may predate status/doctor`,
            next: 'Rebuild and restart the core from the Mellifera checkout.',
          });
        }
      }
      const globalUrl = settings.globalUrl.value;
      let global;
      let globalHealth;
      if (!globalUrl) {
        rows.push({
          id: 'global',
          state: 'skip',
          summary: 'globalUrl not configured (federation off for this client)',
        });
      } else {
        const gh = await probe(globalUrl, '/health');
        const healthUnusable =
          gh.kind === 'unreachable' || gh.status !== 200 || gh.json?.service !== 'mellifera';
        if (!healthUnusable) globalHealth = gh.json;
        if (healthUnusable) {
          const cause = gh.kind === 'unreachable' ? gh.cause : `HTTP ${gh.status}`;
          rows.push({
            id: 'global',
            state: 'fail',
            code: 'global-core-unreachable',
            summary: `no global core at ${globalUrl} (${cause})`,
            next: (0, mellifera_config_12.isTlsTrustText)(
              gh.kind === 'unreachable' ? gh.cause : void 0,
            )
              ? mellifera_config_12.GLOBAL_CA_TRUST_NEXT
              : 'Check globalUrl and network reach to the global host; see CLUSTER.md.',
          });
        } else if (!settings.globalToken.value) {
          rows.push({
            id: 'global',
            state: 'fail',
            code: 'federation-token-missing',
            summary: `global core reachable at ${globalUrl}, but no globalToken or token is configured`,
            next: 'Mint a client key (mint-client-api-key) and install its keyHash on the global core.',
          });
        } else {
          const gr = await probe(globalUrl, '/v1/status/readiness', settings.globalToken.value);
          if (gr.kind === 'http' && gr.status === 200) {
            global = gr.json;
            rows.push({
              id: 'global',
              state: 'ok',
              summary: global.authConfigured
                ? `reachable at ${globalUrl}; principal ${principalLabel(global.principal)} accepted`
                : `reachable at ${globalUrl}; auth not configured on the global core`,
            });
          } else if (gr.kind === 'http' && (gr.status === 401 || gr.status === 403)) {
            rows.push({
              id: 'global',
              state: 'fail',
              code: 'federation-principal-rejected',
              summary: `global core at ${globalUrl} rejected principal ${(0, mellifera_config_12.fingerprint)(settings.globalToken.value)}`,
              next: 'Install the keyHash for this fingerprint in the global core authKeys and restart it (CLUSTER.md#cl1-auth-keys-upsert-restart).',
            });
          } else {
            rows.push({
              id: 'global',
              state: 'fail',
              code: 'global-core-unreachable',
              summary: `global core at ${globalUrl} did not answer /v1/status/readiness (${gr.kind === 'http' ? `HTTP ${gr.status}` : gr.cause})`,
              next: 'Redeploy the global core from a current Mellifera build.',
            });
          }
        }
      }
      const fed = local?.federation;
      if (!fed) {
        rows.push({
          id: 'federation',
          state: 'skip',
          summary: 'local core not readable; websocket state unknown',
        });
      } else if (fed.role === 'none') {
        rows.push({
          id: 'federation',
          state: 'skip',
          summary: 'local core federation role is none (no websocket)',
        });
      } else if (fed.role === 'global') {
        rows.push({
          id: 'federation',
          state: 'ok',
          summary: 'local core is the global (accepts inbound websockets)',
        });
      } else if (fed.globalConnected) {
        rows.push({
          id: 'federation',
          state: 'ok',
          summary: `local core websocket to ${fed.globalUrl ?? 'global'} is open`,
        });
      } else {
        const code = fed.globalError || 'federation-websocket-disconnected';
        const tlsTrust = (0, mellifera_config_12.isTlsTrustText)(
          fed.reconnect?.lastDisconnectReason,
        );
        const next = tlsTrust
          ? mellifera_config_12.GLOBAL_CA_TRUST_NEXT
          : code === 'federation-principal-rejected'
            ? "The global core refused the local core's globalToken; install its keyHash on the global core or fix globalToken. The local core retries about once a minute."
            : code === 'federation-principal-duplicate'
              ? 'Another core already holds a websocket for this principal on the global; stop the other core or mint a separate key for this one. The local core retries about once a minute.'
              : code === 'federation-protocol-too-old'
                ? 'The global core runs an older federation protocol than this core accepts; redeploy the global core from a current Mellifera build (CLUSTER.md#cl1-tip-redeploy-before-spill). The local core retries about once a minute.'
                : code === 'federation-id-mismatch'
                  ? 'This core and the global report different federation ids; fix MELLIFERA_FEDERATION_ID or globalUrl. The local core retries about once a minute.'
                  : code === 'federation-token-missing'
                    ? 'Set globalUrl and globalToken (or token) in ~/.mellifera/config.jsonc and restart the local core.'
                    : "The websocket is not open; see the last disconnect reason above. Check that the local core's globalUrl reaches the global core and that the global is running; it reconnects automatically once reachable, backing off to one attempt a minute.";
        rows.push({
          id: 'federation',
          state: code === 'federation-id-mismatch' ? 'warn' : 'fail',
          code,
          summary: `local core websocket to ${fed.globalUrl ?? 'global'} is not open${reconnectDetail(fed.reconnect)}`,
          next,
        });
      }
      if (fed?.role === 'local' && fed.localFit?.probe === 'unknown') {
        rows.push({
          id: 'local-fit',
          state: 'warn',
          code: 'local-fit-unknown',
          summary:
            'scaler local-fit probe failed (GET /v1/units); spill may fire while local units are free',
          next: 'Check MELLIFERA_SCALER_URL and MELLIFERA_SCALER_TOKEN reach the host scaler status listener.',
        });
      } else if (fed?.role === 'local' && fed.localFit?.probe === 'ok') {
        rows.push({
          id: 'local-fit',
          state: 'ok',
          summary: 'scaler local-fit probe answered',
        });
      } else if (fed?.role === 'local') {
        rows.push({
          id: 'local-fit',
          state: 'skip',
          summary: 'MELLIFERA_SCALER_URL unset; local-fit probe not run',
        });
      }
      const bastionFrom = global?.federation
        ? { view: global.federation, layer: 'global core' }
        : fed?.role === 'global'
          ? { view: fed, layer: 'local core' }
          : void 0;
      if (!bastionFrom) {
        rows.push({
          id: 'bastion',
          state: 'skip',
          summary: 'no global core readable; bastion state unknown',
        });
      } else if (!bastionFrom.view.bastion?.configured) {
        rows.push({
          id: 'bastion',
          state: 'skip',
          summary: `bastion control not configured on the ${bastionFrom.layer}`,
        });
      } else if (bastionFrom.view.bastion.healthy === false) {
        rows.push({
          id: 'bastion',
          state: 'fail',
          code: 'bastion-unavailable',
          summary: `the ${bastionFrom.layer} cannot reach its bastion control`,
          next: 'Start or repair the bastion service on the global host (CLUSTER.md); spill grants get no connectUrl until it answers.',
        });
      } else if (bastionFrom.view.bastion.healthy === null) {
        rows.push({
          id: 'bastion',
          state: 'warn',
          summary: `the ${bastionFrom.layer} has not probed its bastion yet; re-run shortly`,
        });
      } else {
        rows.push({
          id: 'bastion',
          state: 'ok',
          summary: `the ${bastionFrom.layer} reaches its bastion control`,
        });
      }
      const offersFrom = global?.federation ?? (fed?.role === 'global' ? fed : void 0);
      if (!offersFrom) {
        rows.push({
          id: 'capacity',
          state: 'skip',
          summary: 'no global core readable; donated capacity unknown',
        });
      } else if (!offersFrom.offers?.active) {
        rows.push({
          id: 'capacity',
          state: 'warn',
          code: 'no-donated-capacity',
          summary: 'no donated capacity is visible on the global core (0 active offers)',
          next: 'Spill has nowhere to land until a desk donates slots; local acquisition is unaffected.',
        });
      } else {
        rows.push({
          id: 'capacity',
          state: 'ok',
          summary: `${offersFrom.offers.active} active offer(s), ${offersFrom.offers.slots} donated slot(s) visible on the global core`,
        });
      }
      const pool = {};
      if (offersFrom?.offers) {
        pool.offers = {
          active: Number(offersFrom.offers.active) || 0,
          slots: Number(offersFrom.offers.slots) || 0,
        };
      }
      if (globalUrl && settings.globalToken.value) {
        const metrics = await probe(globalUrl, '/v1/metrics', settings.globalToken.value);
        if (metrics.kind === 'http' && metrics.status === 200 && metrics.json) {
          pool.summary = metrics.json.statusSummary ?? metrics.json.metrics ?? metrics.json;
        }
        const mine = await probe(globalUrl, '/v1/pool/grants?mine=1', settings.globalToken.value);
        if (mine.kind === 'http' && mine.status === 200) {
          const grants = Array.isArray(mine.json?.grants)
            ? mine.json.grants
            : Array.isArray(mine.json)
              ? mine.json
              : [];
          pool.grants = grants;
        }
      }
      rows.push({
        id: 'secret-at-rest',
        state: 'note',
        summary:
          'mode 0600 does not prevent backups, cloud sync, `cat`, or an accidental paste from exposing config secrets',
      });
      const num = x => (typeof x === 'number' ? x : null);
      const str = x => (typeof x === 'string' ? x : null);
      const lv = local?.federation?.version;
      const gv = global?.federation?.version;
      const versions = {
        local: {
          protocol: num(lv?.protocol),
          minProtocol: num(lv?.minProtocol),
          build: str(lv?.build),
        },
        global: {
          protocol: num(gv?.protocol ?? globalHealth?.protocol),
          minProtocol: num(gv?.minProtocol ?? globalHealth?.minProtocol),
          build: str(gv?.build),
        },
      };
      const localOk = rows.find(r => r.id === 'local-core')?.state === 'ok';
      const secrets = [settings.token.value, settings.globalToken.value].filter(s => Boolean(s));
      const asBuild = b => {
        if (!b || typeof b !== 'object') {
          return void 0;
        }
        const o = b;
        return {
          version: typeof o.version === 'string' ? o.version : null,
          commit: typeof o.commit === 'string' ? o.commit : null,
          dirty: typeof o.dirty === 'boolean' ? o.dirty : null,
          builtAt: typeof o.builtAt === 'string' ? o.builtAt : null,
          source: o.source === 'git' || o.source === 'release-tip' ? o.source : null,
        };
      };
      const update = (0, mellifera_config_12.updateRowsFromCache)({
        env,
        updateConfig: loaded?.config.update,
        noConfig: opts.noConfig,
        noUpdateCheck: opts.noUpdateCheck,
        withNext: false,
      });
      return {
        report: {
          ready: localOk && !rows.some(r => r.state === 'fail'),
          rows,
          federation: versions,
          ...(Object.keys(pool).length ? { pool } : {}),
          update,
        },
        secrets,
        builds: {
          local: asBuild(local?.build),
          global: asBuild(global?.build),
        },
        updateConfig: loaded?.config.update,
      };
    }
    function updateDiagRows(opts) {
      return (0, mellifera_config_12.updateRowsFromCache)({
        env: opts.env,
        noConfig: opts.noConfig,
        noUpdateCheck: opts.noUpdateCheck,
        updateConfig: opts.updateConfig,
        withNext: opts.withNext,
      }).map(r => ({
        id: r.id,
        state: r.state,
        code: r.code,
        summary: r.summary,
        next: r.next,
      }));
    }
    function renderReport(report, withNext, secrets) {
      const lines = [];
      for (const r of report.rows) {
        const state = r.state === 'fail' ? 'FAIL' : r.state;
        lines.push(
          `${r.id.padEnd(15)} ${state.padEnd(5)} ${r.code ? `${r.code}: ` : ''}${r.summary}`,
        );
        if (withNext && r.next && r.state !== 'ok') {
          lines.push(`${''.padEnd(22)}next: ${r.next}`);
        }
      }
      lines.push(
        `ready: ${report.ready ? 'yes' : 'no'} (config present is not readiness; each layer above was dialed)`,
      );
      return (0, mellifera_config_12.redactSecrets)(lines.join('\n'), secrets);
    }
    function poolDoctorRow(pool) {
      if (!pool || (pool.offers === void 0 && pool.grants === void 0 && pool.summary === void 0)) {
        return { id: 'pool', state: 'skip', summary: 'no global core readable; pool unknown' };
      }
      const active = pool.offers?.active ?? 0;
      const slots = pool.offers?.slots ?? 0;
      const grants = Array.isArray(pool.grants) ? pool.grants.length : void 0;
      const waiting =
        pool.summary && typeof pool.summary === 'object' ? pool.summary.capacity?.waits : void 0;
      const parts = [`${active} active offer(s)`, `${slots} free unit(s)`];
      if (typeof waiting === 'number') {
        parts.push(`${waiting} wait(s)`);
      }
      if (grants !== void 0) {
        parts.push(`${grants} own grant(s)`);
      }
      return { id: 'pool', state: 'ok', summary: parts.join(', ') };
    }
    function formatPoolStderr(pool) {
      if (!pool || (pool.offers === void 0 && pool.grants === void 0 && pool.summary === void 0)) {
        return void 0;
      }
      const active = pool.offers?.active ?? 0;
      const slots = pool.offers?.slots ?? 0;
      const grants = Array.isArray(pool.grants) ? pool.grants.length : 0;
      const waiting =
        pool.summary && typeof pool.summary === 'object' ? pool.summary.capacity?.waits : void 0;
      const waitPart = typeof waiting === 'number' ? `, waits=${waiting}` : '';
      return `[mellifera-cli] pool: offers=${active} free=${slots} grants=${grants}${waitPart}`;
    }
  },
});

// dist/exec.js
var require_exec = __commonJS({
  'dist/exec.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.looksLikeExecArgv = looksLikeExecArgv;
    exports2.parseExecArgv = parseExecArgv;
    exports2.splitRshPayload = splitRshPayload;
    exports2.shellQuote = shellQuote;
    exports2.buildRemoteShellCommand = buildRemoteShellCommand;
    exports2.buildKnownHostsLine = buildKnownHostsLine;
    exports2.writeTempKnownHosts = writeTempKnownHosts;
    exports2.sshArgv = sshArgv;
    exports2.spawnSsh = spawnSsh;
    var child_process_1 = require('child_process');
    var fs_12 = __importDefault2(require('fs'));
    var os_12 = __importDefault2(require('os'));
    var path_12 = __importDefault2(require('path'));
    var ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;
    function takeValue(argv, index, flag) {
      const value = argv[index + 1];
      if (value === void 0 || value === '--') {
        throw new Error(`${flag} requires a value`);
      }
      return value;
    }
    function parseEnvBinding(raw, flag) {
      const eq = raw.indexOf('=');
      if (eq <= 0) {
        throw new Error(`${flag} expects KEY=VALUE`);
      }
      const key = raw.slice(0, eq);
      const value = raw.slice(eq + 1);
      if (!ENV_KEY.test(key)) {
        throw new Error(`${flag} key must be a shell identifier`);
      }
      return { key, value };
    }
    function looksLikeExecArgv(argv) {
      for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === 'exec') {
          return true;
        }
        if (arg === '--') {
          return false;
        }
        if (arg === '--no-config' || arg === '--help' || arg === '-h') {
          continue;
        }
        if (arg === '--url' || arg === '--token' || arg === '--federation') {
          i += 1;
          continue;
        }
        if (
          arg.startsWith('--url=') ||
          arg.startsWith('--token=') ||
          arg.startsWith('--federation=')
        ) {
          continue;
        }
        if (arg.startsWith('-')) {
          continue;
        }
        return false;
      }
      return false;
    }
    function parseExecArgv(argv) {
      const req = {
        help: false,
        noConfig: false,
        interactive: false,
        tty: false,
        env: [],
        rsh: false,
        command: [],
      };
      let i = 0;
      let sawExec = false;
      while (i < argv.length) {
        const arg = argv[i];
        if (arg === 'exec') {
          sawExec = true;
          i += 1;
          break;
        }
        if (arg === '--no-config') {
          req.noConfig = true;
          i += 1;
          continue;
        }
        if (arg === '--url') {
          req.url = takeValue(argv, i, '--url');
          i += 2;
          continue;
        }
        if (arg.startsWith('--url=')) {
          req.url = arg.slice('--url='.length);
          i += 1;
          continue;
        }
        if (arg === '--token') {
          req.token = takeValue(argv, i, '--token');
          i += 2;
          continue;
        }
        if (arg.startsWith('--token=')) {
          req.token = arg.slice('--token='.length);
          i += 1;
          continue;
        }
        if (arg === '--federation') {
          req.federationId = takeValue(argv, i, '--federation').trim() || void 0;
          i += 2;
          continue;
        }
        if (arg.startsWith('--federation=')) {
          const id = arg.slice('--federation='.length).trim();
          req.federationId = id || void 0;
          i += 1;
          continue;
        }
        throw new Error(`unexpected argument before exec: ${arg}`);
      }
      if (!sawExec) {
        throw new Error('exec command is required');
      }
      while (i < argv.length) {
        const arg = argv[i];
        if (arg === '--') {
          req.command = argv.slice(i + 1);
          i = argv.length;
          break;
        }
        if (arg === '--rsh') {
          req.rsh = true;
          i += 1;
          if (argv[i] === '--') {
            i += 1;
          }
          req.command = splitRshPayload(argv.slice(i));
          i = argv.length;
          break;
        }
        if (arg === '--help' || arg === '-h') {
          req.help = true;
          return req;
        }
        if (arg === '--no-config') {
          req.noConfig = true;
          i += 1;
          continue;
        }
        if (arg === '--url') {
          req.url = takeValue(argv, i, '--url');
          i += 2;
          continue;
        }
        if (arg.startsWith('--url=')) {
          req.url = arg.slice('--url='.length);
          i += 1;
          continue;
        }
        if (arg === '--token') {
          req.token = takeValue(argv, i, '--token');
          i += 2;
          continue;
        }
        if (arg.startsWith('--token=')) {
          req.token = arg.slice('--token='.length);
          i += 1;
          continue;
        }
        if (arg === '--federation') {
          req.federationId = takeValue(argv, i, '--federation').trim() || void 0;
          i += 2;
          continue;
        }
        if (arg.startsWith('--federation=')) {
          const id = arg.slice('--federation='.length).trim();
          req.federationId = id || void 0;
          i += 1;
          continue;
        }
        if (arg === '--session') {
          req.session = takeValue(argv, i, '--session');
          i += 2;
          continue;
        }
        if (arg.startsWith('--session=')) {
          req.session = arg.slice('--session='.length);
          i += 1;
          continue;
        }
        if (arg === '-i' || arg === '--interactive') {
          req.interactive = true;
          i += 1;
          continue;
        }
        if (arg === '-t' || arg === '--tty') {
          req.tty = true;
          i += 1;
          continue;
        }
        if (arg === '-w' || arg === '--workdir') {
          req.workdir = takeValue(argv, i, arg);
          i += 2;
          continue;
        }
        if (arg.startsWith('--workdir=')) {
          req.workdir = arg.slice('--workdir='.length);
          i += 1;
          continue;
        }
        if (arg === '-e' || arg === '--env') {
          req.env.push(parseEnvBinding(takeValue(argv, i, arg), arg));
          i += 2;
          continue;
        }
        if (arg.startsWith('--env=')) {
          req.env.push(parseEnvBinding(arg.slice('--env='.length), '--env'));
          i += 1;
          continue;
        }
        if (arg.startsWith('-')) {
          throw new Error(`unknown exec option: ${arg}`);
        }
        req.command = argv.slice(i);
        break;
      }
      if (req.help) {
        return req;
      }
      if (req.rsh) {
        req.interactive = true;
        req.tty = false;
      }
      if (!req.command.length) {
        throw new Error(
          req.rsh ? '--rsh requires a host and a remote command' : 'exec requires a command',
        );
      }
      return req;
    }
    function splitRshPayload(argv) {
      let i = 0;
      if (argv[i] === '-l') {
        if (argv[i + 1] === void 0) {
          throw new Error('--rsh -l requires a user');
        }
        i += 2;
      }
      if (argv[i] === void 0) {
        throw new Error('--rsh requires a host and a remote command');
      }
      i += 1;
      return argv.slice(i);
    }
    function shellQuote(value) {
      return `'${value.replace(/'/g, `'\\''`)}'`;
    }
    function buildRemoteShellCommand(command, workdir, env) {
      if (!command.length) {
        throw new Error('exec requires a command');
      }
      for (const binding of env) {
        if (!ENV_KEY.test(binding.key)) {
          throw new Error(`--env key must be a shell identifier`);
        }
      }
      const quoted = command.map(shellQuote).join(' ');
      const execPart = env.length
        ? `exec -- env ${env.map(binding => `${binding.key}=${shellQuote(binding.value)}`).join(' ')} ${quoted}`
        : `exec -- ${quoted}`;
      if (workdir !== void 0) {
        return `cd -- ${shellQuote(workdir)} && ${execPart}`;
      }
      return execPart;
    }
    var IDENTITY_NAMES = ['mellifera_client_ed25519', 'id_ed25519', 'id_rsa', 'id_ecdsa'];
    function buildKnownHostsLine(connectUrl, hostKeyPin) {
      const pin = hostKeyPin.trim();
      if (!pin) {
        throw new Error('hostKeyPin is empty');
      }
      const pinParts = pin.split(/\s+/);
      if (pinParts.length < 2) {
        throw new Error('hostKeyPin must be "keytype key [comment]"');
      }
      const keyType = pinParts[0];
      const keyData = pinParts[1];
      const comment = pinParts.slice(2).join(' ');
      let parsed;
      try {
        parsed = new URL(connectUrl);
      } catch {
        throw new Error('connectUrl is not a valid URL');
      }
      const host = parsed.hostname;
      if (!host) {
        throw new Error('connectUrl has no host');
      }
      const port = parsed.port ? Number(parsed.port) : 22;
      if (!Number.isFinite(port) || port <= 0) {
        throw new Error('connectUrl has an invalid port');
      }
      const marker = port === 22 ? host : `[${host}]:${port}`;
      return comment
        ? `${marker} ${keyType} ${keyData} ${comment}`
        : `${marker} ${keyType} ${keyData}`;
    }
    function writeTempKnownHosts(connectUrl, hostKeyPin) {
      const line = buildKnownHostsLine(connectUrl, hostKeyPin);
      const dir = fs_12.default.mkdtempSync(
        path_12.default.join(os_12.default.tmpdir(), 'mellifera-kh-'),
      );
      const file = path_12.default.join(dir, 'known_hosts');
      fs_12.default.writeFileSync(
        file,
        `${line}
`,
        { mode: 384 },
      );
      return file;
    }
    function sshArgv(opts) {
      const knownHosts =
        opts.knownHostsFile && opts.knownHostsFile.trim()
          ? opts.knownHostsFile.trim()
          : path_12.default.join(opts.home, '.ssh', 'known_hosts');
      const args = [
        '-o',
        'BatchMode=yes',
        '-o',
        'NumberOfPasswordPrompts=0',
        '-o',
        'ConnectTimeout=30',
        '-o',
        'StrictHostKeyChecking=yes',
        '-o',
        `UserKnownHostsFile=${knownHosts}`,
        '-o',
        'GlobalKnownHostsFile=/dev/null',
      ];
      const identities = IDENTITY_NAMES.map(name =>
        path_12.default.join(opts.home, '.ssh', name),
      ).filter(file => fs_12.default.existsSync(file));
      if (identities.length) {
        args.push('-o', 'IdentitiesOnly=yes');
        for (const file of identities) {
          args.push('-o', `IdentityFile=${file}`);
        }
      }
      if (!opts.interactive) {
        args.push('-n');
      }
      args.push(opts.tty ? '-tt' : '-T');
      args.push('--', opts.connectUrl, opts.remoteCommand);
      return args;
    }
    function spawnSsh(opts) {
      const child = (0, child_process_1.spawn)('ssh', sshArgv(opts), {
        stdio: [opts.interactive ? 'inherit' : 'ignore', 'inherit', 'inherit'],
        shell: false,
        windowsHide: true,
      });
      return new Promise((resolve, reject) => {
        child.on('error', err => {
          reject(err);
        });
        child.on('close', (status, signal) => {
          resolve({ status, signal });
        });
      });
    }
  },
});

// dist/fingerprint.js
var require_fingerprint = __commonJS({
  'dist/fingerprint.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.publicKeyFingerprint = publicKeyFingerprint;
    exports2.resolveRequesterFingerprint = resolveRequesterFingerprint;
    var node_crypto_1 = require('node:crypto');
    var node_fs_1 = require('node:fs');
    var node_os_1 = __importDefault2(require('node:os'));
    var node_path_1 = __importDefault2(require('node:path'));
    var IDENTITY_NAMES = ['mellifera_client_ed25519', 'id_ed25519', 'id_rsa', 'id_ecdsa'];
    function publicKeyFingerprint(line) {
      const parts = line.trim().split(/\s+/);
      const blob = parts.length >= 2 && /^(ssh|ecdsa|sk)-/.test(parts[0]) ? parts[1] : '';
      if (!blob || !/^[A-Za-z0-9+/]+=*$/.test(blob)) {
        return null;
      }
      const raw = Buffer.from(blob, 'base64');
      if (raw.length === 0) {
        return null;
      }
      return `SHA256:${(0, node_crypto_1.createHash)('sha256').update(raw).digest('base64').replace(/=+$/, '')}`;
    }
    function resolveRequesterFingerprint(home = node_os_1.default.homedir()) {
      const fromEnv = (process.env.MELLIFERA_REQUESTER_KEY_FINGERPRINT || '').trim();
      if (fromEnv) {
        return fromEnv;
      }
      for (const name of IDENTITY_NAMES) {
        try {
          const fp = publicKeyFingerprint(
            (0, node_fs_1.readFileSync)(
              node_path_1.default.join(home, '.ssh', `${name}.pub`),
              'utf8',
            ),
          );
          if (fp) {
            return fp;
          }
        } catch {}
      }
      return void 0;
    }
  },
});

// dist/logger.js
var require_logger = __commonJS({
  'dist/logger.js'(exports2) {
    'use strict';
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.diag = diag;
    function diag(message) {
      console.error(`${/* @__PURE__ */ new Date().toISOString()} ${message}`);
    }
  },
});

// dist/session-store.js
var require_session_store = __commonJS({
  'dist/session-store.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.canonicalWorktree = canonicalWorktree;
    exports2.sessionFileName = sessionFileName;
    exports2.sessionFilePath = sessionFilePath;
    exports2.readWorktreeSession = readWorktreeSession;
    exports2.writeWorktreeSession = writeWorktreeSession;
    exports2.removeWorktreeSession = removeWorktreeSession;
    var crypto_12 = require('crypto');
    var child_process_1 = require('child_process');
    var fs_12 = __importDefault2(require('fs'));
    var path_12 = __importDefault2(require('path'));
    var SAFE_CHAR = /^[A-Za-z0-9._~-]$/;
    function canonicalWorktree(cwd) {
      let top = cwd;
      try {
        const out = (0, child_process_1.execFileSync)('git', ['rev-parse', '--show-toplevel'], {
          cwd,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        if (out) {
          top = out;
        }
      } catch {
        top = cwd;
      }
      return fs_12.default.realpathSync.native(top);
    }
    function sessionFileName(canonical) {
      let encoded = '';
      for (const ch of canonical) {
        if (SAFE_CHAR.test(ch)) {
          encoded += ch;
        } else {
          for (const byte of Buffer.from(ch, 'utf8')) {
            encoded += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
          }
        }
      }
      if (encoded.length > 200) {
        return `${(0, crypto_12.createHash)('sha256').update(canonical, 'utf8').digest('hex')}.json`;
      }
      return `${encoded}.json`;
    }
    function sessionFilePath(home, canonical) {
      return path_12.default.join(home, '.mellifera', 'sessions', sessionFileName(canonical));
    }
    function isRecord(value) {
      if (!value || typeof value !== 'object') {
        return false;
      }
      const rec = value;
      if (
        typeof rec.worktree !== 'string' ||
        typeof rec.sessionId !== 'string' ||
        typeof rec.slot !== 'number' ||
        typeof rec.token !== 'string' ||
        typeof rec.updatedAt !== 'string' ||
        typeof rec.expiresAt !== 'string'
      ) {
        return false;
      }
      if (rec.mode !== void 0 && rec.mode !== 'local' && rec.mode !== 'global') {
        return false;
      }
      if (rec.connectUrl !== void 0 && typeof rec.connectUrl !== 'string') {
        return false;
      }
      return true;
    }
    function readWorktreeSession(home, cwd) {
      const canonical = canonicalWorktree(cwd);
      const file = sessionFilePath(home, canonical);
      if (!fs_12.default.existsSync(file)) {
        return null;
      }
      let parsed;
      try {
        parsed = JSON.parse(fs_12.default.readFileSync(file, 'utf8'));
      } catch {
        throw new Error(`session record at ${file} is not valid JSON`);
      }
      if (!isRecord(parsed)) {
        throw new Error(`session record at ${file} is missing required fields`);
      }
      if (parsed.worktree !== canonical) {
        return null;
      }
      return { path: file, record: parsed };
    }
    function writeWorktreeSession(home, cwd, fields) {
      const canonical = canonicalWorktree(cwd);
      const file = sessionFilePath(home, canonical);
      const dir = path_12.default.dirname(file);
      const root = path_12.default.join(home, '.mellifera');
      fs_12.default.mkdirSync(dir, { recursive: true, mode: 448 });
      fs_12.default.chmodSync(root, 448);
      fs_12.default.chmodSync(dir, 448);
      const record = {
        worktree: canonical,
        sessionId: fields.sessionId,
        slot: fields.slot,
        token: fields.token,
        updatedAt: /* @__PURE__ */ new Date().toISOString(),
        expiresAt: fields.expiresAt,
        ...(fields.mode ? { mode: fields.mode } : {}),
        ...(fields.connectUrl ? { connectUrl: fields.connectUrl } : {}),
      };
      const tmp = `${file}.${process.pid}.tmp`;
      fs_12.default.writeFileSync(
        tmp,
        `${JSON.stringify(record, null, 2)}
`,
        { mode: 384 },
      );
      fs_12.default.chmodSync(tmp, 384);
      fs_12.default.renameSync(tmp, file);
      fs_12.default.chmodSync(file, 384);
      return { path: file, record };
    }
    function removeWorktreeSession(home, cwd) {
      const canonical = canonicalWorktree(cwd);
      const file = sessionFilePath(home, canonical);
      if (fs_12.default.existsSync(file)) {
        fs_12.default.unlinkSync(file);
      }
    }
  },
});

// dist/pool-cli.js
var require_pool_cli = __commonJS({
  'dist/pool-cli.js'(exports2) {
    'use strict';
    var __importDefault2 =
      (exports2 && exports2.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports2, '__esModule', { value: true });
    exports2.PoolCliError = void 0;
    exports2.parseAccept = parseAccept;
    exports2.parseTrust = parseTrust;
    exports2.parseWarm = parseWarm;
    exports2.parseScopeRepos = parseScopeRepos;
    exports2.parseWindow = parseWindow;
    exports2.parseDonateKinds = parseDonateKinds;
    exports2.donateOfferExtras = donateOfferExtras;
    exports2.reserveGlobal = reserveGlobal;
    var node_os_1 = __importDefault2(require('node:os'));
    var fingerprint_12 = require_fingerprint();
    var logger_12 = require_logger();
    var session_store_12 = require_session_store();
    var PoolCliError = class extends Error {
      code;
      body;
      constructor(code, message, body) {
        super(message);
        this.code = code;
        this.body = body;
      }
    };
    exports2.PoolCliError = PoolCliError;
    var ACCEPT_VALUES = /* @__PURE__ */ new Set(['interactive', 'ci']);
    function parseAccept(raw) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new PoolCliError(
          'accept-invalid',
          '--accept needs a comma-separated list of interactive and/or ci',
        );
      }
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      for (const part of raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)) {
        if (!ACCEPT_VALUES.has(part)) {
          throw new PoolCliError(
            'accept-invalid',
            `--accept values must be interactive or ci (got ${part})`,
          );
        }
        if (seen.has(part)) {
          continue;
        }
        seen.add(part);
        out.push(part);
      }
      if (!out.length) {
        throw new PoolCliError(
          'accept-invalid',
          '--accept needs a comma-separated list of interactive and/or ci',
        );
      }
      return out;
    }
    function parseTrust(raw, isDesk) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || (raw !== 'trusted' && raw !== 'untrusted-ok')) {
        throw new PoolCliError('trust-invalid', '--trust must be trusted or untrusted-ok');
      }
      if (isDesk && raw === 'untrusted-ok') {
        throw new PoolCliError(
          'trust-desk-refused',
          '--trust untrusted-ok is only for ephemeral-guest (class) offers; desk slots refuse it',
        );
      }
      return raw;
    }
    function parseWarm(raw) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || !/^\d+$/.test(raw.trim())) {
        throw new PoolCliError('warm-invalid', '--warm needs a non-negative integer');
      }
      return Number(raw.trim());
    }
    function parseScopeRepos(raw) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new PoolCliError(
          'scope-repos-invalid',
          '--scope-repos needs a comma-separated list of owner/name repos',
        );
      }
      const repos = raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (!repos.length) {
        throw new PoolCliError(
          'scope-repos-invalid',
          '--scope-repos needs a comma-separated list of owner/name repos',
        );
      }
      return repos;
    }
    function parseWindow(raw) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new PoolCliError(
          'window-invalid',
          '--window needs a JSON object { "tz", "rules": [{ "days", "from", "to" }] }',
        );
      }
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new PoolCliError('window-invalid', '--window must be valid JSON');
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new PoolCliError('window-invalid', '--window must be a JSON object { tz, rules }');
      }
      const obj = parsed;
      if (
        typeof obj.tz !== 'string' ||
        !obj.tz.trim() ||
        !Array.isArray(obj.rules) ||
        !obj.rules.length
      ) {
        throw new PoolCliError('window-invalid', '--window needs tz and a non-empty rules array');
      }
      const rules = [];
      for (const rule of obj.rules) {
        if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
          throw new PoolCliError(
            'window-invalid',
            '--window rules must be objects { days, from, to }',
          );
        }
        const r = rule;
        if (typeof r.days !== 'string' || typeof r.from !== 'string' || typeof r.to !== 'string') {
          throw new PoolCliError(
            'window-invalid',
            '--window rules must be objects { days, from, to }',
          );
        }
        rules.push({ days: r.days, from: r.from, to: r.to });
      }
      return { tz: obj.tz.trim(), rules };
    }
    function parseDonateKinds(raw) {
      if (raw === void 0) {
        return void 0;
      }
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new PoolCliError('kinds-invalid', '--kinds needs a comma-separated list');
      }
      const kinds = raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (!kinds.length) {
        throw new PoolCliError('kinds-invalid', '--kinds needs a comma-separated list');
      }
      return kinds;
    }
    function donateOfferExtras(args, isDesk) {
      const extras = {};
      const accepts = parseAccept(args.accept);
      if (accepts) {
        extras.accepts = accepts;
      }
      const trust = parseTrust(args.trust, isDesk);
      if (trust) {
        extras.trustCeiling = trust;
      }
      const warm = parseWarm(args.warm);
      if (warm !== void 0) {
        extras.warm = warm;
      }
      const window = parseWindow(args.window);
      if (window) {
        extras.window = window;
      }
      const scopeRepos = parseScopeRepos(args['scope-repos']);
      if (scopeRepos) {
        extras.scope = { repos: scopeRepos };
      }
      const kinds = parseDonateKinds(args.kinds);
      if (kinds) {
        extras.kinds = kinds;
      }
      return extras;
    }
    function emitSide(json, payload, body) {
      const side = { ...payload };
      if (typeof body?.waitId === 'string') {
        side.waitId = body.waitId;
      } else if (typeof side.waitId !== 'string') {
        delete side.waitId;
      }
      if (json) {
        (0, logger_12.diag)(JSON.stringify(side));
        return;
      }
      (0, logger_12.diag)(JSON.stringify(side));
    }
    async function reserveGlobal(opts) {
      const fingerprint =
        opts.fingerprint ||
        (0, fingerprint_12.resolveRequesterFingerprint)(opts.home) ||
        process.env.MELLIFERA_REQUESTER_KEY_FINGERPRINT?.trim();
      if (!fingerprint) {
        throw new PoolCliError(
          'requester-key-required',
          'reserve --global needs an SSH fingerprint: set MELLIFERA_REQUESTER_KEY_FINGERPRINT or place a key at ~/.ssh/id_ed25519.pub (or mellifera_client_ed25519.pub)',
        );
      }
      const body = {
        kinds: opts.kinds,
        ttlMs: opts.ttlMs,
        requesterKeyFingerprint: fingerprint,
      };
      if (opts.waitMs !== void 0) {
        body.waitMs = opts.waitMs;
      }
      if (opts.repo) {
        body.repo = opts.repo;
      }
      if (opts.runId !== void 0) {
        body.runId = opts.runId;
      }
      let enqueued;
      try {
        enqueued = await opts.request('POST', '/v1/pool/waits', body, opts.token, opts.globalUrl);
      } catch (err) {
        const status = err.status;
        const errBody = err.body;
        const code = errBody?.error || err.message;
        if (status === 409 && code === 'admission-deadline') {
          emitSide(
            opts.json,
            { error: 'admission-deadline', estimate: errBody?.estimate },
            errBody && typeof errBody === 'object' ? errBody : void 0,
          );
          throw new PoolCliError(
            'admission-deadline',
            'admission deadline passed before a grant was available',
            errBody,
          );
        }
        throw err;
      }
      if (enqueued?.estimate) {
        emitSide(opts.json, { waitId: enqueued.waitId, estimate: enqueued.estimate });
      }
      const waitId = enqueued.waitId;
      const deadline = Date.now() + (opts.waitMs ?? 18e4) + 5e3;
      let grantId;
      while (Date.now() < deadline) {
        const state = await opts.request(
          'POST',
          `/v1/pool/waits/${encodeURIComponent(waitId)}/check-in`,
          {},
          opts.token,
          opts.globalUrl,
        );
        if (state?.estimate) {
          emitSide(opts.json, { waitId, estimate: state.estimate, state: state.state });
        }
        if (state?.state === 'granted' || state?.grantId || state?.state === 'placed') {
          grantId = state.grantId || grantId;
          break;
        }
        if (state?.state === 'failed' || state?.error) {
          throw new PoolCliError(
            state.error || 'unavailable',
            typeof state.message === 'string' ? state.message : `wait ${waitId} failed`,
            state,
          );
        }
        await new Promise(r => setTimeout(r, 200));
      }
      if (!grantId) {
      }
      let claimed;
      try {
        claimed = await opts.request(
          'POST',
          `/v1/pool/waits/${encodeURIComponent(waitId)}/claim`,
          {},
          opts.token,
          opts.globalUrl,
        );
      } catch (err) {
        const status = err.status;
        const errBody = err.body;
        if (status === 409) {
          for (let i = 0; i < 25; i += 1) {
            await new Promise(r => setTimeout(r, 200));
            const state = await opts.request(
              'POST',
              `/v1/pool/waits/${encodeURIComponent(waitId)}/check-in`,
              {},
              opts.token,
              opts.globalUrl,
            );
            if (state?.estimate) {
              emitSide(opts.json, { waitId, estimate: state.estimate, state: state.state });
            }
            try {
              claimed = await opts.request(
                'POST',
                `/v1/pool/waits/${encodeURIComponent(waitId)}/claim`,
                {},
                opts.token,
                opts.globalUrl,
              );
              break;
            } catch (inner) {
              if (inner.status !== 409) {
                throw inner;
              }
            }
          }
        } else {
          throw err;
        }
        if (!claimed) {
          throw err;
        }
      }
      const connectUrl = typeof claimed.connectUrl === 'string' ? claimed.connectUrl : '';
      const result = {
        sessionId: claimed.grantId,
        token: claimed.token,
        owner: `${node_os_1.default.hostname()}:${(0, session_store_12.canonicalWorktree)(opts.cwd)}`,
        execution: {
          workerId: 'pool',
          host: 'global',
          ...(connectUrl ? { connectUrl } : {}),
          checkoutMode: connectUrl ? 'remote' : 'local',
        },
        kinds: opts.kinds,
        placement: 'pool',
        slot: 0,
        pending: [],
        env: {},
        expiresAt: claimed.expiresAt,
        phase: 'pool-global',
        federation: { grantId: claimed.grantId },
      };
      if (!opts.noState) {
        (0, session_store_12.writeWorktreeSession)(opts.home, opts.cwd, {
          sessionId: String(claimed.grantId),
          slot: 0,
          token: String(claimed.token),
          expiresAt: typeof claimed.expiresAt === 'string' ? claimed.expiresAt : '',
          mode: 'global',
          ...(connectUrl ? { connectUrl } : {}),
        });
      }
      return result;
    }
  },
});

// dist/cli.js
var __createBinding =
  (exports && exports.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (exports && exports.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (exports && exports.__importStar) ||
  /* @__PURE__ */ (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (exports && exports.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var crypto_1 = require('crypto');
var os_1 = __importDefault(require('os'));
var path_1 = __importDefault(require('path'));
var fs_1 = __importDefault(require('fs'));
var mellifera_config_1 = require_dist();
var build_info_1 = require_build_info2();
var diagnostics_1 = require_diagnostics();
var exec_1 = require_exec();
var fingerprint_1 = require_fingerprint();
var logger_1 = require_logger();
var pool_cli_1 = require_pool_cli();
var session_store_1 = require_session_store();
var SETTINGS = (0, mellifera_config_1.resolveSettings)({ env: {} });
var BASE = SETTINGS.localUrl.value;
var CLIENT_API_KEY_ROLES = new Set(mellifera_config_1.PRINCIPAL_ROLES);
var CWD_APPLY_SCRIPT = path_1.default.join('scripts', 'e2e', 'mellifera-apply-reservation.js');
var CliError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
async function request(method, pathName, body, token, baseUrl) {
  const headers = {};
  token = token ?? SETTINGS.token.value;
  if (body !== void 0) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const base = (baseUrl || BASE).replace(/\/$/, '');
  const globalDial = Boolean(
    baseUrl && SETTINGS.globalUrl.value && base === SETTINGS.globalUrl.value.replace(/\/$/, ''),
  );
  let res;
  try {
    res = await fetch(`${base}${pathName}`, {
      method,
      headers: Object.keys(headers).length ? headers : void 0,
      body: body !== void 0 ? JSON.stringify(body) : void 0,
    });
  } catch (err) {
    const cause = (0, diagnostics_1.unreachableCause)(err);
    if (globalDial) {
      throw new CliError('global-core-unreachable', `no global core at ${base} (${cause})`);
    }
    const schemeHint = (0, diagnostics_1.schemeMismatchHint)(base, cause);
    throw new CliError(
      'local-core-unreachable',
      `no local core at ${base} (${cause}). ${schemeHint ?? (0, diagnostics_1.startHint)(SETTINGS)}`,
    );
  }
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(json.error || res.statusText);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}
function usage() {
  console.log(`Usage:
  mellifera-cli --version                        # print stamped build identity
  mellifera-cli status [--json]                  # layer rows: config, principals, local core, global, ...
  mellifera-cli doctor [--json]                  # status plus the next action for every non-ok row
  mellifera-cli update check [--json]            # refresh notify-only GitHub main compare (desks)
  mellifera-cli catalog                          # Mlf-AD-9 environment kinds
  mellifera-cli resources                        # per-worker local slot availability
  mellifera-cli availability --kinds a,b,c
  mellifera-cli capacity
  mellifera-cli reserve [--owner HOST:PATH] [--kinds a,b,c]
                        [--local-wait-ms N] [--remote-wait-ms N]
                        [--allow-autoscale | --no-autoscale]
                        [--preferred-slots 5,6,7] [--ttl-ms N] [--timeout-ms N] [--worker-id ID]
                        [--no-state] [--global] [--json]
  mellifera-cli register --slots N,M [--worker-id ID]
  mellifera-cli unregister [--worker-id ID]
  mellifera-cli donate [--slots N,M] [--worker-id ID]
                       [--accept interactive,ci] [--trust untrusted-ok] [--window JSON]
                       [--warm N] [--scope-repos a/b,c/d] [--kinds a,b]
  mellifera-cli donate --retract [--slots N,M] [--worker-id ID]
  mellifera-cli donate --class CLASS --slots N [--worker-id ID]
                       [--accept interactive,ci] [--trust untrusted-ok] [--window JSON]
                       [--warm N] [--scope-repos a/b,c/d] [--kinds a,b]
  mellifera-cli donate --retract --class CLASS [--worker-id ID]
  mellifera-cli donate --pause [--slots N,M] [--class CLASS] [--worker-id ID]
  mellifera-cli donate --reclaim [--now] [--slots N,M] [--class CLASS] [--worker-id ID]
  mellifera-cli session show [--session-id ID]
  mellifera-cli session clear [--release]
  mellifera-cli acquire --session-id ID --token T --kinds a,b,c
  mellifera-cli extend --session-id ID --token T [--ttl-ms N]
  mellifera-cli release [--session-id ID --token TOKEN]
  mellifera-cli session --session-id ID
  mellifera-cli exec [-i] [-t] [-w DIR] [-e KEY=VALUE]... [--session SESSION_ID] [--] COMMAND [ARG...]
  mellifera-cli exec --rsh [--session SESSION_ID] [-l USER] HOST COMMAND [ARG...]
  mellifera-cli mint-worker-reg --worker-id ID [--ttl-seconds N]
  mellifera-cli mint-client-api-key --id ID [--role client|ci|service|\u2026]
                       [--repos owner/name[,\u2026]] [--max-ttl-ms N] [--max-concurrent-grants N]
                       [--out-raw PATH] [--keys-file PATH]

Every command accepts --no-config (skip ~/.mellifera/config.jsonc), --url URL (local
  core socket), and --federation ID (or --federation=ID). --federation selects
  ~/.mellifera/<id>/local/ when instance env is unset; it is not an HTTP header and
  does not change --url. Federation id precedence: CLI flag > non-empty
  MELLIFERA_FEDERATION_ID > config federationId > default.
Desk slot lists are a caller-chosen subset of the shared band 0-7. Omitted --slots uses
  desk.registerSlots or desk.donateSlots from config. Output prints the effective list.
  donate --retract stops new global placement on that offer. These commands talk to the
  local core; they do not start it.
donate --class offers N units of a provisionable class (tart-macos-slot, linux,
  linux-nested-virt) instead of desk slots. A global places only the matching kind on it
  (tart-macos-slot takes macos-self-hosted), and each placement asks the donor core's
  scaler to lock a unit. --slots is a count here, not desk indexes. The core rejects an
  unknown class. The offer id is class-CLASS-WORKER (--worker-id, else MELLIFERA_WORKER_ID,
  else the hostname). donate --retract --class withdraws that class offer.
  A donate --class offer ends when the core restarts. To keep it, list it in the core's
  config "donate" (or MELLIFERA_DONATE); then a retract lasts until the next core start.

reserve writes ~/.mellifera/sessions/<worktree>.json (mode 0600) for the current
  git worktree unless --no-state. --no-state writes nothing and prints the grant JSON
  plus shell export lines. Defaults are local wait 0, remote wait 0, autoscale allowed,
  and no overall deadline. A success reports phase local, spill-existing, or spill-autoscale.
  bare --wait is deprecated and local-only and is not a supported command. It never spills.
  The verbs wait, check-in, claim, and wait-status are not supported commands.
  release with no --session-id and no --token uses that record
  and, on success, removes it. session clear removes the record and does not release
  unless --release is set. session show dials the core and reports live, expired, or missing.
  Status output never includes the session token.

exec runs COMMAND on the live grant over ssh (execution.connectUrl). It is the
  remote command transport. It does not sync a checkout, install dependencies,
  or release the grant. Full suites stay on the consumer runbook, which calls
  this command. Each argument is shell-quoted and sent as one remote argv
  element. -i forwards stdin. Without -t, stdout and stderr stay separate and
  stdin/stdout are byte streams. -t allocates a PTY even without a local TTY;
  the remote stderr stream is then merged into stdout. -w DIR and repeated
  -e KEY=VALUE are applied by the remote shell. -- ends exec options.
  --rsh serves programs that supply a remote shell (rsync --rsh, GIT_SSH_COMMAND).
  It drops a leading -l USER pair when present and the next host argument, then
  runs the remaining argv on the grant with stdin forwarded and no PTY. That
  remaining argv is not parsed as exec options. --session selects a grant other
  than the current worktree record. The process exit status is the remote
  command's status when ssh starts (126 when the command cannot be invoked,
  127 when it cannot be found). A grant that is not checkoutMode remote with a
  connectUrl fails before ssh starts.

Config: ~/.mellifera/config.jsonc (JSONC, mode 0600, directory 0700). Precedence is
  CLI flag > non-empty MELLIFERA_* env > config > built-in. A file with group/other
  permission bits is refused (config-permissions-insecure) and no secret is read from it.
  A present config is not readiness: run doctor, which dials every layer.

Local core: mellifera-cli never starts it. Start it from the Mellifera checkout
  (yarn start) or its host service. A stopped core fails with local-core-unreachable.

Auth (when coordinator has MELLIFERA_AUTH_KEYS / authKeys):
  --token, MELLIFERA_TOKEN, or config token   raw Bearer for mutating / credential routes
  mint-worker-reg requires an admin token; prints only the registration token
  mint-client-api-key is local (no HTTP): upserts "token" and the matching
    { id, role, keyHash, repos?, maxTtlMs?, maxConcurrentGrants? } into
    ~/.mellifera/config.jsonc, keeping comments. --role ci requires --repos.
    stdout is id, role, fingerprint, and paths only (never the raw key). --out-raw PATH
    also writes the raw key (mode 600); --keys-file PATH also upserts that authKeys entry;
    --no-config skips the config write and then requires --out-raw.

Owner default: ${os_1.default.hostname()}:$PWD
Local core URL: ${BASE} (${SETTINGS.localUrl.source})`);
}
function sha256Hex(raw) {
  return (0, crypto_1.createHash)('sha256').update(raw, 'utf8').digest('hex');
}
function newClientApiKeyRaw() {
  return (0, crypto_1.randomBytes)(32).toString('hex');
}
function upsertAuthKeysFile(keysFile, entry) {
  const resolved = path_1.default.resolve(keysFile);
  let entries = [];
  if (fs_1.default.existsSync(resolved)) {
    let parsed;
    try {
      parsed = JSON.parse(fs_1.default.readFileSync(resolved, 'utf8'));
    } catch {
      throw new Error(`--keys-file is not valid JSON: ${resolved}`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`--keys-file must be a JSON array: ${resolved}`);
    }
    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const o = item;
      const id = typeof o.id === 'string' ? o.id.trim() : '';
      const role = typeof o.role === 'string' ? o.role.trim() : '';
      const keyHash = typeof o.keyHash === 'string' ? o.keyHash.trim().toLowerCase() : '';
      if (!id || !role || !keyHash) {
        continue;
      }
      const next = { id, role, keyHash };
      if (Array.isArray(o.repos)) {
        next.repos = o.repos
          .filter(r => typeof r === 'string' && Boolean(r.trim()))
          .map(r => r.trim());
      }
      if (typeof o.maxTtlMs === 'number' && Number.isInteger(o.maxTtlMs) && o.maxTtlMs >= 1) {
        next.maxTtlMs = o.maxTtlMs;
      }
      if (
        typeof o.maxConcurrentGrants === 'number' &&
        Number.isInteger(o.maxConcurrentGrants) &&
        o.maxConcurrentGrants >= 1
      ) {
        next.maxConcurrentGrants = o.maxConcurrentGrants;
      }
      entries.push(next);
    }
  }
  entries = entries.filter(e => e.id !== entry.id);
  entries.push(entry);
  fs_1.default.mkdirSync(path_1.default.dirname(resolved), { recursive: true });
  fs_1.default.writeFileSync(
    resolved,
    `${JSON.stringify(entries, null, 2)}
`,
    { mode: 384 },
  );
  fs_1.default.chmodSync(resolved, 384);
}
function writeRawKeyFile(outRaw, raw) {
  const resolved = path_1.default.resolve(outRaw);
  fs_1.default.mkdirSync(path_1.default.dirname(resolved), { recursive: true });
  fs_1.default.writeFileSync(
    resolved,
    `${raw}
`,
    { mode: 384 },
  );
  fs_1.default.chmodSync(resolved, 384);
}
var BOOLEAN_FLAGS = /* @__PURE__ */ new Set([
  '--no-config',
  '--no-update-check',
  '--json',
  '--no-state',
  '--retract',
  '--release',
  '--allow-autoscale',
  '--no-autoscale',
  '--wait',
  '--version',
  '--pause',
  '--reclaim',
  '--now',
  '--global',
]);
function parseArgs(argv) {
  const out = { _: '' };
  const positionals = [];
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (BOOLEAN_FLAGS.has(a)) {
      out[a.slice(2)] = true;
      continue;
    }
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
        continue;
      }
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i += 1;
      }
      continue;
    }
    positionals.push(a);
  }
  out._ = positionals[0] || '';
  if (positionals[1]) {
    out.sub = positionals[1];
  }
  return out;
}
function federationIdFromArgs(args) {
  if (typeof args.federation !== 'string') {
    return void 0;
  }
  const id = args.federation.trim();
  return id || void 0;
}
function applyFederationFlagToEnv(federationId, env = process.env) {
  if (federationId) {
    env.MELLIFERA_FEDERATION_ID = federationId;
  }
}
function parseResourceList(raw) {
  if (!raw) {
    return void 0;
  }
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}
function parsePreferredSlots(raw) {
  if (!raw) {
    return void 0;
  }
  const slots = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => Number(s));
  if (!slots.length || slots.some(n => !Number.isInteger(n) || n < 0)) {
    throw new Error('--preferred-slots must be comma-separated non-negative integers');
  }
  return slots;
}
function rejectDeprecatedKindFlags(args) {
  if (args.profile || args.resources) {
    (0, logger_1.diag)('[mellifera-cli] --profile and --resources are removed; use --kinds');
    process.exit(1);
  }
}
function requireKinds(args) {
  rejectDeprecatedKindFlags(args);
  const kinds = parseResourceList(args.kinds);
  if (!kinds?.length) {
    (0, logger_1.diag)(
      '[mellifera-cli] --kinds is required (comma-separated environment kind names)',
    );
    usage();
    process.exit(1);
  }
  return kinds;
}
function mintClientApiKey(args, noConfig) {
  const id = typeof args.id === 'string' ? args.id.trim() : '';
  const outRaw = typeof args['out-raw'] === 'string' ? args['out-raw'] : '';
  const keysFile = typeof args['keys-file'] === 'string' ? args['keys-file'] : void 0;
  const roleRaw = typeof args.role === 'string' ? args.role.trim() : 'client';
  const reposRaw = typeof args.repos === 'string' ? args.repos.trim() : '';
  const maxTtlRaw = typeof args['max-ttl-ms'] === 'string' ? args['max-ttl-ms'].trim() : '';
  const maxConcRaw =
    typeof args['max-concurrent-grants'] === 'string' ? args['max-concurrent-grants'].trim() : '';
  if (!id) {
    (0, logger_1.diag)('[mellifera-cli] mint-client-api-key requires --id');
    usage();
    process.exit(1);
  }
  if (noConfig && !outRaw) {
    (0, logger_1.diag)(
      '[mellifera-cli] mint-client-api-key --no-config requires --out-raw (otherwise the key is lost)',
    );
    process.exit(1);
  }
  if (!CLIENT_API_KEY_ROLES.has(roleRaw)) {
    (0, logger_1.diag)(
      `[mellifera-cli] --role must be one of: ${[...CLIENT_API_KEY_ROLES].join(', ')}`,
    );
    process.exit(1);
  }
  const role = roleRaw;
  const repos = reposRaw
    ? reposRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : void 0;
  if (role === 'ci' && (!repos || repos.length === 0)) {
    (0, logger_1.diag)(
      '[mellifera-cli] mint-client-api-key --role ci requires --repos owner/name[,\u2026]',
    );
    process.exit(1);
  }
  let maxTtlMs;
  if (maxTtlRaw) {
    if (!/^\d+$/.test(maxTtlRaw) || Number(maxTtlRaw) < 1) {
      (0, logger_1.diag)('[mellifera-cli] --max-ttl-ms must be a positive integer');
      process.exit(1);
    }
    maxTtlMs = Number(maxTtlRaw);
  }
  let maxConcurrentGrants;
  if (maxConcRaw) {
    if (!/^\d+$/.test(maxConcRaw) || Number(maxConcRaw) < 1) {
      (0, logger_1.diag)('[mellifera-cli] --max-concurrent-grants must be a positive integer');
      process.exit(1);
    }
    maxConcurrentGrants = Number(maxConcRaw);
  }
  const raw = newClientApiKeyRaw();
  const keyHash = sha256Hex(raw);
  const entry = {
    id,
    role,
    keyHash,
    ...(repos ? { repos } : {}),
    ...(maxTtlMs !== void 0 ? { maxTtlMs } : {}),
    ...(maxConcurrentGrants !== void 0 ? { maxConcurrentGrants } : {}),
  };
  let configPath = null;
  try {
    if (!noConfig) {
      const result = (0, mellifera_config_1.upsertMintedKey)({ rawToken: raw, entry });
      for (const w of result.warnings) {
        (0, logger_1.diag)(`[mellifera-cli] ${w.message}`);
      }
      if (result.tightenedFrom) {
        (0, logger_1.diag)(
          `[mellifera-cli] tightened ${result.path} from ${result.tightenedFrom} to 0600 before writing`,
        );
      }
      configPath = result.path;
    }
    if (outRaw) {
      writeRawKeyFile(outRaw, raw);
    }
    if (keysFile) {
      upsertAuthKeysFile(keysFile, entry);
    }
  } catch (err) {
    (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      {
        id: entry.id,
        role: entry.role,
        fingerprint: (0, mellifera_config_1.fingerprint)(raw),
        config: configPath,
        outRaw: outRaw ? path_1.default.resolve(outRaw) : null,
        keysFile: keysFile ? path_1.default.resolve(keysFile) : null,
      },
      null,
      2,
    ),
  );
}
var SESSION_TOKEN_COMMANDS = /* @__PURE__ */ new Set(['acquire', 'extend', 'release']);
var SLOT_BAND_MIN = 0;
var SLOT_BAND_MAX = 7;
function homeDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    throw new CliError(
      'session-record-missing',
      'HOME is unset, so the worktree session store is unavailable. Set HOME or pass --no-state.',
    );
  }
  return home;
}
function parseDeskSlots(raw) {
  const parts = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (!parts.length) {
    throw new Error('--slots is empty; the shared supported band is 0-7');
  }
  const slots = [];
  const seen = /* @__PURE__ */ new Set();
  for (const part of parts) {
    if (!/^-?\d+$/.test(part)) {
      throw new CliError(
        'slot-out-of-range',
        `slot ${part} is outside the shared supported band 0-7`,
      );
    }
    const n = Number(part);
    if (n < SLOT_BAND_MIN || n > SLOT_BAND_MAX) {
      throw new CliError('slot-out-of-range', `slot ${n} is outside the shared supported band 0-7`);
    }
    if (seen.has(n)) {
      throw new Error(`duplicate slot ${n}; the shared supported band is 0-7`);
    }
    seen.add(n);
    slots.push(n);
  }
  return slots.sort((a, b) => a - b);
}
function slotsFromConfig(fallback) {
  if (!fallback || fallback.length === 0) {
    return null;
  }
  return parseDeskSlots(fallback.join(','));
}
function resolveSlotList(args, fallback) {
  if (typeof args.slots === 'string') {
    return parseDeskSlots(args.slots);
  }
  return slotsFromConfig(fallback);
}
function explicitWorkerId(args) {
  if (typeof args['worker-id'] === 'string' && args['worker-id'].trim()) {
    return args['worker-id'].trim();
  }
  return void 0;
}
function workerIdForRegister(args) {
  return (
    explicitWorkerId(args) || process.env.MELLIFERA_WORKER_ID?.trim() || os_1.default.hostname()
  );
}
function deskOfferId(workerId) {
  return workerId ? `desk-${workerId}` : 'desk';
}
function classOfferId(classId, workerId) {
  return `class-${classId}-${workerId}`;
}
function parseClassSlotCount(raw) {
  if (typeof raw !== 'string') {
    throw new CliError(
      'class-slots-missing',
      'donate --class needs --slots N (a count of at least 1)',
    );
  }
  const trimmed = raw.trim();
  if (trimmed.includes(',')) {
    throw new CliError(
      'class-with-slot-indexes',
      `--class takes a slot count, not desk slot indexes (got ${trimmed}). Drop --class to donate desk slots.`,
    );
  }
  if (!/^-?\d+$/.test(trimmed)) {
    throw new CliError(
      'class-slots-invalid',
      `--slots must be an integer count with --class (got ${trimmed})`,
    );
  }
  const count = Number(trimmed);
  if (count < 1) {
    throw new CliError(
      'class-slots-invalid',
      `--slots must be at least 1 with --class (got ${count})`,
    );
  }
  return count;
}
async function listClassOffers(classId) {
  try {
    const view = await request('GET', '/v1/federation/local-outbound');
    const offers = Array.isArray(view?.offers) ? view.offers : [];
    return offers.filter(
      offer => offer && !Array.isArray(offer.slotIndexes) && offer.classId === classId,
    );
  } catch (err) {
    const status = httpStatus(err);
    if (status === 401 || status === 403) {
      return null;
    }
    throw err;
  }
}
async function resolveOfferIdsForMutation(args, classId) {
  const workerId = explicitWorkerId(args);
  if (classId) {
    const offerId2 = classOfferId(classId, workerIdForRegister(args));
    if (workerId) {
      return [offerId2];
    }
    const standing2 = ((await listClassOffers(classId)) || []).filter(
      offer => offer.status === 'active' || offer.status === 'draining',
    );
    if (standing2.length) {
      return [...new Set(standing2.map(offer => String(offer.offerId)))];
    }
    return [offerId2];
  }
  const offerId = deskOfferId(workerId);
  if (workerId) {
    return [offerId];
  }
  const listed = await listDeskOffers();
  const standing = (listed || []).filter(
    offer =>
      offer.status === 'active' ||
      offer.status === 'draining' ||
      (Array.isArray(offer.slotIndexes) && offer.slotIndexes.length > 0),
  );
  if (standing.length) {
    return [...new Set(standing.map(offer => String(offer.offerId)))];
  }
  return [offerId];
}
async function mutateOffers(args, token, action) {
  const classId = typeof args.class === 'string' ? args.class.trim() : void 0;
  if (args.slots !== void 0 && classId) {
    throw new CliError(
      'class-with-slot-indexes',
      `donate --${action} --class acts on the whole class offer; drop --slots`,
    );
  }
  const ids = await resolveOfferIdsForMutation(args, classId);
  const offers = [];
  let lastGone;
  for (const id of ids) {
    try {
      if (action === 'pause') {
        offers.push(await request('POST', `/v1/offers/${encodeURIComponent(id)}/pause`, {}, token));
      } else {
        offers.push(
          await request(
            'POST',
            `/v1/offers/${encodeURIComponent(id)}/reclaim`,
            { now: Boolean(args.now) },
            token,
          ),
        );
      }
    } catch (err) {
      if (httpStatus(err) === 404) {
        lastGone = err;
        continue;
      }
      throw err;
    }
  }
  if (!offers.length) {
    const detail = lastGone?.message?.trim();
    throw new CliError(
      'offer-gone',
      detail && /donor-local|inbound/i.test(detail) ? detail : `no standing offer to ${action}`,
    );
  }
  console.log(
    JSON.stringify(
      {
        action,
        ...(classId ? { classId } : {}),
        ...(action === 'reclaim' ? { now: Boolean(args.now) } : {}),
        workerId: explicitWorkerId(args) ?? null,
        offers,
      },
      null,
      2,
    ),
  );
}
async function donateClass(args, token) {
  const classId = typeof args.class === 'string' ? args.class.trim() : '';
  if (!classId) {
    throw new CliError('class-missing', '--class needs a class id');
  }
  if (args.pause) {
    await mutateOffers(args, token, 'pause');
    return;
  }
  if (args.reclaim) {
    await mutateOffers(args, token, 'reclaim');
    return;
  }
  const workerId = explicitWorkerId(args);
  const offerId = classOfferId(classId, workerIdForRegister(args));
  if (args.retract) {
    if (args.slots !== void 0) {
      throw new CliError(
        'class-with-slot-indexes',
        'donate --retract --class withdraws the whole class offer; drop --slots',
      );
    }
    let ids = [offerId];
    if (!workerId) {
      const standing = ((await listClassOffers(classId)) || []).filter(
        offer2 => offer2.status === 'active',
      );
      if (standing.length) {
        ids = [...new Set(standing.map(offer2 => String(offer2.offerId)))];
      }
    }
    const offers = [];
    for (const id of ids) {
      try {
        offers.push(
          await request('POST', `/v1/offers/${encodeURIComponent(id)}/retract`, {}, token),
        );
      } catch (err) {
        if (httpStatus(err) === 404) {
          continue;
        }
        throw err;
      }
    }
    if (!offers.length) {
      throw new CliError('offer-gone', `no standing ${classId} class offer to retract`);
    }
    console.log(JSON.stringify({ classId, workerId: workerId ?? null, offers }, null, 2));
    return;
  }
  const slots = parseClassSlotCount(args.slots);
  let extras;
  try {
    extras = (0, pool_cli_1.donateOfferExtras)(args, false);
  } catch (err) {
    if (err instanceof pool_cli_1.PoolCliError) {
      throw new CliError(err.code, err.message);
    }
    throw err;
  }
  let offer;
  try {
    offer = await request('POST', '/v1/offers', { classId, slots, offerId, ...extras }, token);
  } catch (err) {
    const message = err.message;
    if (httpStatus(err) === 400 && message.startsWith('unknown-class:')) {
      throw new CliError('unknown-class', message.slice('unknown-class:'.length).trim());
    }
    throw err;
  }
  console.log(JSON.stringify({ classId, slots, workerId: workerId ?? null, offer }, null, 2));
}
function shellExport(name, value) {
  const safe = String(value).replace(/'/g, `'\\''`);
  return `export ${name}='${safe}'`;
}
function emitGrant(result, noState) {
  console.log(JSON.stringify(result, null, 2));
  if (!noState) {
    return;
  }
  console.log(shellExport('MELLIFERA_SESSION_ID', String(result.sessionId ?? '')));
  console.log(shellExport('MELLIFERA_SESSION_TOKEN', String(result.token ?? '')));
  console.log(shellExport('MELLIFERA_SLOT', String(result.slot ?? '')));
  if (result.expiresAt) {
    console.log(shellExport('MELLIFERA_EXPIRES_AT', String(result.expiresAt)));
  }
  const env = result.env && typeof result.env === 'object' ? result.env : {};
  for (const [key, value] of Object.entries(env)) {
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      console.log(shellExport(key, String(value)));
    }
  }
}
function rememberGrant(result, noState) {
  if (noState) {
    return;
  }
  if (!result || typeof result.sessionId !== 'string' || typeof result.token !== 'string') {
    return;
  }
  (0, session_store_1.writeWorktreeSession)(homeDir(), process.cwd(), {
    sessionId: result.sessionId,
    slot: typeof result.slot === 'number' ? result.slot : 0,
    token: result.token,
    expiresAt: typeof result.expiresAt === 'string' ? result.expiresAt : '',
  });
}
function httpStatus(err) {
  return typeof err.status === 'number' ? err.status : void 0;
}
async function registerWorker(workerId, slots) {
  const body = {
    workerId,
    host: os_1.default.hostname(),
    capacity: { slotCount: slots.length, slots, macosGlobal: false },
  };
  const admin = SETTINGS.token.value;
  if (!admin) {
    return request('POST', '/v1/workers/register', body);
  }
  try {
    const minted = await request(
      'POST',
      '/v1/admin/worker-registration-tokens',
      { workerId, ttlSeconds: 300 },
      admin,
    );
    return request('POST', '/v1/workers/register', body, minted.token);
  } catch (err) {
    if (httpStatus(err) === 503 && err.message.includes('auth not configured')) {
      return request('POST', '/v1/workers/register', body, admin);
    }
    throw err;
  }
}
async function listDeskOffers() {
  try {
    const view = await request('GET', '/v1/federation/local-outbound');
    const offers = Array.isArray(view?.offers) ? view.offers : [];
    return offers.filter(
      offer => offer && (Array.isArray(offer.slotIndexes) || offer.classId === 'desk-slot'),
    );
  } catch (err) {
    const status = httpStatus(err);
    if (status === 401 || status === 403) {
      return null;
    }
    throw err;
  }
}
function classifyCoreSession(json) {
  if (json?.status === 'expired' || json?.status === 'released' || json?.status === 'failed') {
    return 'expired';
  }
  if (typeof json?.expiresAt === 'string' && Date.parse(json.expiresAt) <= Date.now()) {
    return 'expired';
  }
  return 'live';
}
async function dialSession(sessionId) {
  try {
    const body = await request('GET', `/v1/sessions/${encodeURIComponent(sessionId)}`);
    return { status: classifyCoreSession(body), body };
  } catch (err) {
    if (httpStatus(err) === 404) {
      return { status: 'missing', body: null };
    }
    throw err;
  }
}
function loadConfigOrExit(noConfig) {
  try {
    const loaded = (0, mellifera_config_1.loadHomeConfig)({ noConfig });
    for (const w of loaded.warnings) {
      (0, logger_1.diag)(`[mellifera-cli] ${w.message}`);
    }
    return loaded;
  } catch (err) {
    if (err instanceof mellifera_config_1.MelliferaConfigError) {
      (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
      process.exit(1);
    }
    throw err;
  }
}
function leaseIsExpired(body) {
  const status = body?.status;
  if (status === 'expired' || status === 'released' || status === 'failed') {
    return true;
  }
  if (typeof body?.expiresAt === 'string' && Date.parse(body.expiresAt) <= Date.now()) {
    return true;
  }
  return false;
}
function optionalHostKeyPin(value) {
  if (typeof value !== 'string') {
    return void 0;
  }
  const pin = value.trim();
  return pin || void 0;
}
async function resolveExecConnectUrl(sessionId, hadRecord, recordConnectUrl, mode) {
  if (mode === 'global') {
    if (recordConnectUrl) {
      return { connectUrl: recordConnectUrl };
    }
    throw new CliError(
      'remote-exec-unavailable',
      'the global grant pointer has no connectUrl. Re-run reserve --global.',
    );
  }
  let body;
  try {
    body = await request('GET', `/v1/sessions/${encodeURIComponent(sessionId)}`);
  } catch (err) {
    if (httpStatus(err) === 404) {
      throw new CliError(
        'session-expired',
        hadRecord
          ? 'the worktree record exists but the core lease is no longer live.'
          : 'the core has no live lease for this session.',
      );
    }
    throw err;
  }
  if (leaseIsExpired(body)) {
    throw new CliError(
      'session-expired',
      hadRecord
        ? 'the worktree record exists but the core lease is no longer live.'
        : 'the core lease is no longer live.',
    );
  }
  const execution = body?.execution;
  const checkoutMode = execution?.checkoutMode;
  const connectUrl = typeof execution?.connectUrl === 'string' ? execution.connectUrl : '';
  if (checkoutMode !== 'remote' || !connectUrl) {
    throw new CliError(
      'remote-exec-unavailable',
      'the grant is not a remote checkout with a connectUrl. exec does not run local-only grants.',
    );
  }
  const hostKeyPin = optionalHostKeyPin(execution?.hostKeyPin);
  return { connectUrl, ...(hostKeyPin ? { hostKeyPin } : {}) };
}
async function runExec(argv) {
  let parsed;
  try {
    parsed = (0, exec_1.parseExecArgv)(argv);
  } catch (err) {
    (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
    process.exit(1);
  }
  if (parsed.help) {
    usage();
    return;
  }
  applyFederationFlagToEnv(parsed.federationId);
  const loaded = loadConfigOrExit(parsed.noConfig);
  SETTINGS = (0, mellifera_config_1.resolveSettings)({
    loaded,
    flags: {
      url: parsed.url,
      token: parsed.token,
      federationId: parsed.federationId,
    },
  });
  BASE = SETTINGS.localUrl.value;
  (0, mellifera_config_1.installFetchCaTrust)(
    (0, mellifera_config_1.readCaFile)(SETTINGS.globalCaFile.value),
  );
  const home = homeDir();
  const current = (0, session_store_1.readWorktreeSession)(home, process.cwd());
  const sessionId = parsed.session || current?.record.sessionId || '';
  if (!sessionId) {
    throw new CliError(
      'session-record-missing',
      `no current-worktree pointer at ${(0, session_store_1.canonicalWorktree)(process.cwd())}. Pass --session, or reserve first.`,
    );
  }
  const hadRecord = Boolean(
    current && (!parsed.session || current.record.sessionId === parsed.session),
  );
  const target = await resolveExecConnectUrl(
    sessionId,
    hadRecord,
    hadRecord ? current?.record.connectUrl : void 0,
    hadRecord ? current?.record.mode : void 0,
  );
  let remoteCommand;
  try {
    remoteCommand = (0, exec_1.buildRemoteShellCommand)(parsed.command, parsed.workdir, parsed.env);
  } catch (err) {
    (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
    process.exit(1);
  }
  let pinKnownHosts;
  let knownHostsFile = SETTINGS.bastionKnownHostsFile.value;
  if (target.hostKeyPin) {
    try {
      pinKnownHosts = (0, exec_1.writeTempKnownHosts)(target.connectUrl, target.hostKeyPin);
      knownHostsFile = pinKnownHosts;
    } catch (err) {
      throw new CliError(
        'remote-exec-unavailable',
        `grant hostKeyPin could not be applied (${err.message}).`,
      );
    }
  }
  let outcome;
  try {
    outcome = await (0, exec_1.spawnSsh)({
      home,
      connectUrl: target.connectUrl,
      remoteCommand,
      interactive: parsed.interactive,
      tty: parsed.tty,
      knownHostsFile,
    });
  } catch (err) {
    const code = err.code;
    throw new CliError(
      'remote-exec-unavailable',
      code === 'ENOENT'
        ? 'ssh is not on PATH, so the remote command cannot start.'
        : `ssh could not start (${err.message}).`,
    );
  } finally {
    if (pinKnownHosts) {
      try {
        fs_1.default.unlinkSync(pinKnownHosts);
        fs_1.default.rmdirSync(path_1.default.dirname(pinKnownHosts));
      } catch {}
    }
  }
  if (outcome.signal) {
    process.exit(1);
  }
  process.exit(outcome.status ?? 1);
}
async function main() {
  if ((0, exec_1.looksLikeExecArgv)(process.argv.slice(2))) {
    await runExec(process.argv.slice(2));
    return;
  }
  const args = parseArgs(process.argv);
  const cmd = String(args._);
  const noConfig = Boolean(args['no-config']);
  const flagUrl = typeof args.url === 'string' ? args.url : void 0;
  const flagFederation = federationIdFromArgs(args);
  applyFederationFlagToEnv(flagFederation);
  if (args.version === true || cmd === '--version' || cmd === 'version') {
    console.log(
      `mellifera-cli ${(0, build_info_1.formatBuildIdentity)((0, build_info_1.getBuildIdentity)())}`,
    );
    return;
  }
  const noUpdateCheck = Boolean(args['no-update-check']);
  if (cmd === 'status' || cmd === 'doctor') {
    const { report, secrets, updateConfig } = await (0, diagnostics_1.runDiagnostics)({
      noConfig,
      noUpdateCheck,
      flags: { url: flagUrl, federationId: flagFederation },
    });
    const build = (0, build_info_1.getBuildIdentity)();
    report.build = build;
    const updateRows = (0, diagnostics_1.updateDiagRows)({
      withNext: cmd === 'doctor',
      noConfig,
      noUpdateCheck,
      updateConfig,
    });
    if (cmd === 'doctor') {
      report.rows.push({
        id: 'build',
        state: 'ok',
        summary: `cli ${(0, build_info_1.formatBuildIdentity)(build)}`,
      });
      if (report.federation && report.federation.local.protocol !== null) {
        report.rows.push(...(0, diagnostics_1.federationVersionRows)(report.federation));
      }
      report.rows.push((0, diagnostics_1.poolDoctorRow)(report.pool));
      report.rows.push(...updateRows);
    }
    if (args.json) {
      if (cmd === 'status') {
        report.rows = [...report.rows, ...updateRows];
      }
      console.log((0, mellifera_config_1.redactSecrets)(JSON.stringify(report, null, 2), secrets));
    } else {
      console.log((0, diagnostics_1.renderReport)(report, cmd === 'doctor', secrets));
      if (cmd === 'status') {
        const poolLine = (0, diagnostics_1.formatPoolStderr)(report.pool);
        if (poolLine) {
          (0, logger_1.diag)(poolLine);
        }
      }
    }
    process.exitCode = report.rows.some(r => r.state === 'fail') ? 1 : 0;
    return;
  }
  if (cmd === 'update' && args.sub === 'check') {
    const updateLoaded = noConfig ? void 0 : loadConfigOrExit(false);
    const { secrets, builds } = await (0, diagnostics_1.runDiagnostics)({
      noConfig,
      noUpdateCheck,
      flags: { url: flagUrl, federationId: flagFederation },
    });
    const components = [
      { component: 'cli', identity: (0, build_info_1.getBuildIdentity)() },
      ...(builds.local?.commit ? [{ component: 'local', identity: builds.local }] : []),
      ...(builds.global?.commit ? [{ component: 'global', identity: builds.global }] : []),
    ];
    const { cache, ran, policy } = await (0, mellifera_config_1.refreshUpdateCheck)(components, {
      force: true,
      noConfig,
      noUpdateCheck,
      role: 'none',
      updateConfig: updateLoaded?.config.update,
    });
    const rows = (0, mellifera_config_1.updateRowsFromCache)({
      noConfig,
      noUpdateCheck,
      updateConfig: updateLoaded?.config.update,
      withNext: true,
    });
    if (args.json) {
      console.log(
        (0, mellifera_config_1.redactSecrets)(
          JSON.stringify({ ran, policy, cache, rows }, null, 2),
          secrets,
        ),
      );
    } else {
      for (const r of rows) {
        console.log(
          `${r.id.padEnd(15)} ${String(r.state).padEnd(5)} ${r.code ? `${r.code}: ` : ''}${r.summary}`,
        );
        if (r.next && r.state !== 'ok' && r.state !== 'skip') {
          console.log(`${''.padEnd(22)}next: ${r.next}`);
        }
      }
      if (!ran) {
        (0, logger_1.diag)(
          `[mellifera-cli] update check did not refresh (${policy.reason || 'interval/backoff/cache'})`,
        );
      }
    }
    process.exitCode = 0;
    return;
  }
  if (cmd === 'mint-client-api-key') {
    mintClientApiKey(args, noConfig);
    return;
  }
  const loaded = cmd && cmd !== 'help' ? loadConfigOrExit(noConfig) : void 0;
  SETTINGS = (0, mellifera_config_1.resolveSettings)({
    loaded,
    flags: {
      url: flagUrl,
      token:
        !SESSION_TOKEN_COMMANDS.has(cmd) && typeof args.token === 'string' ? args.token : void 0,
      federationId: flagFederation,
      localWaitMs: typeof args['local-wait-ms'] === 'string' ? args['local-wait-ms'] : void 0,
      remoteWaitMs: typeof args['remote-wait-ms'] === 'string' ? args['remote-wait-ms'] : void 0,
      timeoutMs: typeof args['timeout-ms'] === 'string' ? args['timeout-ms'] : void 0,
      allowAutoscale: args['no-autoscale'] ? false : args['allow-autoscale'] ? true : void 0,
    },
  });
  BASE = SETTINGS.localUrl.value;
  (0, mellifera_config_1.installFetchCaTrust)(
    (0, mellifera_config_1.readCaFile)(SETTINGS.globalCaFile.value),
  );
  const token = SETTINGS.token.value;
  if (!cmd || cmd === 'help' || cmd === '--help' || args.help) {
    usage();
    return;
  }
  if (cmd === 'wait' || cmd === 'check-in' || cmd === 'claim' || cmd === 'wait-status') {
    (0, logger_1.diag)(`[mellifera-cli] ${cmd} is not a supported command.`);
    process.exit(1);
  }
  if (cmd === 'register') {
    const slots = resolveSlotList(args, SETTINGS.registerSlots.value);
    if (!slots) {
      throw new Error(
        'register needs --slots or desk.registerSlots; the shared supported band is 0-7',
      );
    }
    const workerId = workerIdForRegister(args);
    const worker = await registerWorker(workerId, slots);
    console.log(JSON.stringify({ slots, workerId, worker }, null, 2));
    return;
  }
  if (cmd === 'unregister') {
    const workerId = workerIdForRegister(args);
    const result = await request(
      'POST',
      `/v1/workers/${encodeURIComponent(workerId)}/unregister`,
      void 0,
      token,
    );
    console.log(JSON.stringify({ workerId, ...result }, null, 2));
    return;
  }
  if (cmd === 'donate' && args.class !== void 0) {
    await donateClass(args, token);
    return;
  }
  if (cmd === 'donate') {
    if (args.pause) {
      await mutateOffers(args, token, 'pause');
      return;
    }
    if (args.reclaim) {
      await mutateOffers(args, token, 'reclaim');
      return;
    }
    const workerId = explicitWorkerId(args);
    const offerId = deskOfferId(workerId);
    if (args.retract) {
      const slots2 = resolveSlotList(args, SETTINGS.donateSlots.value);
      let ids = [offerId];
      if (!workerId) {
        const listed = await listDeskOffers();
        const standing = (listed || []).filter(
          offer2 =>
            offer2.status === 'active' ||
            (Array.isArray(offer2.slotIndexes) && offer2.slotIndexes.length > 0),
        );
        if (standing.length) {
          ids = [...new Set(standing.map(offer2 => String(offer2.offerId)))];
        }
      }
      const offers = [];
      for (const id of ids) {
        try {
          const body = slots2 ? { slotIndexes: slots2 } : {};
          offers.push(
            await request('POST', `/v1/offers/${encodeURIComponent(id)}/retract`, body, token),
          );
        } catch (err) {
          if (httpStatus(err) === 404) {
            continue;
          }
          throw err;
        }
      }
      if (!offers.length) {
        throw new CliError('offer-gone', 'no standing desk offer to retract');
      }
      console.log(
        JSON.stringify({ slots: slots2 ?? null, workerId: workerId ?? null, offers }, null, 2),
      );
      return;
    }
    const slots = resolveSlotList(args, SETTINGS.donateSlots.value);
    if (!slots) {
      throw new Error('donate needs --slots or desk.donateSlots; the shared supported band is 0-7');
    }
    let extras;
    try {
      extras = (0, pool_cli_1.donateOfferExtras)(args, true);
    } catch (err) {
      if (err instanceof pool_cli_1.PoolCliError) {
        throw new CliError(err.code, err.message);
      }
      throw err;
    }
    const offer = await request(
      'POST',
      '/v1/offers',
      { classId: 'desk-slot', slotIndexes: slots, offerId, ...extras },
      token,
    );
    console.log(JSON.stringify({ slots, workerId: workerId ?? null, offer }, null, 2));
    return;
  }
  if (cmd === 'catalog') {
    console.log(JSON.stringify(await request('GET', '/v1/resources/catalog'), null, 2));
    return;
  }
  if (cmd === 'capacity') {
    console.log(JSON.stringify(await request('GET', '/v1/capacity'), null, 2));
    return;
  }
  if (cmd === 'resources') {
    console.log(JSON.stringify(await request('GET', '/v1/resources/availability'), null, 2));
    return;
  }
  if (cmd === 'availability') {
    const kinds = requireKinds(args);
    console.log(
      JSON.stringify(await request('POST', '/v1/environments/availability', { kinds }), null, 2),
    );
    return;
  }
  if (cmd === 'mint-worker-reg') {
    const workerId = args['worker-id'];
    const ttlSeconds = args['ttl-seconds'] ? parseInt(String(args['ttl-seconds']), 10) : 300;
    if (!workerId || !Number.isFinite(ttlSeconds) || ttlSeconds < 1) {
      usage();
      process.exit(1);
    }
    if (!token) {
      (0, logger_1.diag)(
        '[mellifera-cli] mint-worker-reg requires MELLIFERA_TOKEN or --token (admin)',
      );
      process.exit(1);
    }
    const result = await request(
      'POST',
      '/v1/admin/worker-registration-tokens',
      { workerId, ttlSeconds },
      token,
    );
    console.log(result.token);
    return;
  }
  if (cmd === 'reserve') {
    if (args.wait) {
      (0, logger_1.diag)(
        '[mellifera-cli] bare --wait is deprecated and local-only and is not a supported command. It never spills.',
      );
      process.exit(1);
    }
    if (args['allow-autoscale'] && args['no-autoscale']) {
      (0, logger_1.diag)('[mellifera-cli] pass only one of --allow-autoscale or --no-autoscale');
      process.exit(1);
    }
    const kinds = requireKinds(args);
    const ttlMs = args['ttl-ms'] ? parseInt(String(args['ttl-ms']), 10) : void 0;
    const noState = Boolean(args['no-state']);
    const asJson = Boolean(args.json);
    const wantGlobal =
      Boolean(args.global) ||
      /^(1|true|yes)$/i.test((process.env.MELLIFERA_RESERVE_GLOBAL || '').trim());
    if (wantGlobal) {
      const globalUrl = SETTINGS.globalUrl.value;
      const globalToken = SETTINGS.globalToken.value || token;
      if (!globalUrl) {
        throw new CliError(
          'global-url-missing',
          'reserve --global needs globalUrl (or MELLIFERA_GLOBAL_URL)',
        );
      }
      if (!globalToken) {
        throw new CliError('global-token-missing', 'reserve --global needs globalToken or token');
      }
      const waitMs =
        SETTINGS.timeoutMs.value !== void 0
          ? SETTINGS.timeoutMs.value
          : SETTINGS.remoteWaitMs.value > 0
            ? SETTINGS.remoteWaitMs.value
            : void 0;
      try {
        const result2 = await (0, pool_cli_1.reserveGlobal)({
          kinds,
          ttlMs: ttlMs && Number.isInteger(ttlMs) && ttlMs > 0 ? ttlMs : 36e5,
          ...(waitMs !== void 0 ? { waitMs } : {}),
          token: globalToken,
          globalUrl,
          home: homeDir(),
          cwd: process.cwd(),
          noState,
          json: asJson,
          request,
          fingerprint: (0, fingerprint_1.resolveRequesterFingerprint)(homeDir()),
          repo: typeof args.repo === 'string' ? args.repo : void 0,
          runId: args['run-id'] ? parseInt(String(args['run-id']), 10) : void 0,
        });
        if (asJson) {
          console.log(JSON.stringify(result2, null, 2));
        } else {
          emitGrant(result2, noState);
        }
      } catch (err) {
        if (err instanceof pool_cli_1.PoolCliError) {
          throw new CliError(err.code, err.message);
        }
        throw err;
      }
      return;
    }
    const owner =
      args.owner ||
      `${os_1.default.hostname()}:${(0, session_store_1.canonicalWorktree)(process.cwd())}`;
    const workerId = typeof args['worker-id'] === 'string' ? args['worker-id'] : void 0;
    let preferredSlots;
    try {
      preferredSlots = parsePreferredSlots(args['preferred-slots']);
    } catch (err) {
      (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
      process.exit(1);
    }
    const localWaitMs = SETTINGS.localWaitMs.value;
    const remoteWaitMs = SETTINGS.remoteWaitMs.value;
    const allowAutoscale = SETTINGS.allowAutoscale.value;
    if (
      !Number.isInteger(localWaitMs) ||
      localWaitMs < 0 ||
      !Number.isInteger(remoteWaitMs) ||
      remoteWaitMs < 0
    ) {
      (0, logger_1.diag)(
        '[mellifera-cli] --local-wait-ms and --remote-wait-ms must be non-negative integers',
      );
      process.exit(1);
    }
    const fingerprint = (0, fingerprint_1.resolveRequesterFingerprint)(homeDir());
    const body = {
      owner,
      kinds,
      localWaitMs,
      remoteWaitMs,
      allowAutoscale,
    };
    if (fingerprint) {
      body.requesterKeyFingerprint = fingerprint;
    }
    if (SETTINGS.timeoutMs.value !== void 0) {
      if (!Number.isInteger(SETTINGS.timeoutMs.value) || SETTINGS.timeoutMs.value < 0) {
        (0, logger_1.diag)('[mellifera-cli] --timeout-ms must be a non-negative integer');
        process.exit(1);
      }
      body.timeoutMs = SETTINGS.timeoutMs.value;
    }
    if (ttlMs !== void 0) {
      body.ttlMs = ttlMs;
    }
    if (workerId) {
      body.workerId = workerId;
    }
    if (preferredSlots) {
      body.preferredSlots = preferredSlots;
    }
    let result;
    try {
      result = await request('POST', '/v1/sessions/reserve', body, token);
    } catch (err) {
      const errBody = err.body;
      const code = errBody?.error || err.message;
      if (code === 'admission-deadline') {
        const side = { error: 'admission-deadline', estimate: errBody?.estimate };
        if (asJson) {
          console.log(JSON.stringify({ ...side, ...(errBody || {}) }, null, 2));
        } else {
          (0, logger_1.diag)(JSON.stringify(side));
        }
        throw new CliError(
          'admission-deadline',
          'admission deadline passed before a grant was available',
        );
      }
      throw err;
    }
    if (result?.estimate && !result?.sessionId) {
      const side = { estimate: result.estimate };
      if (asJson) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      (0, logger_1.diag)(JSON.stringify(side));
    }
    rememberGrant(result, noState);
    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitGrant(result, noState);
    }
    return;
  }
  if (cmd === 'acquire') {
    const sessionId = args['session-id'];
    const sessionToken = args.token;
    rejectDeprecatedKindFlags(args);
    const kinds = parseResourceList(args.kinds);
    if (!sessionId || !sessionToken || !kinds?.length) {
      usage();
      process.exit(1);
    }
    const auth = token;
    console.log(
      JSON.stringify(
        await request(
          'POST',
          `/v1/sessions/${sessionId}/acquire`,
          { token: sessionToken, kinds },
          auth,
        ),
        null,
        2,
      ),
    );
    return;
  }
  if (cmd === 'extend') {
    const home = homeDir();
    const current = (0, session_store_1.readWorktreeSession)(home, process.cwd());
    let sessionId = typeof args['session-id'] === 'string' ? args['session-id'] : '';
    let sessionToken = typeof args.token === 'string' ? args.token : '';
    if (!sessionId && current) {
      sessionId = current.record.sessionId;
      sessionToken = sessionToken || current.record.token;
    }
    const ttlMs = args['ttl-ms'] ? parseInt(String(args['ttl-ms']), 10) : void 0;
    if (!sessionId) {
      usage();
      process.exit(1);
    }
    const isGlobal = current?.record.sessionId === sessionId && current.record.mode === 'global';
    if (isGlobal) {
      if (ttlMs === void 0 || !Number.isInteger(ttlMs) || ttlMs < 1) {
        throw new CliError('ttl-ms-required', 'extend on a global grant needs --ttl-ms N');
      }
      const globalUrl = SETTINGS.globalUrl.value;
      const globalToken = SETTINGS.globalToken.value || token;
      if (!globalUrl || !globalToken) {
        throw new CliError('global-url-missing', 'global grant extend needs globalUrl and a token');
      }
      const result = await request(
        'POST',
        `/v1/pool/grants/${encodeURIComponent(sessionId)}/extend`,
        { ttlMs },
        globalToken,
        globalUrl,
      );
      if (
        !Boolean(args['no-state']) &&
        current?.record.sessionId === sessionId &&
        typeof result.expiresAt === 'string'
      ) {
        (0, session_store_1.writeWorktreeSession)(home, process.cwd(), {
          sessionId,
          slot: current.record.slot,
          token: current.record.token,
          expiresAt: result.expiresAt,
          mode: 'global',
          ...(current.record.connectUrl ? { connectUrl: current.record.connectUrl } : {}),
        });
      }
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (!sessionToken) {
      usage();
      process.exit(1);
    }
    const auth = token;
    const body = { token: sessionToken };
    if (ttlMs !== void 0) {
      body.ttlMs = ttlMs;
    }
    console.log(
      JSON.stringify(
        await request('POST', `/v1/sessions/${sessionId}/extend`, body, auth),
        null,
        2,
      ),
    );
    return;
  }
  if (cmd === 'release') {
    let sessionId = typeof args['session-id'] === 'string' ? args['session-id'] : '';
    let sessionToken = typeof args.token === 'string' ? args.token : '';
    const implicit = !sessionId && !sessionToken;
    const home = homeDir();
    const current = (0, session_store_1.readWorktreeSession)(home, process.cwd());
    if (implicit) {
      if (!current) {
        throw new CliError(
          'session-record-missing',
          `no current-worktree pointer at ${(0, session_store_1.canonicalWorktree)(process.cwd())}. Pass --session-id and --token, or reserve first.`,
        );
      }
      sessionId = current.record.sessionId;
      sessionToken = current.record.token;
    }
    const isGlobal =
      Boolean(args.global) ||
      (current !== null &&
        current.record.sessionId === sessionId &&
        current.record.mode === 'global');
    if (!isGlobal && (!sessionId || !sessionToken)) {
      usage();
      process.exit(1);
    }
    if (isGlobal && !sessionId) {
      usage();
      process.exit(1);
    }
    let result;
    try {
      if (isGlobal) {
        const globalUrl = SETTINGS.globalUrl.value;
        const globalToken = SETTINGS.globalToken.value || token;
        if (!globalUrl || !globalToken) {
          throw new CliError(
            'global-url-missing',
            'global grant release needs globalUrl and a token',
          );
        }
        result = await request(
          'POST',
          `/v1/pool/grants/${encodeURIComponent(sessionId)}/release`,
          {},
          globalToken,
          globalUrl,
        );
      } else {
        result = await request(
          'POST',
          `/v1/sessions/${encodeURIComponent(sessionId)}/release`,
          { token: sessionToken },
          token,
        );
      }
    } catch (err) {
      if (httpStatus(err) === 404 && implicit) {
        throw new CliError(
          'session-expired',
          'the worktree record exists but the core lease is no longer live.',
        );
      }
      throw err;
    }
    if (current && current.record.sessionId === sessionId) {
      (0, session_store_1.removeWorktreeSession)(home, process.cwd());
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (cmd === 'session' && args.sub === 'show') {
    const home = homeDir();
    const current = (0, session_store_1.readWorktreeSession)(home, process.cwd());
    const worktree = (0, session_store_1.canonicalWorktree)(process.cwd());
    const explicitId = typeof args['session-id'] === 'string' ? args['session-id'] : '';
    const sessionId = explicitId || current?.record.sessionId || '';
    if (!sessionId) {
      console.log(
        JSON.stringify({ status: 'missing', code: 'session-record-missing', worktree }, null, 2),
      );
      process.exitCode = 1;
      return;
    }
    const dialed = await dialSession(sessionId);
    const matchedRecord =
      current && current.record.sessionId === sessionId ? current.record : void 0;
    const status = dialed.status === 'missing' && matchedRecord ? 'expired' : dialed.status;
    const body = dialed.body || {};
    const report = {
      status,
      worktree,
      sessionId,
      slot: typeof body.slot === 'number' ? body.slot : matchedRecord?.slot,
      expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : matchedRecord?.expiresAt,
    };
    if (matchedRecord?.updatedAt) {
      report.updatedAt = matchedRecord.updatedAt;
    }
    if (typeof body.phase === 'string') {
      report.phase = body.phase;
    }
    if (status === 'expired') {
      report.code = 'session-expired';
    }
    if (status === 'missing') {
      report.code = 'session-record-missing';
    }
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = status === 'live' ? 0 : 1;
    return;
  }
  if (cmd === 'session' && args.sub === 'clear') {
    const home = homeDir();
    const current = (0, session_store_1.readWorktreeSession)(home, process.cwd());
    if (!current) {
      throw new CliError(
        'session-record-missing',
        `no current-worktree pointer at ${(0, session_store_1.canonicalWorktree)(process.cwd())}.`,
      );
    }
    let released = false;
    if (args.release) {
      try {
        await request(
          'POST',
          `/v1/sessions/${encodeURIComponent(current.record.sessionId)}/release`,
          { token: current.record.token },
          token,
        );
        released = true;
      } catch (err) {
        if (httpStatus(err) === 404) {
          throw new CliError(
            'session-expired',
            'the worktree record exists but the core lease is no longer live.',
          );
        }
        throw err;
      }
    }
    (0, session_store_1.removeWorktreeSession)(home, process.cwd());
    console.log(
      JSON.stringify(
        {
          cleared: true,
          released,
          worktree: current.record.worktree,
          sessionId: current.record.sessionId,
          slot: current.record.slot,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (cmd === 'session') {
    const sessionId = args['session-id'];
    if (!sessionId) {
      usage();
      process.exit(1);
    }
    console.log(
      JSON.stringify(
        await request('GET', `/v1/sessions/${encodeURIComponent(sessionId)}`, void 0, token),
        null,
        2,
      ),
    );
    return;
  }
  usage();
  process.exit(1);
}
main().catch(err => {
  if (err instanceof mellifera_config_1.MelliferaConfigError) {
    (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
    process.exit(1);
  }
  if (err instanceof pool_cli_1.PoolCliError) {
    (0, logger_1.diag)(
      `[mellifera-cli] ${err.code}: ${(0, mellifera_config_1.redactSecrets)(err.message, [SETTINGS.token.value, SETTINGS.globalToken.value])}`,
    );
    process.exit(1);
  }
  if (err instanceof CliError) {
    (0, logger_1.diag)(
      `[mellifera-cli] ${err.code}: ${(0, mellifera_config_1.redactSecrets)(err.message, [SETTINGS.token.value, SETTINGS.globalToken.value])}`,
    );
    process.exit(1);
  }
  (0, logger_1.diag)(`[mellifera-cli] ${err.message}`);
  if (err.body) {
    (0, logger_1.diag)(JSON.stringify(err.body, null, 2));
  }
  process.exit(1);
});
