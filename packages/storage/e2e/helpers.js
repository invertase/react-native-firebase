const testingUtils = require('@firebase/rules-unit-testing');

// TODO make more unique?
const ID = Date.now();

const PATH_ROOT = 'react-native-tests';
const PATH = `${PATH_ROOT}/${ID}`;
const WRITE_ONLY_NAME = 'writeOnly.txt';

exports.seed = async function seed(path) {
  // Force the rules for the storage emulator to be what we expect
  await testingUtils.loadStorageRules({
    rules: `rules_version = '2';
      service firebase.storage {
        match /b/{bucket}/o {
          match /{document=**} {
            allow read, write: if false;
          }
      
          match /${WRITE_ONLY_NAME} {
            allow read: if false;
            allow write: if true;
          }
      
          match /${PATH_ROOT}/{document=**} {
            allow read, write: if true;
          }
        }
      }`,
  });

  return Promise.all([
    // Add a write only file
    firebase.storage().ref(WRITE_ONLY_NAME).putString('Write Only'),

    // Setup list items - Future.wait not working...
    firebase
      .storage()
      .ref(`${path}/list/file1.txt`)
      .putString('File 1', 'raw', { contentType: 'text/plain' }),
    firebase.storage().ref(`${path}/list/file2.txt`).putString('File 2'),
    firebase.storage().ref(`${path}/list/file3.txt`).putString('File 3'),
    firebase.storage().ref(`${path}/list/file4.txt`).putString('File 4'),
    firebase.storage().ref(`${path}/list/nested/file5.txt`).putString('File 5'),
  ]);
};

exports.wipe = function wipe(path) {
  return firebase.storage().ref(path).remove();
};

exports.PATH = PATH;
exports.WRITE_ONLY_NAME = WRITE_ONLY_NAME;
