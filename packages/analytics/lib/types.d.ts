declare module '@react-native-firebase/app/lib/common' {
  export const MODULAR_DEPRECATION_ARG: string;
  export const isAlphaNumericUnderscore: (value: any) => boolean;
  export const isE164PhoneNumber: (value: any) => boolean;
  export const isIOS: boolean;
  export const isNull: (value: any) => value is null;
  export const isNumber: (value: any) => value is number;
  export const isObject: (value: any) => value is object;
  export const isOneOf: (value: any, validValues: any[]) => boolean;
  export const isString: (value: any) => value is string;
  export const isUndefined: (value: any) => value is undefined;
  export const isBoolean: (value: any) => value is boolean;
}

declare module '@react-native-firebase/app/lib/common/unitTestUtils' {
  export const getFirebaseApp: () => any;
  export const getMockNativeModule: (name: string) => any;
}

declare module '@react-native-firebase/app/lib/common/validate' {
  export const isUndefined: (value: any) => value is undefined;
}

declare module '@react-native-firebase/app/lib/internal' {
  export function createModuleNamespace(config: any): any;
  export class FirebaseModule {
    constructor(...args: any[]);
    native: any;
    app: any;
    firebaseJson: any;
    _customUrlOrRegion: string | null;
  }
  export function getFirebaseRoot(): any;
  export class NativeFirebaseError {
    static getStackWithMessage(message: string, jsStack?: string): string;
  }
}

declare module '@react-native-firebase/app/lib/internal/nativeModule' {
  export function setReactNativeModule(moduleName: string, module: any): void;
}

declare module '@react-native-firebase/app/lib/internal/web/firebaseInstallations' {
  export function getInstallations(app: any): any;
}

declare module '@react-native-firebase/app/lib/internal/asyncStorage' {
  export function setItem(key: string, value: string): Promise<void>;
  export function getItem(key: string): Promise<string | null>;
}

declare module '@react-native-firebase/app/lib/internal/web/firebaseApp' {
  export function getApp(appName?: string): any;
}

declare module '@react-native-firebase/app/lib/internal/web/utils' {
  export function guard(fn: () => any): any;
}

declare module '@react-native-firebase/app/lib' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      analytics: FirebaseModuleWithStaticsAndApp<any, any>;
    }
    interface FirebaseApp {
      analytics(): any;
      readonly name: string;
    }
  }
}

declare module './version' {
  const version: string;
  export default version;
}

declare module './web/RNFBAnalyticsModule' {
  const fallBackModule: any;
  export default fallBackModule;
}
