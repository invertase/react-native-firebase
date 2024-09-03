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
  ref as firebaseStorageRef,
} from '@react-native-firebase/app/lib/internal/web/firebaseStorage';
import { guard, getWebError, emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';
import { Base64 } from '@react-native-firebase/app/lib/common';

function rejectWithCodeAndMessage(code, message) {
  return Promise.reject(
    getWebError({
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
    md5Hash: metadata.md5Hash,
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
    // To match Android/iOS
    out.metadata = metadata.customMetadata;
  }

  return out;
}

function uploadTaskErrorToObject(error, snapshot) {
  return {
    ...uploadTaskSnapshotToObject(snapshot),
    state: 'error',
    error: getWebError(error),
  };
}

function uploadTaskSnapshotToObject(snapshot) {
  return {
    totalBytes: snapshot ? snapshot.totalBytes : 0,
    bytesTransferred: snapshot ? snapshot.bytesTransferred : 0,
    state: snapshot ? taskStateToString(snapshot.state) : 'unknown',
    metadata: snapshot ? metadataToObject(snapshot.metadata) : {},
  };
}

function taskStateToString(state) {
  const override = {
    canceled: 'cancelled',
  };

  if (state in override) {
    return override[state];
  }

  return state;
}

function makeSettableMetadata(metadata) {
  return {
    cacheControl: metadata.cacheControl,
    contentDisposition: metadata.contentDisposition,
    contentEncoding: metadata.contentEncoding,
    contentType: metadata.contentType,
    contentLanguage: metadata.contentLanguage,
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

const emulatorForApp = {};
const appInstances = {};
const storageInstances = {};
const tasks = {};

function getBucketFromUrl(url) {
  // Check if the URL starts with "gs://"
  if (url.startsWith('gs://')) {
    // Return the bucket name by extracting everything up to the first slash after "gs://"
    // and removing the "gs://" prefix
    return url.substring(5).split('/')[0];
  } else {
    // Assume the URL is a path format, strip the leading slash if it exists and extract the bucket name
    const strippedUrl = url.startsWith('/') ? url.substring(1) : url;
    // Extract the bucket from the path, assuming it ends at the first slash after the domain
    return strippedUrl.split('/')[0];
  }
}

function getCachedAppInstance(appName) {
  return (appInstances[appName] ??= getApp(appName));
}

function emulatorKey(appName, url) {
  const bucket = getBucketFromUrl(url);
  return `${appName}|${bucket}`;
}

// Returns a cached Storage instance.
function getCachedStorageInstance(appName, url) {
  let instance;
  const bucket = url ? getBucketFromUrl(url) : getCachedAppInstance(appName).options.storageBucket;

  if (!url) {
    instance = getCachedStorageInstance(
      appName,
      getCachedAppInstance(appName).options.storageBucket,
    );
  } else {
    instance = storageInstances[`${appName}|${bucket}`] ??= getStorage(
      getCachedAppInstance(appName),
      bucket,
    );
  }

  const key = emulatorKey(appName, bucket);
  if (emulatorForApp[key]) {
    connectStorageEmulator(instance, emulatorForApp[key].host, emulatorForApp[key].port);
  }
  return instance;
}

// Returns a Storage Reference.
function getReferenceFromUrl(appName, url) {
  const path = url.substring(url.indexOf('/') + 1);
  const instance = getCachedStorageInstance(appName, path);
  return firebaseStorageRef(instance, url);
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
      const ref = getReferenceFromUrl(appName, url);
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
      const ref = getReferenceFromUrl(appName, url);
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
      const ref = getReferenceFromUrl(appName, url);
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
      const ref = getReferenceFromUrl(appName, url);
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
      const ref = getReferenceFromUrl(appName, url);
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
      const ref = getReferenceFromUrl(appName, url);
      const updated = await updateMetadata(ref, makeSettableMetadata(metadata));
      return metadataToObject(updated);
    });
  },

  setMaxDownloadRetryTime() {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        'The Firebase Storage `setMaxDownloadRetryTime` method is not available in the this environment.',
      );
      return;
    }
  },

  /**
   * Set the maximum operation retry time.
   * @param {string} appName - The app name.
   * @param {number} milliseconds - The maximum operation retry time.
   * @return {Promise<void>}
   */
  setMaxOperationRetryTime(appName, milliseconds) {
    return guard(async () => {
      const storage = getCachedStorageInstance(appName);
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
      const storage = getCachedStorageInstance(appName);
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
  useEmulator(appName, host, port, url) {
    return guard(async () => {
      const instance = getCachedStorageInstance(appName, url);
      connectStorageEmulator(instance, host, port);
      const key = emulatorKey(appName, url);
      emulatorForApp[key] = { host, port };
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
  putString(appName, url, string, format, metadata = {}, taskId) {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      let decodedString = null;

      // This is always either base64 or base64url
      switch (format) {
        case 'base64':
          decodedString = Base64.atob(string);
          break;
        case 'base64url':
          decodedString = Base64.atob(string.replace(/_/g, '/').replace(/-/g, '+'));
          break;
      }

      const encoder = new TextEncoder();

      const arrayBuffer = encoder.encode(decodedString).buffer;

      const task = uploadBytesResumable(ref, arrayBuffer, {
        ...makeSettableMetadata(metadata),
        md5Hash: metadata.md5Hash,
      });

      // Store the task in the tasks map.
      tasks[taskId] = task;

      const snapshot = await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          snapshot => {
            const event = {
              body: uploadTaskSnapshotToObject(snapshot),
              appName,
              taskId,
              eventName: 'state_changed',
            };
            emitEvent('storage_event', event);
          },
          error => {
            const errorSnapshot = uploadTaskErrorToObject(error, task.snapshot);
            const event = {
              body: {
                ...errorSnapshot,
                state: 'error',
              },
              appName,
              taskId,
              eventName: 'state_changed',
            };
            emitEvent('storage_event', event);
            emitEvent('storage_event', {
              ...event,
              eventName: 'upload_failure',
            });
            delete tasks[taskId];
            reject(error);
          },
          () => {
            delete tasks[taskId];
            const event = {
              body: {
                ...uploadTaskSnapshotToObject(snapshot),
                state: 'success',
              },
              appName,
              taskId,
              eventName: 'state_changed',
            };
            emitEvent('storage_event', event);
            emitEvent('storage_event', {
              ...event,
              eventName: 'upload_success',
            });
            resolve(task.snapshot);
          },
        );
      });

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
    // TODO this function implementation cannot
    // be tested right now since we're unable
    // to create a big enough upload to be able to
    // pause/resume/cancel it in time.
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

      emitEvent('storage_event', {
        data: buildUploadSnapshotMap(task.snapshot),
        appName,
        taskId,
      });

      return result;
    });
  },
};
