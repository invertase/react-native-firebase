/*
 * @flow
 */

export type DocumentListenOptions = {
  includeMetadataChanges: boolean,
};

export type QueryDirection = 'DESC' | 'desc' | 'ASC' | 'asc';

export type QueryListenOptions = {|
  includeDocumentMetadataChanges: boolean,
  includeQueryMetadataChanges: boolean,
|};

export type QueryOperator = '<' | '<=' | '=' | '==' | '>' | '>=';

export type SetOptions = {
  merge?: boolean,
};

export type SnapshotMetadata = {
  fromCache: boolean,
  hasPendingWrites: boolean,
};

export type NativeDocumentChange = {
  document: NativeDocumentSnapshot,
  newIndex: number,
  oldIndex: number,
  type: string,
};

export type NativeDocumentSnapshot = {
  data: { [string]: NativeTypeMap },
  metadata: SnapshotMetadata,
  path: string,
};

export type NativeTypeMap = {
  type:
    | 'array'
    | 'boolean'
    | 'date'
    | 'documentid'
    | 'fieldvalue'
    | 'geopoint'
    | 'null'
    | 'number'
    | 'object'
    | 'reference'
    | 'string',
  value: any,
};
