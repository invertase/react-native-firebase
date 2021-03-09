import { FirebaseModule } from "./internal";

export type DeleteAppType = () => Promise<never | void>;

export interface FirebaseAppTypes {
  readonly name: string;
  readonly options: FirebaseOptions;
  readonly automaticDataCollectionEnabled: boolean;

  extendApp(extendedProps: any): void;
  delete(): Promise<void>;
  toString(): string;
}

export interface FirebaseOptions {
  apiKey: string;
  appId: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface FirebaseConfig {
  name: string | undefined;
  automaticResourceManagement: boolean | undefined;
  automaticDataCollectionEnabled: boolean | undefined;
}

export interface FirebaseAppMyVersion {
  SDK_VERSION: string;
  apps: FirebaseAppMyVersion[];
  utils: any;
  app(name?: string): Promise<FirebaseAppMyVersion>;
  initializeApp(
    options: FirebaseOptions,
    configOrName: FirebaseConfig | string,
  ): Promise<FirebaseAppMyVersion>;
}

export type NamespaceTypes = 'admob' |'auth' | 'analytics' | 'remoteConfig' | 'crashlytics' | 'database' | 'inAppMessaging' | 'firestore' | 'functions' | 'iid' | 'indexing' | 'storage' | 'dynamicLinks' | 'messaging' | 'naturalLanguage' | 'ml' | 'notifications' | 'perf' | 'utils';

export interface FirebaseModuleNamespace {
  statics:any; //this prop will have to be removed & extended for each namespace as each package has its own statics type
  version: string;
  namespace: NamespaceTypes;
  nativeModuleName:any; //this prop will have to be removed & extended for each namespace as each package has its own statics type
  nativeEvents: any;//this prop will have to be removed & extended for each namespace as each package has its own statics type
  hasMultiAppSupport: boolean;
  hasCustomUrlOrRegionSupport: boolean;
  ModuleClass: FirebaseModule;
}

  /**
   * A class that all React Native Firebase modules extend from to provide default behaviour.
   */
   export interface FirebaseModuleTypes {
     /**
   * The native module instance for this Firebase service.
   */
    readonly native: any;

    /**
     * Returns the shared event emitter instance used for all JS event routing.
     */
    readonly emitter: any;
    /**
     * The current `FirebaseApp` instance for this Firebase service.
     */
    app: FirebaseApp;
  }

export interface FirebaseApp {
  /**
   * The name (identifier) for this App. '[DEFAULT]' is the default App.
   */
  readonly name: string;

  /**
   * The (read-only) configuration options from the app initialization.
   */
  readonly options: FirebaseOptions;

  /**
   * Make this app unusable and free up resources.
   */
  delete(): Promise<void>;

  utils(): any;
}
