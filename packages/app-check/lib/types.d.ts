declare module '@react-native-firebase/app/lib/common' {
  export const MODULAR_DEPRECATION_ARG: string;
  export const isBoolean: (value: any) => value is boolean;
  export const isIOS: boolean;
  export const isString: (value: any) => value is string;
  export const isObject: (value: any) => value is object;
  export const isFunction: (value: any) => boolean;
  export const isUndefined: (value: any) => value is undefined;
  export const isOther: boolean;
  export const parseListenerOrObserver: (listener: any) => (value: any) => void;
}

declare module '@react-native-firebase/app/lib/internal' {
  export function createModuleNamespace(config: any): any;
  export class FirebaseModule {
    constructor(...args: any[]);
    native: any;
    app: any;
    emitter: any;
    firebaseJson: any;
    eventNameForApp(eventName: string): string;
    _customUrlOrRegion: string | null;
  }
  export function getFirebaseRoot(): any;
}

declare module '@react-native-firebase/app/lib/internal/nativeModule' {
  export function setReactNativeModule(moduleName: string, module: any): void;
}

declare module '@react-native-firebase/app/lib/internal/web/firebaseAppCheck' {
  export function getApp(appName?: string): any;
  export function initializeAppCheck(app: any, options: any): any;
  export function getToken(appCheck: any, forceRefresh?: boolean): Promise<any>;
  export function getLimitedUseToken(appCheck: any): Promise<any>;
  export function setTokenAutoRefreshEnabled(appCheck: any, enabled: boolean): void;
  export class CustomProvider {
    constructor(options: any);
    getToken(): Promise<any>;
  }
  export function onTokenChanged(appCheck: any, callback: (tokenResult: any) => void): () => void;
  export function makeIDBAvailable(): void;
}

declare module '@react-native-firebase/app/lib/internal/web/utils' {
  export function guard<T>(fn: () => T): T;
  export function emitEvent(eventName: string, event: any): void;
}

declare module './version' {
  export const version: string;
}

declare module './web/RNFBAppCheckModule' {
  const fallBackModule: any;
  export default fallBackModule;
}
