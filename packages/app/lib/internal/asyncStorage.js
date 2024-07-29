export const memoryStorage = new Map();

export const prefix = '@react-native-firebase:';

const asyncStorageMemory = {
  setItem(key, value) {
    memoryStorage.set(key, value);
    return Promise.resolve();
  },
  getItem(key) {
    const hasValue = memoryStorage.has(key);
    if (hasValue) {
      return Promise.resolve(memoryStorage.get(key));
    }
    return Promise.resolve(null);
  },
  removeItem: function (key) {
    memoryStorage.delete(key);
    return Promise.resolve();
  },
};

let asyncStorage = asyncStorageMemory;

export async function getReactNativeAsyncStorageInternal() {
  return asyncStorage;
}

export function setReactNativeAsyncStorageInternal(asyncStorageInstance) {
  asyncStorage = asyncStorageInstance || asyncStorageMemory;
}

export function isMemoryStorage() {
  return asyncStorage === asyncStorageMemory;
}

export async function setItem(key, value) {
  return await asyncStorage.setItem(prefix + key, value);
}

export async function getItem(key) {
  return await asyncStorage.getItem(prefix + key);
}

export async function removeItem(key) {
  return await asyncStorage.removeItem(prefix + key);
}
