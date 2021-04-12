// TODO make more unique?
const ID = Date.now();

const PATH = `tests/${ID}`;

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
  ]);
};

exports.wipe = function wipe(path) {
  return firebase.database().ref(path).remove();
};

exports.PATH = PATH;
exports.CONTENT = CONTENT;
