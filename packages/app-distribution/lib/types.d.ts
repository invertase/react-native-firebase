/*
 * Type declarations for modules from @react-native-firebase/app
 * These are JavaScript modules that don't have type definitions
 */

declare module '@react-native-firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: any;
  }
  export namespace ReactNativeFirebase {
    export interface FirebaseApp {
      name: string;
      options: any;
    }
  }
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module '@react-native-firebase/app/lib/common' {
  export const isIOS: boolean;
  export const isAndroid: boolean;
  export const MODULAR_DEPRECATION_ARG: any;
}

declare module '@react-native-firebase/app/lib/internal' {
  export function createModuleNamespace(options: {
    statics: any;
    version: string;
    namespace: string;
    nativeModuleName: string;
    nativeEvents?: boolean | string[];
    hasMultiAppSupport?: boolean;
    hasCustomUrlOrRegionSupport?: boolean;
    ModuleClass: any;
  }): any;
  export class FirebaseModule {
    app: any;
    native: any;
    emitter: any;
    constructor(app: any, config: any, customUrlOrRegion?: any);
  }
  export function getFirebaseRoot(): any;
}
