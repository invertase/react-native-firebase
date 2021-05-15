const testingUtils = require('@firebase/rules-unit-testing');

// TODO make more unique?
const ID = Date.now();

const PATH = `tests/${ID}`;
const DB_NAME = 'react-native-firebase-testing';
const DB_RULES = `{ "rules": {".read": false, ".write": false, "tests": {".read": true, ".write": true } } }`;

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
  return Promise.all([
    firebase.database().ref(`${path}/types`).set(CONTENT.TYPES),
    firebase.database().ref(`${path}/query`).set(CONTENT.QUERY),
    // The database emulator does not load rules correctly. We force them pre-test.
    testingUtils.loadDatabaseRules({ databaseName: DB_NAME, rules: DB_RULES }),
  ]);
};

exports.wipe = function wipe(path) {
  return firebase.database().ref(path).remove();
};

exports.PATH = PATH;
exports.CONTENT = CONTENT;
exports.DB_RULES = DB_RULES;
