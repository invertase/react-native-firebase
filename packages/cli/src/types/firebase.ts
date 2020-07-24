export interface Account {
  user: User;
  tokens: Tokens;
}

export interface User {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  hd: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

export interface Tokens {
  access_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expiry_date: number;
  scopes: string[];
}

export interface Project {
  projectId: string;
  projectNumber: string;
  displayName: string;
  name: string;
  resources: {
    hostingSite: string;
    realtimeDatabaseInstance: string;
    storageBucket: string;
    locationId: string;
  };
}

export interface ProjectDetail extends Project {
  apps: {
    android?: AndroidApp[];
    ios?: IOSApp[];
  };
}

export interface AndroidApp {
  name: string;
  appId: string;
  displayName: string;
  projectId: string;
  packageName: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IOSApp {
  name: string;
  appId: string;
  projectId: string;
  bundleId: string;
}

export type ShaCertificateType = 'SHA_CERTIFICATE_TYPE_UNSPECIFIED' | 'SHA_1' | 'SHA_256';

export interface AndroidSha {
  name: string;
  shaHash: string;
  certType: ShaCertificateType;
}
