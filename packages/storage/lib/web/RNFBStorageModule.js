import {
  getApps,
  connectStorageEmulator,
  getApp,
  getStorage,
  deleteObject,
  getDownloadURL,
  getMetadata,
  list,
  listAll,
  updateMetadata,
  uploadBytesResumable,
} from '@react-native-firebase/app/lib/internal/web/firebaseStorage';

// A general purpose guard function to catch errors and return a structured error object.
async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    return Promise.reject(getNativeError(e));
  }
}

// Converts a thrown error to a structured error object.
function getNativeError(error) {
  return {
    // JS doesn't expose the `storage/` part of the error code.
    code: `storage/${error.code}`,
    message: error.message,
  };
}

function rejectWithCodeAndMessage(code, message) {
  return Promise.reject(
    getNativeError({
      code,
      message,
    }),
  );
}

function metadataToObject(metadata) {
  const out = {
    bucket: metadata.bucket,
    generation: metadata.generation,
    metageneration: metadata.metageneration,
    fullPath: metadata.fullPath,
    name: metadata.name,
    size: metadata.size,
    timeCreated: metadata.timeCreated,
    updated: metadata.updated,
  };

  if ('cacheControl' in metadata) {
    out.cacheControl = metadata.cacheControl;
  }

  if ('contentLanguage' in metadata) {
    out.contentLanguage = metadata.contentLanguage;
  }

  if ('contentDisposition' in metadata) {
    out.contentDisposition = metadata.contentDisposition;
  }

  if ('contentEncoding' in metadata) {
    out.contentEncoding = metadata.contentEncoding;
  }

  if ('contentType' in metadata) {
    out.contentType = metadata.contentType;
  }

  if ('customMetadata' in metadata) {
    out.customMetadata = metadata.customMetadata;
  }

  return out;
}

function uploadTaskErrorToObject(error, snapshot) {
  return {
    ...uploadTaskSnapshotToObject(snapshot),
    state: 'error',
    error: getNativeError(error),
  };
}

function uploadTaskSnapshotToObject(snapshot) {
  return {
    totalBytes: snapshot ? snapshot.totalBytes : 0,
    bytesTransferred: snapshot ? snapshot.bytesTransferred : 0,
    state: snapshot ? tastStateToString(snapshot.state) : 'unknown',
    metadata: snapshot ? metadataToObject(snapshot.metadata) : {},
  };
}

function tastStateToString(state) {
  const override = {
    canceled: 'cancelled',
  };

  if (state in override) {
    return override[state];
  }

  return state;
}

function readableToSettableMetadata(metadata) {
  return {
    cacheControl: metadata.cacheControl,
    contentDisposition: metadata.contentDisposition,
    contentEncoding: metadata.contentEncoding,
    contentType: metadata.contentType,
    customMetadata: metadata.customMetadata,
  };
}

function listResultToObject(result) {
  return {
    nextPageToken: result.nextPageToken,
    items: result.items.map(ref => ref.fullPath),
    prefixes: result.prefixes.map(ref => ref.fullPath),
  };
}

const instances = {};
const tasks = {};

// Returns a cached Firestore instance.
function getCachedStorageInstance(appName, url) {
  const pathWithBucketName = url.substring(5);
  const bucket = url.substring(0, pathWithBucketName.indexOf('/') + 5);
  // TODO(ehesp): Does this need to cache based on dbURL too?
  return (instances[`${appName}|${bucket}`] ??= getStorage(getApp(appName), bucket));
}

const CONSTANTS = {};
const defaultAppInstance = getApps()[0];

if (defaultAppInstance) {
  CONSTANTS.maxDownloadRetryTime = 0;
  CONSTANTS.maxOperationRetryTime = 0;
  CONSTANTS.maxUploadRetryTime = 0;
}

export default {
  ...CONSTANTS,

  /**
   * Delete an object at the path.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @return {Promise<void>}
   */
  delete(appName, url) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      await deleteObject(ref);
    });
  },

  /**
   * Get the download URL for an object.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @return {Promise<string>} The download URL.
   */
  getDownloadURL(appName, url) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      const downloadURL = await getDownloadURL(ref);
      return downloadURL;
    });
  },

  /**
   * Get the metadata for an object.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @return {Promise<Object>} The metadata.
   */
  getMetadata(appName, url) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      const metadata = await getMetadata(ref);
      return metadataToObject(metadata);
    });
  },

  /**
   * List objects at the path.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @param {Object} listOptions - The list options.
   * @return {Promise<Object>} The list result.
   */
  list(appName, url, listOptions) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      const listResult = await list(ref, listOptions);
      return listResultToObject(listResult);
    });
  },

  /**
   * List all objects at the path.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @return {Promise<Object>} The list result.
   */
  listAll(appName, url) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      const listResult = await listAll(ref);
      return listResultToObject(listResult);
    });
  },

  /**
   * Update the metadata for an object.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @param {Object} metadata - The metadata (SettableMetadata).
   */
  updateMetadata(appName, url, metadata) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);
      const updated = await updateMetadata(ref, readableToSettableMetadata(metadata));
      return metadataToObject(updated);
    });
  },

  setMaxDownloadRetryTime() {
    // TODO(ehesp): No-op or error?
  },

  /**
   * Set the maximum operation retry time.
   * @param {string} appName - The app name.
   * @param {number} milliseconds - The maximum operation retry time.
   * @return {Promise<void>}
   */
  setMaxOperationRetryTime(appName, milliseconds) {
    return guard(async () => {
      const storage = getStorage(getApp(appName));
      storage.maxOperationRetryTime = milliseconds;
    });
  },

  /**
   * Set the maximum upload retry time.
   * @param {string} appName - The app name.
   * @param {number} milliseconds - The maximum upload retry time.
   * @return {Promise<void>}
   */
  setMaxUploadRetryTime(appName, milliseconds) {
    return guard(async () => {
      const storage = getStorage(getApp(appName));
      storage.maxUploadRetryTime = milliseconds;
    });
  },

  /**
   * Use the Firebase Storage emulator.
   * @param {string} appName - The app name.
   * @param {string} host - The emulator host.
   * @param {number} port - The emulator port.
   * @return {Promise<void>}
   */
  useEmulator(appName, host, port) {
    return guard(async () => {
      const app = getApp(appName);
      connectStorageEmulator(app, host, port);
    });
  },

  writeToFile() {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Put a string to the path.
   * @param {string} appName - The app name.
   * @param {string} url - The path to the object.
   * @param {string} string - The string to put.
   * @param {string} format - The format of the string.
   * @param {Object} metadata - The metadata (SettableMetadata).
   * @param {string} taskId - The task ID.
   * @return {Promise<Object>} The upload snapshot.
   */
  putString(appName, url, string, format, metadata, taskId) {
    return guard(async () => {
      const ref = getCachedStorageInstance(appName, url);

      let base64String = null;

      switch (format) {
        case 'base64':
          base64String = atob(string);
          break;
        case 'base64url':
          base64String = atob(string.replace(/_/g, '/').replace(/-/g, '+'));
          break;
      }

      const byteArray = new Uint8Array(base64String ? base64String.length : 0);

      if (base64String) {
        for (let i = 0; i < base64String.length; i++) {
          byteArray[i] = base64String.charCodeAt(i);
        }
      }

      // Start a resumable upload task.
      const task = uploadBytesResumable(ref, byteArray, {
        ...readableToSettableMetadata(metadata),
        md5Hash: metadata.md5Hash,
      });

      // Store the task in the tasks map.
      tasks[taskId] = task;

      const snapshot = await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          snapshot => {
            // On progress.
            const event = {
              data: uploadTaskSnapshotToObject(snapshot),
              appName,
              taskId,
            };

            console.console.warn('SEND EVENT_STATE_CHANGED event', event);
          },
          error => {
            const errorSnapshot = uploadTaskErrorToObject(error, task.snapshot);

            if (errorSnapshot != null) {
              console.warn('SEND EVENT_STATE_CHANGED event', event);
            }

            console.warn('SEND EVENT_UPLOAD_FAILURE event', event, errorSnapshot);

            delete tasks[taskId];

            // Reject the promise.
            reject(error);
          },
          unsub => {
            // On complete.
            unsub();
            delete tasks[taskId];

            // On progress.
            const event = {
              data: uploadTaskSnapshotToObject(task.snapshot),
              appName,
              taskId,
            };

            console.console.warn('SEND EVENT_UPLOAD_SUCCESS event', event);

            // Complete the promise.
            resolve(task.snapshot);
          },
        );
      });

      const snapshot = await promise;

      return uploadTaskSnapshotToObject(snapshot);
    });
  },

  putFile() {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Set the status of a task.
   * @param {string} appName - The app name.
   * @param {string} taskId - The task ID.
   * @param {number} status - The status.
   * @return {Promise<boolean>} Whether the status was set.
   */
  setTaskStatus(appName, taskId, status) {
    return guard(async () => {
      const task = tasks[taskId];

      // If the task doesn't exist, return false.
      if (!task) {
        return false;
      }

      let result = false;

      switch (status) {
        case 0:
          result = await task.pause();
          break;
        case 1:
          result = await task.resume();
          break;
        case 2:
          result = await task.cancel();
          break;
      }

      console.warn('SEND EVENT_TASK_STATUS event', {
        data: buildUploadSnapshotMap(task.snapshot),
        appName,
        taskId,
      });

      return result;
    });
  },
};
