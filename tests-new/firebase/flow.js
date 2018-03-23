/* eslint-disable */
// declare module 'react-native' {
//   // noinspection ES6ConvertVarToLetConst
//   declare var exports: any;
// }

declare type AuthResultType = {
  authenticated: boolean,
  user: Object|null
} | null;

declare type CredentialType = {
  providerId: string,
  token: string,
  secret: string
};

declare type DatabaseListener = {
  listenerId: number;
  eventName: string;
  successCallback: Function;
  failureCallback?: Function;
};

declare type DatabaseModifier = {
  type: 'orderBy' | 'limit' | 'filter';
  name?: string;
  key?: string;
  limit?: number;
  value?: any;
  valueType?: string;
};

declare type GoogleApiAvailabilityType = {
  status: number,
  isAvailable: boolean,
  isUserResolvableError?: boolean,
  hasResolution?: boolean,
  error?: string
};

declare class FirebaseError {
  message: string,
  name: string,
  code: string,
  stack: string,
  path: string,
  details: string,
  modifiers: string
};
