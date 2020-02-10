/**
 * 
 * CollectionReference representation wrapper
 */
import Query from './Query';
import DocumentReference from './DocumentReference';
import { firestoreAutoId } from '../../utils';

/**
 * @class CollectionReference
 */
export default class CollectionReference {
  constructor(firestore, collectionPath) {
    this._collectionPath = collectionPath;
    this._firestore = firestore;
    this._query = new Query(firestore, collectionPath);
  }

  get firestore() {
    return this._firestore;
  }

  get id() {
    return this._collectionPath.id;
  }

  get parent() {
    const parentPath = this._collectionPath.parent();

    return parentPath ? new DocumentReference(this._firestore, parentPath) : null;
  }

  get path() {
    return this._collectionPath.relativeName;
  }

  isEqual(otherCollectionReference) {
    if (!(otherCollectionReference instanceof CollectionReference)) {
      throw new Error('firebase.firestore.CollectionReference.isEqual(*) expects an instance of CollectionReference.');
    } // check paths match


    if (this.path !== otherCollectionReference.path) return false; // check same firestore app name

    if (this._firestore.app.name !== otherCollectionReference._firestore.app.name) {
      return false;
    } // check same firestore app projectId
    // noinspection RedundantIfStatementJS


    if (this._firestore.app.options.projectId !== otherCollectionReference._firestore.app.options.projectId) {
      return false;
    }

    return true;
  }

  add(data) {
    const documentRef = this.doc();
    return documentRef.set(data).then(() => Promise.resolve(documentRef));
  }

  doc(documentPath) {
    const newPath = documentPath || firestoreAutoId();

    const path = this._collectionPath.child(newPath);

    if (!path.isDocument) {
      throw new Error('Argument "documentPath" must point to a document.');
    }

    return new DocumentReference(this._firestore, path);
  } // From Query


  endAt(...snapshotOrVarArgs) {
    return this._query.endAt(snapshotOrVarArgs);
  }

  endBefore(...snapshotOrVarArgs) {
    return this._query.endBefore(snapshotOrVarArgs);
  }

  get(options) {
    return this._query.get(options);
  }

  limit(limit) {
    return this._query.limit(limit);
  }

  onSnapshot(optionsOrObserverOrOnNext, observerOrOnNextOrOnError, onError) {
    return this._query.onSnapshot(optionsOrObserverOrOnNext, observerOrOnNextOrOnError, onError);
  }

  orderBy(fieldPath, directionStr) {
    return this._query.orderBy(fieldPath, directionStr);
  }

  startAfter(...snapshotOrVarArgs) {
    return this._query.startAfter(snapshotOrVarArgs);
  }

  startAt(...snapshotOrVarArgs) {
    return this._query.startAt(snapshotOrVarArgs);
  }

  where(fieldPath, opStr, value) {
    return this._query.where(fieldPath, opStr, value);
  }

}