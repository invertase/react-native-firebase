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
} from '@react-native-firebase/app/dist/module/internal/web/firebaseStorage';
import type {
  StorageReference,
  UploadTask,
  UploadTaskSnapshot as FirebaseUploadTaskSnapshot,
  FullMetadata,
  ListResult as FirebaseListResult,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseStorage';
import type { FirebaseApp } from '@react-native-firebase/app/dist/module/internal/web/firebaseApp';

import {
  guard,
  getWebError,
  emitEvent,
} from '@react-native-firebase/app/dist/module/internal/web/utils';
import { Base64 } from '@react-native-firebase/app/dist/module/common';

type Storage = ReturnType<typeof getStorage>;
interface EmulatorConfig {
  host: string;
  port: number;
}

interface Metadata {
  bucket?: string;
  generation?: string;
  metageneration?: string;
  fullPath?: string;
  name?: string;
  size?: number;
  timeCreated?: string;
  updated?: string;
  md5Hash?: string;
  cacheControl?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentType?: string;
  customMetadata?: Record<string, string>;
}

interface SettableMetadata {
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentType?: string;
  contentLanguage?: string;
  customMetadata?: Record<string, string>;
  md5Hash?: string;
}

interface UploadTaskSnapshot {
  totalBytes: number;
  bytesTransferred: number;
  state: string;
  metadata: Metadata;
}

interface ListOptions {
  maxResults?: number;
  pageToken?: string;
}

function rejectWithCodeAndMessage(code: string, message: string): Promise<never> {
  const error = new Error(message);
  (error as Error & { code?: string }).code = code;
  return Promise.reject(getWebError(error));
}

function metadataToObject(
  metadata: Metadata | FullMetadata,
): Metadata & { metadata?: Record<string, string> } {
  const out: Metadata & { metadata?: Record<string, string> } = {
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

function uploadTaskErrorToObject(
  error: Error,
  snapshot: FirebaseUploadTaskSnapshot | null,
): UploadTaskSnapshot & { error: ReturnType<typeof getWebError> } {
  return {
    ...uploadTaskSnapshotToObject(snapshot),
    state: 'error',
    error: getWebError(error),
  };
}

function uploadTaskSnapshotToObject(
  snapshot: FirebaseUploadTaskSnapshot | null,
): UploadTaskSnapshot {
  return {
    totalBytes: snapshot ? snapshot.totalBytes : 0,
    bytesTransferred: snapshot ? snapshot.bytesTransferred : 0,
    state: snapshot ? snapshot.state : 'unknown',
    metadata: snapshot && snapshot.metadata ? metadataToObject(snapshot.metadata as Metadata) : {},
  };
}

function makeSettableMetadata(metadata: SettableMetadata): SettableMetadata {
  return {
    cacheControl: metadata.cacheControl,
    contentDisposition: metadata.contentDisposition,
    contentEncoding: metadata.contentEncoding,
    contentType: metadata.contentType,
    contentLanguage: metadata.contentLanguage,
    customMetadata: metadata.customMetadata,
  };
}

function listResultToObject(result: FirebaseListResult) {
  return {
    nextPageToken: result.nextPageToken ?? undefined,
    items: result.items.map(ref => ref.fullPath),
    prefixes: result.prefixes.map(ref => ref.fullPath),
  };
}

const emulatorForApp: Record<string, EmulatorConfig> = {};
const appInstances: Record<string, FirebaseApp> = {};
const storageInstances: Record<string, Storage> = {};
const tasks: Record<string, UploadTask> = {};

function getBucketFromUrl(url: string): string {
  // Check if the URL starts with "gs://"
  if (url.startsWith('gs://')) {
    // Return the bucket name by extracting everything up to the first slash after "gs://"
    // and removing the "gs://" prefix
    return url.substring(5).split('/')[0]!;
  } else {
    // Assume the URL is a path format, strip the leading slash if it exists and extract the bucket name
    const strippedUrl = url.startsWith('/') ? url.substring(1) : url;
    // Extract the bucket from the path, assuming it ends at the first slash after the domain
    return strippedUrl.split('/')[0]!;
  }
}

function getCachedAppInstance(appName: string): FirebaseApp {
  return (appInstances[appName] ??= getApp(appName));
}

function emulatorKey(appName: string, url: string): string {
  const bucket = getBucketFromUrl(url);
  return `${appName}|${bucket}`;
}

// Returns a cached Storage instance.
function getCachedStorageInstance(appName: string, url?: string | null): Storage {
  let instance: Storage;
  const app = getCachedAppInstance(appName);
  const bucket = url ? getBucketFromUrl(url) : (app.options.storageBucket ?? undefined);

  if (!url || !bucket) {
    const defaultBucket = app.options.storageBucket;
    if (!defaultBucket) {
      throw new Error(`No storage bucket configured for app ${appName}`);
    }
    instance = getCachedStorageInstance(appName, defaultBucket);
  } else {
    instance = storageInstances[`${appName}|${bucket}`] ??= getStorage(app, bucket);
  }

  if (bucket) {
    const key = emulatorKey(appName, bucket);
    if (emulatorForApp[key]) {
      connectStorageEmulator(instance, emulatorForApp[key].host, emulatorForApp[key].port);
    }
  }
  return instance;
}

// Returns a Storage Reference.
function getReferenceFromUrl(appName: string, url: string): StorageReference {
  const path = url.substring(url.indexOf('/') + 1);
  const instance = getCachedStorageInstance(appName, path);
  return firebaseStorageRef(instance, url);
}

const CONSTANTS: {
  maxDownloadRetryTime?: number;
  maxOperationRetryTime?: number;
  maxUploadRetryTime?: number;
} = {};
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
   * @param appName - The app name.
   * @param url - The path to the object.
   * @return {Promise<void>}
   */
  delete(appName: string, url: string): Promise<void> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      await deleteObject(ref);
    });
  },

  /**
   * Get the download URL for an object.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @return {Promise<string>} The download URL.
   */
  getDownloadURL(appName: string, url: string): Promise<string> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      const downloadURL = await getDownloadURL(ref);
      return downloadURL;
    });
  },

  /**
   * Get the metadata for an object.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @return {Promise<Object>} The metadata.
   */
  getMetadata(
    appName: string,
    url: string,
  ): Promise<Metadata & { metadata?: Record<string, string> }> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      const metadata = await getMetadata(ref);
      return metadataToObject(metadata);
    });
  },

  /**
   * List objects at the path.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @param listOptions - The list options.
   * @return {Promise<Object>} The list result.
   */
  list(
    appName: string,
    url: string,
    listOptions?: ListOptions,
  ): Promise<{
    nextPageToken?: string;
    items: string[];
    prefixes: string[];
  }> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      const listResult = await list(ref, listOptions);
      return listResultToObject(listResult);
    });
  },

  /**
   * List all objects at the path.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @return {Promise<Object>} The list result.
   */
  listAll(
    appName: string,
    url: string,
  ): Promise<{
    nextPageToken?: string;
    items: string[];
    prefixes: string[];
  }> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      const listResult = await listAll(ref);
      return listResultToObject(listResult);
    });
  },

  /**
   * Update the metadata for an object.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @param metadata - The metadata (SettableMetadata).
   */
  updateMetadata(
    appName: string,
    url: string,
    metadata: SettableMetadata,
  ): Promise<Metadata & { metadata?: Record<string, string> }> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      const updated = await updateMetadata(ref, makeSettableMetadata(metadata));
      return metadataToObject(updated);
    });
  },

  setMaxDownloadRetryTime(): void {
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
   * @param appName - The app name.
   * @param milliseconds - The maximum operation retry time.
   * @return {Promise<void>}
   */
  setMaxOperationRetryTime(appName: string, milliseconds: number): Promise<void> {
    return guard(async () => {
      const storage = getCachedStorageInstance(appName);
      storage.maxOperationRetryTime = milliseconds;
    });
  },

  /**
   * Set the maximum upload retry time.
   * @param appName - The app name.
   * @param milliseconds - The maximum upload retry time.
   * @return {Promise<void>}
   */
  setMaxUploadRetryTime(appName: string, milliseconds: number): Promise<void> {
    return guard(async () => {
      const storage = getCachedStorageInstance(appName);
      storage.maxUploadRetryTime = milliseconds;
    });
  },

  /**
   * Use the Firebase Storage emulator.
   * @param appName - The app name.
   * @param host - The emulator host.
   * @param port - The emulator port.
   * @return {Promise<void>}
   */
  useEmulator(appName: string, host: string, port: number, url: string): Promise<void> {
    return guard(async () => {
      const instance = getCachedStorageInstance(appName, url);
      connectStorageEmulator(instance, host, port);
      const key = emulatorKey(appName, url);
      emulatorForApp[key] = { host, port };
    });
  },

  writeToFile(): Promise<never> {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Put a string to the path.
   * @param appName - The app name.
   * @param url - The path to the object.
   * @param string - The string to put.
   * @param format - The format of the string.
   * @param metadata - The metadata (SettableMetadata).
   * @param taskId - The task ID.
   * @return {Promise<Object>} The upload snapshot.
   */
  putString(
    appName: string,
    url: string,
    string: string,
    format: string,
    metadata: SettableMetadata = {},
    taskId: string,
  ): Promise<UploadTaskSnapshot> {
    return guard(async () => {
      const ref = getReferenceFromUrl(appName, url);
      let decodedString: string | null = null;

      // This is always either base64 or base64url
      switch (format) {
        case 'base64':
          decodedString = Base64.atob(string);
          break;
        case 'base64url':
          decodedString = Base64.atob(string.replace(/_/g, '/').replace(/-/g, '+'));
          break;
      }

      const arrayBuffer = new Uint8Array([...decodedString!].map(c => c.charCodeAt(0)));

      const task = uploadBytesResumable(ref, arrayBuffer, {
        ...makeSettableMetadata(metadata),
        md5Hash: metadata.md5Hash,
      });

      // Store the task in the tasks map.
      tasks[taskId] = task;

      const snapshot = await new Promise<FirebaseUploadTaskSnapshot>((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot: FirebaseUploadTaskSnapshot) => {
            const event = {
              body: uploadTaskSnapshotToObject(snapshot),
              appName,
              taskId,
              eventName: 'state_changed',
            };
            emitEvent('storage_event', event);
          },
          (error: Error) => {
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
                ...uploadTaskSnapshotToObject(task.snapshot),
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

  putFile(): Promise<never> {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Set the status of a task.
   * @param appName - The app name.
   * @param taskId - The task ID.
   * @param status - The status.
   * @return {Promise<boolean>} Whether the status was set.
   */
  setTaskStatus(appName: string, taskId: string, status: number): Promise<boolean> {
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
        data: uploadTaskSnapshotToObject(task.snapshot),
        appName,
        taskId,
      });

      return result;
    });
  },
};
