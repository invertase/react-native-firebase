// TODO make more unique?
const ID = Date.now();

const PATH_ROOT = 'playground';
const PATH = `${PATH_ROOT}/${ID}`;
const WRITE_ONLY_NAME = 'writeOnly.jpeg';

exports.seed = async function seed(path) {
  let leakDetectCurrent = global.RNFBDebugInTestLeakDetection;
  global.RNFBDebugInTestLeakDetection = false;

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
    // eslint-disable-next-line no-console
    console.error('unable to seed storage service with test fixtures');
    throw e;
  } finally {
    global.RNFBDebugInTestLeakDetection = leakDetectCurrent;
  }
};

exports.wipe = function wipe(path) {
  return firebase.storage().ref(path).remove();
};

exports.PATH = PATH;
exports.WRITE_ONLY_NAME = WRITE_ONLY_NAME;
