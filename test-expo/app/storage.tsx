import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { FilePath, getApp } from '@react-native-firebase/app';
import {
  SDK_VERSION,
  StringFormat,
  TaskEvent,
  TaskState,
  connectStorageEmulator,
  deleteObject,
  getBlob,
  getBytes,
  getDownloadURL,
  getMetadata,
  getStorage,
  getStream,
  list,
  listAll,
  putFile,
  ref,
  setMaxDownloadRetryTime,
  setMaxOperationRetryTime,
  setMaxUploadRetryTime,
  updateMetadata,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
  writeToFile,
  type Subscribe,
  type TaskSnapshot,
} from '@react-native-firebase/storage';

import { AppButton } from '../src/AppButton';
import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

/** Same host mapping as `packages/app/e2e/helpers.js` `getE2eEmulatorHost`. */
function getStorageEmulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
}

/** Default Storage port from `.github/workflows/scripts/firebase.emulator.template.json`. */
const STORAGE_EMULATOR_PORT = 9199;

const DEMO_PREFIX = 'expo-storage';
const DEMO_OBJECT = `${DEMO_PREFIX}/message.txt`;
const DEMO_BYTES_OBJECT = `${DEMO_PREFIX}/hello.bin`;

let emulatorConnected = false;

function ensureStorageEmulator(): void {
  if (emulatorConnected) {
    return;
  }
  connectStorageEmulator(getStorage(), getStorageEmulatorHost(), STORAGE_EMULATOR_PORT);
  emulatorConnected = true;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function StorageScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storage = useMemo(() => getStorage(), []);
  const demoRef = useMemo(() => ref(storage, DEMO_OBJECT), [storage]);
  const localPath = `${FilePath.DOCUMENT_DIRECTORY}/expo-storage-demo.txt`;

  function showResult(message: string) {
    setError(null);
    setResult(message);
  }

  function showError(e: unknown) {
    setResult(null);
    setError(errorMessage(e));
  }

  async function run(label: string, action: () => unknown | Promise<unknown>) {
    try {
      ensureStorageEmulator();
      const value = await action();
      showResult(
        typeof value === 'string'
          ? value
          : `${label}: ok${value === undefined ? '' : ` → ${JSON.stringify(value)}`}`,
      );
    } catch (e) {
      showError(e);
    }
  }

  return (
    <ScreenChrome title="storage" result={result} error={error}>
      <Text style={styles.hint}>
        Connects to the Storage emulator at {getStorageEmulatorHost()}:{STORAGE_EMULATOR_PORT}{' '}
        before any upload, download, list, metadata, or task listener (same host mapping as the e2e
        helpers; CI default port 9199).
      </Text>

      <Text style={styles.section}>Instance</Text>
      <AppButton title="SDK_VERSION" onPress={() => run('SDK_VERSION', () => SDK_VERSION)} />
      <AppButton
        title="getStorage"
        onPress={() =>
          run('getStorage', () => {
            const instance = getStorage();
            return { appName: instance.app.name, bucket: instance.app.options.storageBucket };
          })
        }
      />
      <AppButton
        title="connectStorageEmulator"
        onPress={() =>
          run('connectStorageEmulator', () => {
            ensureStorageEmulator();
            return `${getStorageEmulatorHost()}:${STORAGE_EMULATOR_PORT}`;
          })
        }
      />
      <AppButton
        title="getStorage (secondary bucket arg)"
        onPress={() =>
          run('getStorage(bucket)', () => {
            const bucket = getApp().options.storageBucket;
            if (!bucket) {
              throw new Error('getApp().options.storageBucket is missing');
            }
            const secondary = getStorage(getApp(), `gs://${bucket}`);
            return {
              appName: secondary.app.name,
              referenceBucket: ref(secondary, DEMO_OBJECT).bucket,
            };
          })
        }
      />
      <AppButton
        title="ref"
        onPress={() =>
          run('ref', () => ({
            fullPath: demoRef.fullPath,
            name: demoRef.name,
            bucket: demoRef.bucket,
            parent: demoRef.parent?.fullPath ?? null,
            root: demoRef.root.fullPath,
            rootParent: demoRef.root.parent,
          }))
        }
      />
      <AppButton
        title="ref (root, child, sibling)"
        onPress={() =>
          run('ref(root/child)', () => {
            const rootRef = ref(storage);
            const childRef = ref(ref(storage, DEMO_PREFIX), 'child.txt');
            const parentRef = childRef.parent;
            const siblingRef = parentRef ? ref(parentRef, 'sibling.txt') : null;
            return {
              root: rootRef.fullPath,
              child: childRef.fullPath,
              sibling: siblingRef?.fullPath ?? null,
            };
          })
        }
      />
      <AppButton
        title="ref (gs:// URL)"
        onPress={() =>
          run('ref(gs://)', () => {
            const bucket = getApp().options.storageBucket;
            if (!bucket) {
              throw new Error('getApp().options.storageBucket is missing');
            }
            const fromUrl = ref(storage, `gs://${bucket}/${DEMO_OBJECT}`);
            return fromUrl.fullPath;
          })
        }
      />
      <AppButton
        title="ref (https:// URL)"
        onPress={() =>
          run('ref(https://)', () => {
            const bucket = getApp().options.storageBucket;
            if (!bucket) {
              throw new Error('getApp().options.storageBucket is missing');
            }
            const encodedPath = encodeURIComponent(DEMO_OBJECT);
            const fromUrl = ref(
              storage,
              `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`,
            );
            return fromUrl.fullPath;
          })
        }
      />

      <Text style={styles.section}>Retry helpers</Text>
      <Text style={styles.warning}>
        Warning: the retry helpers are Android and iOS helpers. They change the retry limits of the
        default Storage instance.
      </Text>
      <AppButton
        title="setMaxOperationRetryTime (10s)"
        onPress={() =>
          run('setMaxOperationRetryTime', () => setMaxOperationRetryTime(storage, 10_000))
        }
      />
      <AppButton
        title="setMaxUploadRetryTime (60s)"
        onPress={() => run('setMaxUploadRetryTime', () => setMaxUploadRetryTime(storage, 60_000))}
      />
      <AppButton
        title="setMaxDownloadRetryTime (60s)"
        onPress={() =>
          run('setMaxDownloadRetryTime', () => setMaxDownloadRetryTime(storage, 60_000))
        }
      />

      <Text style={styles.section}>Uploads</Text>
      <AppButton
        title="uploadString"
        onPress={() =>
          run('uploadString', async () => {
            const task = uploadString(
              demoRef,
              `hello from expo storage ${Date.now()}`,
              StringFormat.RAW,
              { contentType: 'text/plain' },
            );
            await task;
            return DEMO_OBJECT;
          })
        }
      />
      <AppButton
        title="uploadBytesResumable"
        onPress={() =>
          run('uploadBytesResumable', async () => {
            const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
            const task = uploadBytesResumable(ref(storage, DEMO_BYTES_OBJECT), bytes);
            await task;
            return DEMO_BYTES_OBJECT;
          })
        }
      />
      <Text style={styles.warning}>
        Warning: `putFile` and `writeToFile` are native-only file-path APIs (they reject on the web
        interop platform). `putFile` first downloads the demo object to a local file so that the
        file exists.
      </Text>
      <AppButton
        title="putFile (native only)"
        onPress={() =>
          run('putFile', async () => {
            // Seed a remote object, download it locally, then re-upload via putFile.
            await uploadString(demoRef, `putFile seed ${Date.now()}`, StringFormat.RAW);
            await writeToFile(demoRef, localPath);
            const task = putFile(demoRef, localPath, { contentType: 'text/plain' });
            await task;
            return localPath;
          })
        }
      />
      <AppButton
        title="StringFormat.RAW"
        onPress={() => run('StringFormat', () => StringFormat.RAW)}
      />

      <Text style={styles.section}>Task controls</Text>
      <AppButton
        title="task.on (STATE_CHANGED)"
        onPress={() =>
          run('task.on', async () => {
            const task = uploadString(demoRef, `task.on demo ${Date.now()}`, StringFormat.RAW);
            await new Promise<void>((resolve, reject) => {
              task.on(
                TaskEvent.STATE_CHANGED,
                snapshot => {
                  showResult(
                    `task.on: ${snapshot.bytesTransferred}/${snapshot.totalBytes} state=${snapshot.state}`,
                  );
                },
                error => reject(error),
                () => resolve(),
              );
              task.catch(error => reject(error));
            });
            return TaskEvent.STATE_CHANGED;
          })
        }
      />
      <AppButton
        title="TaskEvent / TaskState"
        onPress={() =>
          run('TaskEvent/TaskState', () => ({
            STATE_CHANGED: TaskEvent.STATE_CHANGED,
            RUNNING: TaskState.RUNNING,
            PAUSED: TaskState.PAUSED,
            SUCCESS: TaskState.SUCCESS,
            CANCELED: TaskState.CANCELED,
            CANCELLED: TaskState.CANCELLED,
          }))
        }
      />
      <AppButton
        title="task.on (Subscribe form)"
        onPress={() =>
          run('task.on(event)', async () => {
            const task = uploadString(demoRef, `subscribe demo ${Date.now()}`, StringFormat.RAW);
            // With only the event name, `task.on` returns the Subscribe helper at runtime.
            const subscribe = task.on(TaskEvent.STATE_CHANGED) as Subscribe<TaskSnapshot>;
            const states: string[] = [];
            await new Promise<void>((resolve, reject) => {
              subscribe(
                (snapshot: TaskSnapshot) => {
                  states.push(snapshot.state);
                },
                error => reject(error),
                () => resolve(),
              );
              task.catch(error => reject(error));
            });
            return { states };
          })
        }
      />
      <Text style={styles.warning}>
        Warning: this control cancels a 2 MB upload while it runs. Cancelling fails the task with
        the error code storage/cancelled, which the control reports. The booleans are false when the
        transfer finished before the call could take effect.
      </Text>
      <AppButton
        title="task.pause / resume / cancel (cancels the upload)"
        variant="secondary"
        onPress={() =>
          run(
            'task.pause/resume/cancel',
            () =>
              new Promise<unknown>((resolve, reject) => {
                const task = uploadBytesResumable(
                  ref(storage, `${DEMO_PREFIX}/pause-demo.bin`),
                  new Uint8Array(2 * 1024 * 1024).fill(7),
                );
                const outcome: {
                  paused: boolean | null;
                  resumed: boolean | null;
                  canceled: boolean | null;
                  finalCode: string | null;
                } = { paused: null, resumed: null, canceled: null, finalCode: null };

                const timer = setTimeout(
                  () => reject(new Error('task did not settle within 30s')),
                  30_000,
                );
                const finish = () => {
                  clearTimeout(timer);
                  resolve(outcome);
                };

                task.on(
                  TaskEvent.STATE_CHANGED,
                  snapshot => {
                    if (snapshot.state === TaskState.RUNNING && outcome.paused === null) {
                      outcome.paused = task.pause();
                    } else if (snapshot.state === TaskState.PAUSED && outcome.resumed === null) {
                      outcome.resumed = task.resume();
                    } else if (snapshot.state === TaskState.RUNNING && outcome.resumed !== null) {
                      if (outcome.canceled === null) {
                        outcome.canceled = task.cancel();
                      }
                    }
                  },
                  error => {
                    outcome.finalCode = error.code;
                    finish();
                  },
                  finish,
                );
                task.catch(error => {
                  outcome.finalCode = error.code;
                  finish();
                });
              }),
          )
        }
      />

      <Text style={styles.section}>Downloads / metadata / list / delete</Text>
      <AppButton
        title="getDownloadURL"
        onPress={() => run('getDownloadURL', () => getDownloadURL(demoRef))}
      />
      <AppButton
        title="writeToFile (native only)"
        onPress={() =>
          run('writeToFile', async () => {
            await uploadString(demoRef, `writeToFile seed ${Date.now()}`, StringFormat.RAW);
            const task = writeToFile(demoRef, localPath);
            await task;
            return localPath;
          })
        }
      />
      <AppButton
        title="getMetadata"
        onPress={() =>
          run('getMetadata', async () => {
            const metadata = await getMetadata(demoRef);
            return {
              fullPath: metadata.fullPath,
              contentType: metadata.contentType,
              size: metadata.size,
            };
          })
        }
      />
      <Text style={styles.warning}>
        Warning: `updateMetadata` changes the stored metadata of the demo object, and `deleteObject`
        removes it (both against the emulator).
      </Text>
      <AppButton
        title="updateMetadata (modifies the object)"
        onPress={() =>
          run('updateMetadata', async () => {
            const metadata = await updateMetadata(demoRef, {
              contentType: 'text/plain',
              customMetadata: { source: 'test-expo' },
            });
            return metadata.customMetadata;
          })
        }
      />
      <AppButton
        title="list"
        onPress={() =>
          run('list', async () => {
            const result = await list(ref(storage, DEMO_PREFIX), { maxResults: 20 });
            return {
              items: result.items.map(item => item.fullPath),
              prefixes: result.prefixes.map(prefix => prefix.fullPath),
              nextPageToken: result.nextPageToken ?? null,
            };
          })
        }
      />
      <AppButton
        title="list (paginate, maxResults 1)"
        onPress={() =>
          run('list(paginate)', async () => {
            const folder = ref(storage, DEMO_PREFIX);
            const firstPage = await list(folder, { maxResults: 1 });
            const secondPage = firstPage.nextPageToken
              ? await list(folder, { maxResults: 1, pageToken: firstPage.nextPageToken })
              : null;
            return {
              firstPage: firstPage.items.map(item => item.fullPath),
              hasNextPage: Boolean(firstPage.nextPageToken),
              secondPage: secondPage ? secondPage.items.map(item => item.fullPath) : null,
            };
          })
        }
      />
      <AppButton
        title="listAll"
        onPress={() =>
          run('listAll', async () => {
            const result = await listAll(ref(storage, DEMO_PREFIX));
            return {
              items: result.items.map(item => item.fullPath),
              prefixes: result.prefixes.map(prefix => prefix.fullPath),
            };
          })
        }
      />
      <AppButton
        title="deleteObject (removes the object)"
        onPress={() =>
          run('deleteObject', async () => {
            await uploadString(demoRef, `delete me ${Date.now()}`, StringFormat.RAW);
            await deleteObject(demoRef);
            return DEMO_OBJECT;
          })
        }
      />

      <Text style={styles.section}>Not implemented (throw)</Text>
      <Text style={styles.warning}>
        Warning: `uploadBytes`, `getBlob`, `getBytes`, and `getStream` always fail on React Native
        Firebase (`not implemented`): `uploadBytes` rejects and the other three throw. Prefer
        `uploadBytesResumable` / `uploadString` / `putFile` and `getDownloadURL` / `writeToFile`.
      </Text>
      <AppButton
        title="uploadBytes() (rejects)"
        variant="secondary"
        onPress={() =>
          run('uploadBytes', () => {
            // WARNING: uploadBytes() is not implemented on React Native Firebase.
            return uploadBytes(demoRef, new Uint8Array([1, 2, 3]));
          })
        }
      />
      <AppButton
        title="getBlob() (throws)"
        variant="secondary"
        onPress={() =>
          run('getBlob', () => {
            // WARNING: getBlob() is not implemented on React Native Firebase.
            return getBlob(demoRef);
          })
        }
      />
      <AppButton
        title="getBytes() (throws)"
        variant="secondary"
        onPress={() =>
          run('getBytes', () => {
            // WARNING: getBytes() is not implemented on React Native Firebase.
            return getBytes(demoRef);
          })
        }
      />
      <AppButton
        title="getStream() (throws)"
        variant="secondary"
        onPress={() =>
          run('getStream', () => {
            // WARNING: getStream() is not implemented on React Native Firebase.
            return getStream(demoRef);
          })
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  hint: { color: theme.subtleText, fontSize: 13, lineHeight: 18 },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  warning: { color: theme.error, fontSize: 13, lineHeight: 18 },
});
