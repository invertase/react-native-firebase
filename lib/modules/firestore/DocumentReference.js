/**
 * @flow
 * DocumentReference representation wrapper
 */
import CollectionReference from './CollectionReference';
import DocumentSnapshot from './DocumentSnapshot';
import Path from './Path';
import { buildNativeMap } from './utils/serialize';
import { firestoreAutoId, isFunction, isObject, isString } from '../../utils';

export type WriteOptions = {
  merge?: boolean,
}

type DocumentListenOptions = {
  includeMetadataChanges: boolean,
}

type Observer = {
  next: (DocumentSnapshot) => void,
  error?: (Object) => void,
}

 /**
 * @class DocumentReference
 */
export default class DocumentReference {
  _documentPath: Path;
  _firestore: Object;

  constructor(firestore: Object, documentPath: Path) {
    this._documentPath = documentPath;
    this._firestore = firestore;
  }

  get firestore(): Object {
    return this._firestore;
  }

  get id(): string | null {
    return this._documentPath.id;
  }

  get parent(): CollectionReference {
    const parentPath = this._documentPath.parent();
    return new CollectionReference(this._firestore, parentPath);
  }

  get path(): string {
    return this._documentPath.relativeName;
  }

  collection(collectionPath: string): CollectionReference {
    const path = this._documentPath.child(collectionPath);
    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this._firestore, path);
  }

  delete(): Promise<void> {
    return this._firestore._native
      .documentDelete(this.path);
  }

  get(): Promise<DocumentSnapshot> {
    return this._firestore._native
      .documentGet(this.path)
      .then(result => new DocumentSnapshot(this._firestore, result));
  }

  onSnapshot(
    optionsOrObserverOrOnNext: DocumentListenOptions | Observer | (DocumentSnapshot) => void,
    observerOrOnNextOrOnError?: Observer | (DocumentSnapshot) => void | (Object) => void,
    onError?: (Object) => void
  ) {
    let observer = {};
    let docListenOptions = {};
    // Called with: onNext, ?onError
    if (isFunction(optionsOrObserverOrOnNext)) {
      observer.next = optionsOrObserverOrOnNext;
      if (observerOrOnNextOrOnError && !isFunction(observerOrOnNextOrOnError)) {
        throw new Error('DocumentReference.onSnapshot failed: Second argument must be a valid function.');
      }
      observer.error = observerOrOnNextOrOnError;
    } else if (optionsOrObserverOrOnNext && isObject(optionsOrObserverOrOnNext)) {
      // Called with: Observer
      if (optionsOrObserverOrOnNext.next) {
        if (isFunction(optionsOrObserverOrOnNext.next)) {
          if (optionsOrObserverOrOnNext.error && !isFunction(optionsOrObserverOrOnNext.error)) {
            throw new Error('DocumentReference.onSnapshot failed: Observer.error must be a valid function.');
          }
          observer = optionsOrObserverOrOnNext;
        } else {
          throw new Error('DocumentReference.onSnapshot failed: Observer.next must be a valid function.');
        }
      } else if (optionsOrObserverOrOnNext.includeMetadataChanges) {
        docListenOptions = optionsOrObserverOrOnNext;
        // Called with: Options, onNext, ?onError
        if (isFunction(observerOrOnNextOrOnError)) {
          observer.next = observerOrOnNextOrOnError;
          if (onError && !isFunction(onError)) {
            throw new Error('DocumentReference.onSnapshot failed: Third argument must be a valid function.');
          }
          observer.error = onError;
        // Called with Options, Observer
        } else if (observerOrOnNextOrOnError && isObject(observerOrOnNextOrOnError) && observerOrOnNextOrOnError.next) {
          if (isFunction(observerOrOnNextOrOnError.next)) {
            if (observerOrOnNextOrOnError.error && !isFunction(observerOrOnNextOrOnError.error)) {
              throw new Error('DocumentReference.onSnapshot failed: Observer.error must be a valid function.');
            }
            observer = observerOrOnNextOrOnError;
          } else {
            throw new Error('DocumentReference.onSnapshot failed: Observer.next must be a valid function.');
          }
        } else {
          throw new Error('DocumentReference.onSnapshot failed: Second argument must be a function or observer.');
        }
      } else {
        throw new Error('DocumentReference.onSnapshot failed: First argument must be a function, observer or options.');
      }
    } else {
      throw new Error('DocumentReference.onSnapshot failed: Called with invalid arguments.');
    }
    const listenerId = firestoreAutoId();

    const listener = (nativeDocumentSnapshot) => {
      const documentSnapshot = new DocumentSnapshot(this, nativeDocumentSnapshot);
      observer.next(documentSnapshot);
    };

    // Listen to snapshot events
    this._firestore.on(
      this._firestore._getAppEventName(`onDocumentSnapshot:${listenerId}`),
      listener,
    );

    // Listen for snapshot error events
    if (observer.error) {
      this._firestore.on(
        this._firestore._getAppEventName(`onDocumentSnapshotError:${listenerId}`),
        observer.error,
      );
    }

    // Add the native listener
    this._firestore._native
      .documentOnSnapshot(this.path, listenerId, docListenOptions);

    // Return an unsubscribe method
    return this._offDocumentSnapshot.bind(this, listenerId, listener);
  }

  set(data: Object, writeOptions?: WriteOptions): Promise<void> {
    const nativeData = buildNativeMap(data);
    return this._firestore._native
      .documentSet(this.path, nativeData, writeOptions);
  }

  update(...args: Object | string[]): Promise<void> {
    let data = {};
    if (args.length === 1) {
      if (!isObject(args[0])) {
        throw new Error('DocumentReference.update failed: If using a single argument, it must be an object.');
      }
      data = args[0];
    } else if (args.length % 2 === 1) {
      throw new Error('DocumentReference.update failed: Must have either a single object argument, or equal numbers of key/value pairs.');
    } else {
      for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        if (!isString(key)) {
          throw new Error(`DocumentReference.update failed: Argument at index ${i} must be a string`);
        }
        data[key] = value;
      }
    }
    const nativeData = buildNativeMap(data);
    return this._firestore._native
      .documentUpdate(this.path, nativeData);
  }

  /**
   * INTERNALS
   */

  /**
   * Remove document snapshot listener
   * @param listener
   */
  _offDocumentSnapshot(listenerId: number, listener: Function) {
    this._firestore.log.info('Removing onDocumentSnapshot listener');
    this._firestore.removeListener(this._firestore._getAppEventName(`onDocumentSnapshot:${listenerId}`), listener);
    this._firestore.removeListener(this._firestore._getAppEventName(`onDocumentSnapshotError:${listenerId}`), listener);
    this._firestore._native
      .documentOffSnapshot(this.path, listenerId);
  }
}
