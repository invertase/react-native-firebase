/**
 * @flow
 * DocumentReference representation wrapper
 */
import SnapshotError from './SnapshotError';
import DocumentSnapshot from './DocumentSnapshot';
import CollectionReference from './CollectionReference';
import { parseUpdateArgs } from './utils';
import { buildNativeMap } from './utils/serialize';
import { getNativeModule } from '../../utils/native';
import { firestoreAutoId, isFunction, isObject } from '../../utils';
import { getAppEventName, SharedEventEmitter } from '../../utils/events';

import type Firestore from './';
import type {
  GetOptions,
  MetadataChanges,
  NativeDocumentSnapshot,
  SetOptions,
} from './firestoreTypes.flow';
import type Path from './Path';
import type { NativeErrorResponse } from '../../common/commonTypes.flow';

type ObserverOnError = SnapshotError => void;
type ObserverOnNext = DocumentSnapshot => void;

type Observer = {
  error?: ObserverOnError,
  next: ObserverOnNext,
};

/**
 * @class DocumentReference
 */
export default class DocumentReference {
  _documentPath: Path;

  _firestore: Firestore;

  constructor(firestore: Firestore, documentPath: Path) {
    this._documentPath = documentPath;
    this._firestore = firestore;
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get id(): string {
    return this._documentPath.id;
  }

  get parent(): CollectionReference {
    const parentPath = this._documentPath.parent();
    // $FlowExpectedError: parentPath can never be null
    return new CollectionReference(this._firestore, parentPath);
  }

  get path(): string {
    return this._documentPath.relativeName;
  }

  isEqual(otherDocumentReference: DocumentReference) {
    if (!(otherDocumentReference instanceof DocumentReference)) {
      throw new Error(
        'firebase.firestore.DocumentReference.isEqual(*) expects an instance of DocumentReference.'
      );
    }

    // check paths match
    if (this.path !== otherDocumentReference.path) return false;

    // check same firestore app name
    if (
      this._firestore.app.name !== otherDocumentReference._firestore.app.name
    ) {
      return false;
    }

    // check same firestore app projectId
    // noinspection RedundantIfStatementJS
    if (
      this._firestore.app.options.projectId !==
      otherDocumentReference._firestore.app.options.projectId
    ) {
      return false;
    }

    return true;
  }

  collection(collectionPath: string): CollectionReference {
    const path = this._documentPath.child(collectionPath);
    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this._firestore, path);
  }

  delete(): Promise<void> {
    return getNativeModule(this._firestore).documentDelete(this.path);
  }

  get(options?: GetOptions): Promise<DocumentSnapshot> {
    if (options) {
      if (!isObject(options)) {
        return Promise.reject(
          new Error(
            'DocumentReference.get failed: First argument must be an object.'
          )
        );
      }
      if (
        options.source &&
        options.source !== 'default' &&
        options.source !== 'server' &&
        options.source !== 'cache'
      ) {
        return Promise.reject(
          new Error(
            'DocumentReference.get failed: GetOptions.source must be one of `default`, `server` or `cache`.'
          )
        );
      }
    }
    return getNativeModule(this._firestore)
      .documentGet(this.path, options)
      .then(result => new DocumentSnapshot(this._firestore, result));
  }

  onSnapshot(
    optionsOrObserverOrOnNext: MetadataChanges | Observer | ObserverOnNext,
    observerOrOnNextOrOnError?: Observer | ObserverOnNext | ObserverOnError,
    onError?: ObserverOnError
  ) {
    let observer: Observer;
    let docListenOptions = {};
    // Called with: onNext, ?onError
    if (isFunction(optionsOrObserverOrOnNext)) {
      if (observerOrOnNextOrOnError && !isFunction(observerOrOnNextOrOnError)) {
        throw new Error(
          'DocumentReference.onSnapshot failed: Second argument must be a valid function.'
        );
      }
      // $FlowExpectedError: Not coping with the overloaded method signature
      observer = {
        next: optionsOrObserverOrOnNext,
        error: observerOrOnNextOrOnError,
      };
    } else if (
      optionsOrObserverOrOnNext &&
      isObject(optionsOrObserverOrOnNext)
    ) {
      // Called with: Observer
      if (optionsOrObserverOrOnNext.next) {
        if (isFunction(optionsOrObserverOrOnNext.next)) {
          if (
            optionsOrObserverOrOnNext.error &&
            !isFunction(optionsOrObserverOrOnNext.error)
          ) {
            throw new Error(
              'DocumentReference.onSnapshot failed: Observer.error must be a valid function.'
            );
          }
          // $FlowExpectedError: Not coping with the overloaded method signature
          observer = {
            next: optionsOrObserverOrOnNext.next,
            error: optionsOrObserverOrOnNext.error,
          };
        } else {
          throw new Error(
            'DocumentReference.onSnapshot failed: Observer.next must be a valid function.'
          );
        }
      } else if (
        Object.prototype.hasOwnProperty.call(
          optionsOrObserverOrOnNext,
          'includeMetadataChanges'
        )
      ) {
        docListenOptions = optionsOrObserverOrOnNext;
        // Called with: Options, onNext, ?onError
        if (isFunction(observerOrOnNextOrOnError)) {
          if (onError && !isFunction(onError)) {
            throw new Error(
              'DocumentReference.onSnapshot failed: Third argument must be a valid function.'
            );
          }
          // $FlowExpectedError: Not coping with the overloaded method signature
          observer = {
            next: observerOrOnNextOrOnError,
            error: onError,
          };
          // Called with Options, Observer
        } else if (
          observerOrOnNextOrOnError &&
          isObject(observerOrOnNextOrOnError) &&
          observerOrOnNextOrOnError.next
        ) {
          if (isFunction(observerOrOnNextOrOnError.next)) {
            if (
              observerOrOnNextOrOnError.error &&
              !isFunction(observerOrOnNextOrOnError.error)
            ) {
              throw new Error(
                'DocumentReference.onSnapshot failed: Observer.error must be a valid function.'
              );
            }
            observer = {
              next: observerOrOnNextOrOnError.next,
              error: observerOrOnNextOrOnError.error,
            };
          } else {
            throw new Error(
              'DocumentReference.onSnapshot failed: Observer.next must be a valid function.'
            );
          }
        } else {
          throw new Error(
            'DocumentReference.onSnapshot failed: Second argument must be a function or observer.'
          );
        }
      } else {
        throw new Error(
          'DocumentReference.onSnapshot failed: First argument must be a function, observer or options.'
        );
      }
    } else {
      throw new Error(
        'DocumentReference.onSnapshot failed: Called with invalid arguments.'
      );
    }
    const listenerId = firestoreAutoId();

    const listener = (nativeDocumentSnapshot: NativeDocumentSnapshot) => {
      const documentSnapshot = new DocumentSnapshot(
        this.firestore,
        nativeDocumentSnapshot
      );
      observer.next(documentSnapshot);
    };

    // Listen to snapshot events
    const snapshotSubscription = SharedEventEmitter.addListener(
      getAppEventName(this._firestore, `onDocumentSnapshot:${listenerId}`),
      listener
    );

    let unsubscribe: () => void;

    // listen for snapshot error events
    const errorSubscription = SharedEventEmitter.addListener(
      getAppEventName(this._firestore, `onDocumentSnapshotError:${listenerId}`),
      (e: NativeErrorResponse) => {
        if (unsubscribe) unsubscribe();
        const error = new SnapshotError(e);
        if (observer.error) observer.error(error);
        else this.firestore.log.error(error);
      }
    );

    // Add the native listener
    getNativeModule(this._firestore).documentOnSnapshot(
      this.path,
      listenerId,
      docListenOptions
    );

    // return an unsubscribe method
    unsubscribe = () => {
      snapshotSubscription.remove();
      errorSubscription.remove();
      // cancel native listener
      getNativeModule(this._firestore).documentOffSnapshot(
        this.path,
        listenerId
      );
    };

    return unsubscribe;
  }

  set(data: Object, options?: SetOptions): Promise<void> {
    const nativeData = buildNativeMap(data);
    return getNativeModule(this._firestore).documentSet(
      this.path,
      nativeData,
      options
    );
  }

  update(...args: any[]): Promise<void> {
    const data = parseUpdateArgs(args, 'DocumentReference.update');
    const nativeData = buildNativeMap(data);
    return getNativeModule(this._firestore).documentUpdate(
      this.path,
      nativeData
    );
  }
}
