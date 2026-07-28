// Eliminate annoying warning about double-loading firebase while
// on Other platform - we load it, and rules-unit-testing does as well

// eslint-disable-next-line no-console
const originalConsoleWarn = console.warn;
// eslint-disable-next-line no-console
console.warn = function (message) {
  if (message && typeof message === 'string' && !message.includes('@firebase/app-compat')) {
    originalConsoleWarn(message);
  }
};
const testingUtils = require('@firebase/rules-unit-testing');
// eslint-disable-next-line no-console
console.warn = originalConsoleWarn;

const { getE2eTestProject, getE2eEmulatorHost } = require('../../app/e2e/helpers');

// TODO make more unique?
const ID = Date.now();

const PATH = `tests/${ID}`;
const DB_NAME = getE2eTestProject();
const DB_RULES = {
  rules: {
    '.read': false,
    '.write': false,
    tests: {
      '.read': true,
      '.write': true,
      $dynamic: {
        once: {
          childMoved: {
            '.indexOn': ['nuggets'],
          },
        },
      },
    },
  },
};

const CONTENT = {
  TYPES: {
    array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    boolean: true,
    string: 'foobar',
    number: 123567890,
    object: {
      foo: 'bar',
      bar: 'baz',
    },
  },
  QUERY: {
    a: {
      string: 'foo',
      number: 10,
    },
    b: {
      string: 'bar',
      number: 5,
    },
    c: {
      string: 'baz',
      number: 8,
    },
  },
};

exports.seed = function seed(path) {
  const { getDatabase, ref, set } = databaseModular;
  return Promise.all([
    set(ref(getDatabase(), `${path}/types`), CONTENT.TYPES),
    set(ref(getDatabase(), `${path}/query`), CONTENT.QUERY),
    // The database emulator does not load rules correctly. We force them pre-test.
    // TODO(ehesp): This is current erroring - however without it, we can't test rules.
    testingUtils.initializeTestEnvironment({
      projectId: getE2eTestProject(),
      database: {
        databaseName: DB_NAME,
        rules: JSON.stringify(DB_RULES),
        host: getE2eEmulatorHost(),
        port: 9000,
      },
    }),
  ]);
};

exports.wipe = function wipe(path) {
  const { getDatabase, ref, remove } = databaseModular;
  return remove(ref(getDatabase(), path));
};

exports.PATH = PATH;
exports.CONTENT = CONTENT;
exports.DB_RULES = DB_RULES;

function resolveDbRef(dbRefOrPath) {
  const { getDatabase, ref } = databaseModular;
  if (typeof dbRefOrPath === 'string') {
    return ref(getDatabase(), dbRefOrPath);
  }
  return dbRefOrPath;
}

/**
 * Wait until native RTDB has registered a listener and can read the current value
 * at `dbRefOrPath`. Child-event listeners (onChildChanged etc.) attach over the
 * same bridge as onValue; use this after pre-seeding data and attaching the listener
 * under test, before mutating.
 */
exports.waitForNativeDbListenerReady = async function waitForNativeDbListenerReady(
  dbRefOrPath,
  expectedValue,
  timeoutMs = 5000,
) {
  const { onValue } = databaseModular;
  const resolvedRef = resolveDbRef(dbRefOrPath);
  const gate = sinon.spy();
  const unsubGate = onValue(resolvedRef, $ => gate($.val()));
  await Utils.spyToBeCalledOnceAsync(gate, timeoutMs);
  if (expectedValue !== undefined) {
    gate.should.be.calledWith(expectedValue);
  }
  unsubGate();
};

/** Wait until the native listener registration bridge round-trip completes. */
exports.waitForNativeDbListenerRegistration = async function waitForNativeDbListenerRegistration(
  dbRefOrPath,
  timeoutMs = 5000,
) {
  return exports.waitForNativeDbListenerReady(dbRefOrPath, undefined, timeoutMs);
};
