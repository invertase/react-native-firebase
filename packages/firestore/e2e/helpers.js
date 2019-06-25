// TODO make more unique?
const ID = Date.now();

const PATH = `v6/${ID}`;

exports.seed = function seed(path) {
  return Promise.all([
    firebase
      .database()
      .ref(`${path}/types`)
      .set(CONTENT.TYPES),
    firebase
      .database()
      .ref(`${path}/query`)
      .set(CONTENT.QUERY),
  ]);
};

exports.wipe = function wipe(path) {
  return firebase
    .database()
    .ref(path)
    .remove();
};

exports.PATH = PATH;
exports.CONTENT = CONTENT;
