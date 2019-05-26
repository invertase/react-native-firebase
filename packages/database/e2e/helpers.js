// TODO make more unique?
const ID = Date.now();

const PATH = `tests/${ID}`;

const CONTENT = {
  DEFAULT: {
    array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    boolean: true,
    string: 'foobar',
    number: 123567890,
    object: {
      foo: 'bar',
    },
  },
};

exports.seed = function seed() {
  return Promise.all([
    firebase.database().ref(`${PATH}/types`).set(CONTENT.DEFAULT),
  ]);
};

exports.wipe = function wipe() {
  return firebase.database().ref(`${PATH}/types`)
    .remove();
};

exports.PATH = PATH;
exports.CONTENT = CONTENT;
