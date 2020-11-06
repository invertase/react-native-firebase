/**
 * 
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

/**
 * @class DocumentReference
 */
export default class DocumentReference {
  constructor(firestore, documentPath) {
    this._documentPath = documentPath;
    this._firestore = firestore;
  }

  get firestore() {
    return this._firestore;
  }

  get id() {
    return this._documentPath.id;
  }

  get parent() {
    const parentPath = this._documentPath.parent(); // $FlowExpectedError: parentPath can never be null


    return new CollectionReference(this._firestore, parentPath);
  }

  get path() {
    return this._documentPath.relativeName;
  }

  isEqual(otherDocumentReference) {
    if (!(otherDocumentReference instanceof DocumentReference)) {
      throw new Error('firebase.firestore.DocumentReference.isEqual(*) expects an instance of DocumentReference.');
    } // check paths match


    if (this.path !== otherDocumentReference.path) return false; // check same firestore app name

    if (this._firestore.app.name !== otherDocumentReference._firestore.app.name) {
      return false;
    } // check same firestore app projectId
    // noinspection RedundantIfStatementJS


    if (this._firestore.app.options.projectId !== otherDocumentReference._firestore.app.options.projectId) {
      return false;
    }

    return true;
  }

  collection(collectionPath) {
    const path = this._documentPath.child(collectionPath);

    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this._firestore, path);
  }

  delete() {
    return getNativeModule(this._firestore).documentDelete(this.path);
  }

  get(options) {
    if (options) {
      if (!isObject(options)) {
        return Promise.reject(new Error('DocumentReference.get failed: First argument must be an object.'));
      }

      if (options.source && options.source !== 'default' && options.source !== 'server' && options.source !== 'cache') {
        return Promise.reject(new Error('DocumentReference.get failed: GetOptions.source must be one of `default`, `server` or `cache`.'));
      }
    }

    return getNativeModule(this._firestore).documentGet(this.path, options).then(result => new DocumentSnapshot(this._firestore, result));
  }

  onSnapshot(optionsOrObserverOrOnNext, observerOrOnNextOrOnError, onError) {
    let observer;
    let docListenOptions = {}; // Called with: onNext, ?onError

    if (isFunction(optionsOrObserverOrOnNext)) {
      if (observerOrOnNextOrOnError && !isFunction(observerOrOnNextOrOnError)) {
        throw new Error('DocumentReference.onSnapshot failed: Second argument must be a valid function.');
      } // $FlowExpectedError: Not coping with the overloaded method signature


      observer = {
        next: optionsOrObserverOrOnNext,
        error: observerOrOnNextOrOnError
      };
    } else if (optionsOrObserverOrOnNext && isObject(optionsOrObserverOrOnNext)) {
      // Called with: Observer
      if (optionsOrObserverOrOnNext.next) {
        if (isFunction(optionsOrObserverOrOnNext.next)) {
          if (optionsOrObserverOrOnNext.error && !isFunction(optionsOrObserverOrOnNext.error)) {
            throw new Error('DocumentReference.onSnapshot failed: Observer.error must be a valid function.');
          } // $FlowExpectedError: Not coping with the overloaded method signature


          observer = {
            next: optionsOrObserverOrOnNext.next,
            error: optionsOrObserverOrOnNext.error
          };
        } else {
          throw new Error('DocumentReference.onSnapshot failed: Observer.next must be a valid function.');
        }
      } else if (Object.prototype.hasOwnProperty.call(optionsOrObserverOrOnNext, 'includeMetadataChanges')) {
        docListenOptions = optionsOrObserverOrOnNext; // Called with: Options, onNext, ?onError

        if (isFunction(observerOrOnNextOrOnError)) {
          if (onError && !isFunction(onError)) {
            throw new Error('DocumentReference.onSnapshot failed: Third argument must be a valid function.');
          } // $FlowExpectedError: Not coping with the overloaded method signature


          observer = {
            next: observerOrOnNextOrOnError,
            error: onError
          }; // Called with Options, Observer
        } else if (observerOrOnNextOrOnError && isObject(observerOrOnNextOrOnError) && observerOrOnNextOrOnError.next) {
          if (isFunction(observerOrOnNextOrOnError.next)) {
            if (observerOrOnNextOrOnError.error && !isFunction(observerOrOnNextOrOnError.error)) {
              throw new Error('DocumentReference.onSnapshot failed: Observer.error must be a valid function.');
            }

            observer = {
              next: observerOrOnNextOrOnError.next,
              error: observerOrOnNextOrOnError.error
            };
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

    const listener = nativeDocumentSnapshot => {
      const documentSnapshot = new DocumentSnapshot(this.firestore, nativeDocumentSnapshot);
      observer.next(documentSnapshot);
    }; // Listen to snapshot events


    const snapshotSubscription = SharedEventEmitter.addListener(getAppEventName(this._firestore, `onDocumentSnapshot:${listenerId}`), listener);
    let unsubscribe; // listen for snapshot error events

    const errorSubscription = SharedEventEmitter.addListener(getAppEventName(this._firestore, `onDocumentSnapshotError:${listenerId}`), e => {
      if (unsubscribe) unsubscribe();
      const error = new SnapshotError(e);
      if (observer.error) observer.error(error);else this.firestore.log.error(error);
    }); // Add the native listener

    getNativeModule(this._firestore).documentOnSnapshot(this.path, listenerId, docListenOptions); // return an unsubscribe method

    unsubscribe = () => {
      snapshotSubscription.remove();
      errorSubscription.remove(); // cancel native listener

      getNativeModule(this._firestore).documentOffSnapshot(this.path, listenerId);
    };

    return unsubscribe;
  }

  set(data, options) {
    const nativeData = buildNativeMap(data);
    return getNativeModule(this._firestore).documentSet(this.path, nativeData, options);
  }

  update(...args) {
    const data = parseUpdateArgs(args, 'DocumentReference.update');
    const nativeData = buildNativeMap(data);
    return getNativeModule(this._firestore).documentUpdate(this.path, nativeData);
  }

}