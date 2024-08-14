import FDBFactory from './FDBFactory.js';
import IDBCursor from './FDBCursor.js';
import IDBCursorWithValue from './FDBCursorWithValue.js';
import IDBDatabase from './FDBDatabase.js';
import IDBFactory from './FDBFactory.js';
import IDBIndex from './FDBIndex.js';
import IDBKeyRange from './FDBKeyRange.js';
import IDBObjectStore from './FDBObjectStore.js';
import IDBOpenDBRequest from './FDBOpenDBRequest.js';
import IDBRequest from './FDBRequest.js';
import IDBTransaction from './FDBTransaction.js';
import IDBVersionChangeEvent from './FDBVersionChangeEvent.js';
import { makeStructuredCloneAvailable } from '../structuredClone';

let idbAvailable = false;
export function makeIDBAvailable() {
  if (idbAvailable) {
    return;
  }
  if (!global.window) {
    global.window = {};
  }
  if (!window.indexedDB) {
    makeStructuredCloneAvailable();
    window.indexedDB = new FDBFactory();
    window.IDBCursor = IDBCursor;
    window.IDBCursorWithValue = IDBCursorWithValue;
    window.IDBDatabase = IDBDatabase;
    window.IDBFactory = IDBFactory;
    window.IDBIndex = IDBIndex;
    window.IDBKeyRange = IDBKeyRange;
    window.IDBObjectStore = IDBObjectStore;
    window.IDBOpenDBRequest = IDBOpenDBRequest;
    window.IDBRequest = IDBRequest;
    window.IDBTransaction = IDBTransaction;
    window.IDBVersionChangeEvent = IDBVersionChangeEvent;
  }
  idbAvailable = true;
}
