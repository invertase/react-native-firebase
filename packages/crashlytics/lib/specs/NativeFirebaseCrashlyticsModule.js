// @flow
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +getConstants: () => {|
    isCrashlyticsCollectionEnabled: boolean,
    isErrorGenerationOnJSCrashEnabled: boolean,
    isCrashlyticsJavascriptExceptionHandlerChainingEnabled: boolean,
  |};

  +checkForUnsentReports: () => Promise<boolean>;
  +crashWithStackPromise: (jsErrorMap: Object) => Promise<void>;
  +crash: () => void;
  +deleteUnsentReports: () => void;
  +didCrashOnPreviousExecution: () => Promise<boolean>;
  +log: (message: string) => void;
  +logPromise: (message: string) => Promise<void>;
  +setAttribute: (key: string, value: string) => Promise<void>;
  +setAttributes: (keyValuesMap: Object) => Promise<void>;
  +sendUnsentReports: () => void;
  +setUserId: (userId: string) => Promise<void>;
  +setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
  +recordError: (jsErrorMap: Object) => void;
  +recordErrorPromise: (jsErrorMap: Object) => Promise<void>;
}
  
export default (TurboModuleRegistry.get<Spec>('RNFBCrashlyticsModule'): ?Spec);
