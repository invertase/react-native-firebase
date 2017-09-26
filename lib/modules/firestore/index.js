/**
 * @flow
 * Firestore representation wrapper
 */
import { NativeModules } from 'react-native';

import ModuleBase from './../../utils/ModuleBase';
import CollectionReference from './CollectionReference';
import DocumentReference from './DocumentReference';
import DocumentSnapshot from './DocumentSnapshot';
import GeoPoint from './GeoPoint';
import Path from './Path';
import WriteBatch from './WriteBatch';

const unquotedIdentifier_ = '(?:[A-Za-z_][A-Za-z_0-9]*)';
const UNQUOTED_IDENTIFIER_REGEX = new RegExp(`^${unquotedIdentifier_}$`);

/**
 * @class Firestore
 */
export default class Firestore extends ModuleBase {
  static _NAMESPACE = 'firestore';
  static _NATIVE_MODULE = 'RNFirebaseFirestore';

  _referencePath: Path;

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);
    this._referencePath = new Path([]);
  }

  batch(): WriteBatch {
    return new WriteBatch(this);
  }

  /**
   *
   * @param collectionPath
   * @returns {CollectionReference}
   */
  collection(collectionPath: string): CollectionReference {
    const path = this._referencePath.child(collectionPath);
    if (!path.isCollection) {
      throw new Error('Argument "collectionPath" must point to a collection.');
    }

    return new CollectionReference(this, path);
  }

  /**
   *
   * @param documentPath
   * @returns {DocumentReference}
   */
  doc(documentPath: string): DocumentReference {
    const path = this._referencePath.child(documentPath);
    if (!path.isDocument) {
      throw new Error('Argument "documentPath" must point to a document.');
    }

    return new DocumentReference(this, path);
  }

  getAll(varArgs: DocumentReference[]): Promise<DocumentSnapshot[]> {
    varArgs = Array.isArray(arguments[0]) ? arguments[0] : [].slice.call(arguments);

    const documents = [];
    varArgs.forEach((document) => {
      // TODO: Validation
      // validate.isDocumentReference(i, varArgs[i]);
      documents.push(document._documentPath._parts);
    });
    return this._native
      .documentGetAll(documents)
      .then(results => results.map(result => new DocumentSnapshot(this, result)));
  }

  getCollections(): Promise<CollectionReference[]> {
    const rootDocument = new DocumentReference(this, this._referencePath);
    return rootDocument.getCollections();
  }

  runTransaction(updateFunction, transactionOptions?: Object): Promise {

  }

  static geoPoint(latitude, longitude): GeoPoint {
    return new GeoPoint(latitude, longitude);
  }

  static fieldPath(varArgs: string[]): string {
    varArgs = Array.isArray(arguments[0]) ? arguments[0] : [].slice.call(arguments);

    let fieldPath = '';

    for (let i = 0; i < varArgs.length; ++i) {
      let component = varArgs[i];
      // TODO: Validation
      // validate.isString(i, component);
      if (!UNQUOTED_IDENTIFIER_REGEX.test(component)) {
        component = `\`${component.replace(/[`\\]/g, '\\$&')} \``;
      }
      fieldPath += i !== 0 ? `.${component}` : component;
    }

    return fieldPath;
  }
}

export const statics = {
  FieldValue: {
    delete: () => NativeModules.RNFirebaseFirestore && NativeModules.RNFirebaseFirestore.deleteFieldValue || {},
    serverTimestamp: () => NativeModules.RNFirebaseFirestore && NativeModules.RNFirebaseFirestore.serverTimestampFieldValue || {}
  },
};
