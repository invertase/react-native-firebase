import * as web from 'firebase/app';

export interface FirebaseApp extends web.FirebaseApp {
  readonly options: FirebaseOptions;
}

export interface FirebaseOptions extends web.FirebaseOptions {
  readonly androidClientId?: string;
  readonly clientId?: string;
  readonly deepLinkURLScheme?: string;
}

export interface FirebaseAppConfig extends web.FirebaseAppConfig {
  automaticResourceManagement?: boolean;
}
