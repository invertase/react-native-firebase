// TODO make more unique?
const ID = Date.now();

const PATH_ROOT = 'playground';
const PATH = `${PATH_ROOT}/${ID}`;
const WRITE_ONLY_NAME = 'writeOnly.jpeg';

const SEED_MAX_ATTEMPTS = 4;
const SEED_INITIAL_BACKOFF_MS = 250;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const LARGE_FIXTURE_RELATIVE_PATH = 'fixtures/large.bin';
const DEFAULT_LARGE_FIXTURE_BYTES = 8 * 1024 * 1024;

function createLargeFixtureBytes(sizeBytes) {
  const data = new Uint8Array(sizeBytes);
  for (let i = 0; i < sizeBytes; i += 65536) {
    data[i] = i & 0xff;
  }
  return data;
}

async function seedLargeFixture(path, sizeBytes = DEFAULT_LARGE_FIXTURE_BYTES) {
  const { getStorage, ref, uploadBytesResumable, TaskState } = storageModular;
  const snapshot = await uploadBytesResumable(
    ref(getStorage(), `${path}/${LARGE_FIXTURE_RELATIVE_PATH}`),
    createLargeFixtureBytes(sizeBytes),
    {
      contentType: 'application/octet-stream',
    },
  );

  if (snapshot.state !== TaskState.SUCCESS) {
    throw new Error(`failed to seed large fixture (${sizeBytes} bytes): ${snapshot.state}`);
  }
}

async function uploadSeedFixtures(path) {
  const { getStorage, ref, uploadString, StringFormat } = storageModular;

  await uploadString(ref(getStorage(), WRITE_ONLY_NAME), 'Write Only');

  await uploadString(ref(getStorage(), `${path}/list/file1.txt`), 'File 1', StringFormat.RAW, {
    contentType: 'text/plain',
  });

  await uploadString(ref(getStorage(), `${path}/list/file2.txt`), 'File 2');
  await uploadString(ref(getStorage(), `${path}/list/file3.txt`), 'File 3');
  await uploadString(ref(getStorage(), `${path}/list/file4.txt`), 'File 4');
  await uploadString(ref(getStorage(), `${path}/list/nested/file5.txt`), 'File 5');
}

exports.seed = async function seed(path) {
  let leakDetectCurrent = globalThis.RNFBDebugInTestLeakDetection;
  globalThis.RNFBDebugInTestLeakDetection = false;
  let lastError;

  try {
    for (let attempt = 1; attempt <= SEED_MAX_ATTEMPTS; attempt++) {
      try {
        await uploadSeedFixtures(path);
        return;
      } catch (error) {
        lastError = error;
        if (attempt >= SEED_MAX_ATTEMPTS) {
          break;
        }
        const backoffMs = SEED_INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
        await sleep(backoffMs);
      }
    }

    // eslint-disable-next-line no-console
    console.error('unable to seed storage service with test fixtures');
    throw lastError;
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
exports.LARGE_FIXTURE_PATH = `${PATH}/${LARGE_FIXTURE_RELATIVE_PATH}`;
exports.DEFAULT_LARGE_FIXTURE_BYTES = DEFAULT_LARGE_FIXTURE_BYTES;
exports.createLargeFixtureBytes = createLargeFixtureBytes;
exports.seedLargeFixture = seedLargeFixture;
