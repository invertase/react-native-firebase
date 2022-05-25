const testingUtils = require('@firebase/rules-unit-testing');

// TODO make more unique?
const ID = Date.now();

const PATH_ROOT = 'react-native-tests';
const PATH = `${PATH_ROOT}/${ID}`;
const WRITE_ONLY_NAME = 'writeOnly.txt';

exports.seed = async function seed(path) {
  // Force the rules for the storage emulator to be what we expect

  await testingUtils.initializeTestEnvironment({
    projectId: 'react-native-firebase-testing',
    storage: {
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
      host: 'localhost',
      port: 9199,
    },
  });

  try {
    // Add a write only file
    await firebase.storage().ref(WRITE_ONLY_NAME).putString('Write Only');

    // Setup list items - Future.wait not working...
    await firebase
      .storage()
      .ref(`${path}/list/file1.txt`)
      .putString('File 1', 'raw', { contentType: 'text/plain' });
    await firebase.storage().ref(`${path}/list/file2.txt`).putString('File 2');
    await firebase.storage().ref(`${path}/list/file3.txt`).putString('File 3');
    await firebase.storage().ref(`${path}/list/file4.txt`).putString('File 4');
    await firebase.storage().ref(`${path}/list/nested/file5.txt`).putString('File 5');
  } catch (e) {
    throw new Error('unable to seed storage service with test fixture: ' + e);
  }
};

exports.wipe = function wipe(path) {
  return firebase.storage().ref(path).remove();
};

exports.PATH = PATH;
exports.WRITE_ONLY_NAME = WRITE_ONLY_NAME;
