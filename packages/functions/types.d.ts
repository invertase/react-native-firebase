declare module '@react-native-firebase/app/lib/common' {
  export const MODULAR_DEPRECATION_ARG: string;
  export const isAndroid: boolean;
  export const isNumber: (value: any) => value is number;
}

declare module '@react-native-firebase/app/lib/internal' {
  export function createModuleNamespace(config: any): any;
  export class FirebaseModule {
    constructor(...args: any[]);
    native: any;
    firebaseJson: any;
  }
  export function getFirebaseRoot(): any;
  export class NativeFirebaseError {
    static getStackWithMessage(message: string, jsStack?: string): string;
  }
}

declare module '@react-native-firebase/app/lib/internal/nativeModule' {
  export function setReactNativeModule(moduleName: string, module: any): void;
}

declare module '@react-native-firebase/app/lib/internal/web/firebaseFunctions' {
  export function getApp(appName: string): any;
  export function getFunctions(app: any, regionOrCustomDomain?: string): any;
  export function httpsCallable(functionsInstance: any, name: string, options?: any): any;
  export function httpsCallableFromURL(functionsInstance: any, url: string, options?: any): any;
  export function connectFunctionsEmulator(
    functionsInstance: any,
    host: string,
    port: number,
  ): void;
}

declare module './version' {
  const version: string;
  export default version;
}

declare module './web/RNFBFunctionsModule' {
  const fallBackModule: any;
  export default fallBackModule;
}
