/**
 * @flow
 * DocumentSnapshot representation wrapper
 */
import DocumentReference from './DocumentReference';
import GeoPoint from './GeoPoint';
import Path from './Path';

export type SnapshotMetadata = {
  fromCache: boolean,
  hasPendingWrites: boolean,
}

export type DocumentSnapshotNativeData = {
  data: Object,
  metadata: SnapshotMetadata,
  path: string,
}

type TypeMap = {
  type: 'array' | 'boolean' | 'geopoint' | 'null' | 'number' | 'object' | 'reference' | 'string',
  value: any,
}

/**
 * @class DocumentSnapshot
 */
export default class DocumentSnapshot {
  _data: Object;
  _firestore: Object;
  _metadata: SnapshotMetadata;
  _ref: DocumentReference;

  constructor(firestore: Object, nativeData: DocumentSnapshotNativeData) {
    this._data = this._parseNativeMap(nativeData.data);
    this._firestore = firestore;
    this._metadata = nativeData.metadata;
    this._ref = new DocumentReference(firestore, Path.fromName(nativeData.path));
  }

  get exists(): boolean {
    return this._data !== undefined;
  }

  get id(): string | null {
    return this._ref.id;
  }

  get metadata(): SnapshotMetadata {
    return _metadata;
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  data(): Object {
    return this._data;
  }

  get(fieldPath: string): any {
    return this._data[fieldPath];
  }

  /**
   * INTERNALS
   */

  _parseNativeMap(nativeData: Object): Object {
    const data = {};
    if (nativeData) {
      Object.keys(nativeData).forEach((key) => {
        data[key] = this._parseTypeMap(nativeData[key]);
      });
    }
    return data;
  }

  _parseNativeArray(nativeArray: Object[]): any[] {
    const array = [];
    if (nativeArray) {
      nativeArray.forEach((typeMap) => {
        array.push(this._parseTypeMap(typeMap));
      });
    }
    return array;
  }

  _parseTypeMap(typeMap: TypeMap): any {
    const { type, value } = typeMap;
    if (type === 'boolean' || type === 'number' || type === 'string' || type === 'null') {
      return value;
    } else if (type === 'array') {
      return this._parseNativeArray(value);
    } else if (type === 'object') {
      return this._parseNativeMap(value);
    } else if (type === 'reference') {
      return new DocumentReference(this._firestore, Path.fromName(value));
    } else if (type === 'geopoint') {
      return new GeoPoint(value.latitude, value.longitude);
    } else if (type === 'date') {
      return new Date(value);
    }
    console.warn(`Unknown data type received ${type}`);
    return value;
  }
}
