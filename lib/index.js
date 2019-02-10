/**
 * @flow
 */
import firebase from './modules/core/firebase';

export default firebase;

/*
 * Export App types
 */
export type { default as App } from './modules/core/app';

/*
 * Export Auth types
 */
export type {
  ActionCodeInfo,
  ActionCodeSettings,
  AdditionalUserInfo,
  AuthCredential,
  UserCredential,
  UserInfo,
  UserMetadata,
} from './modules/auth/types';
export type {
  default as ConfirmationResult,
} from './modules/auth/phone/ConfirmationResult';
export type { default as User } from './modules/auth/User';

/*
 * Export Database types
 */
export type { default as DataSnapshot } from './modules/database/DataSnapshot';
export type { default as OnDisconnect } from './modules/database/OnDisconnect';
export type { default as Reference } from './modules/database/Reference';
export type { default as DataQuery } from './modules/database/Query';

/*
 * Export Firestore types
 */
export type {
  MetadataChanges,
  SetOptions,
  SnapshotMetadata,
} from './modules/firestore/types';
export type {
  default as CollectionReference,
} from './modules/firestore/CollectionReference';
export type {
  default as DocumentChange,
} from './modules/firestore/DocumentChange';
export type {
  default as DocumentReference,
} from './modules/firestore/DocumentReference';
export type {
  default as DocumentSnapshot,
} from './modules/firestore/DocumentSnapshot';
export type { default as FieldPath } from './modules/firestore/FieldPath';
export type { default as FieldValue } from './modules/firestore/FieldValue';
export type { default as GeoPoint } from './modules/firestore/GeoPoint';
export type { default as Query } from './modules/firestore/Query';
export type {
  default as QuerySnapshot,
} from './modules/firestore/QuerySnapshot';
export type { default as WriteBatch } from './modules/firestore/WriteBatch';

/*
 * Export Messaging types
 */
export type {
  default as RemoteMessage,
} from './modules/messaging/RemoteMessage';

/*
 * Export Notifications types
 */
export type {
  default as Notification,
  NotificationOpen,
} from './modules/notifications/Notification';
