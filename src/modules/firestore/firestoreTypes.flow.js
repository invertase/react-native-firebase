/*
 * @flow
 */
import type { NativeErrorInterface } from '../../common/commonTypes.flow';

export type MetadataChanges = {|
  includeMetadataChanges: boolean,
|};

export type QueryDirection = 'DESC' | 'desc' | 'ASC' | 'asc';

export type QueryOperator =
  | '<'
  | '<='
  | '='
  | '=='
  | '>'
  | '>='
  | 'array-contains';

export type GetOptions = {
  source: 'default' | 'server' | 'cache',
};

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
  type: 'added' | 'modified' | 'removed',
};

export type NativeDocumentSnapshot = {
  data: { [string]: NativeTypeMap },
  metadata: SnapshotMetadata,
  path: string,
};

export type NativeTypeMap = {
  type:
    | 'nan'
    | 'infinity'
    | 'array'
    | 'boolean'
    | 'date'
    | 'blob'
    | 'documentid'
    | 'fieldvalue'
    | 'timestamp'
    | 'geopoint'
    | 'null'
    | 'number'
    | 'object'
    | 'reference'
    | 'string',
  value: any,
};

export interface SnapshotErrorInterface extends NativeErrorInterface {
  +path: string;
  +appName: string;
}
