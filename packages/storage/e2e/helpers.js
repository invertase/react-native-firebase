// TODO make more unique?
const ID = Date.now();

const PATH_ROOT = 'playground';
const PATH = `${PATH_ROOT}/${ID}`;
const WRITE_ONLY_NAME = 'writeOnly.jpeg';

exports.seed = async function seed(path) {
  let leakDetectCurrent = globalThis.RNFBDebugInTestLeakDetection;
  globalThis.RNFBDebugInTestLeakDetection = false;
  const { getStorage, ref, uploadString, StringFormat } = storageModular;

  try {
    // Add a write only file
    await uploadString(ref(getStorage(), WRITE_ONLY_NAME), 'Write Only');

    await uploadString(ref(getStorage(), `${path}/list/file1.txt`), 'File 1', StringFormat.RAW, {
      contentType: 'text/plain',
    });

    await uploadString(ref(getStorage(), `${path}/list/file2.txt`), 'File 2');
    await uploadString(ref(getStorage(), `${path}/list/file3.txt`), 'File 3');
    await uploadString(ref(getStorage(), `${path}/list/file4.txt`), 'File 4');
    await uploadString(ref(getStorage(), `${path}/list/nested/file5.txt`), 'File 5');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('unable to seed storage service with test fixtures');
    throw e;
  } finally {
    globalThis.RNFBDebugInTestLeakDetection = leakDetectCurrent;
  }
};

exports.wipe = function wipe(path) {
  const { getStorage, ref } = storageModular;
  return ref(getStorage(), path).remove();
};

exports.PATH = PATH;
exports.WRITE_ONLY_NAME = WRITE_ONLY_NAME;
