/* eslint-disable */
declare module 'react-native' {
  // noinspection ES6ConvertVarToLetConst
  declare var exports: any;
}

declare type AuthResultType = {
  authenticated: boolean,
  user: Object|null
};

declare type CredentialType = {
  provider: string,
  token: string,
  secret: string
};

declare type GoogleApiAvailabilityType = {
  status: number,
  isAvailable: boolean,
  isUserResolvableError?: boolean,
  error?: string
};
