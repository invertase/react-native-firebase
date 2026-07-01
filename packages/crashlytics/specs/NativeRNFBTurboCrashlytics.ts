import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface CrashlyticsStackFrame {
  src: string;
  line: number;
  col: number;
  fn: string;
  file: string;
}

export interface JavaScriptErrorObject {
  message: string;
  isUnhandledRejection: boolean;
  frames: ReadonlyArray<CrashlyticsStackFrame>;
}

export interface Spec extends TurboModule {
  getConstants(): {
    isCrashlyticsCollectionEnabled: boolean;
    isErrorGenerationOnJSCrashEnabled: boolean;
    isCrashlyticsJavascriptExceptionHandlerChainingEnabled: boolean;
  };

  checkForUnsentReports(): Promise<boolean>;
  crash(): void;
  crashWithStackPromise(jsErrorDict: JavaScriptErrorObject): Promise<void>;
  deleteUnsentReports(): Promise<void>;
  didCrashOnPreviousExecution(): Promise<boolean>;
  log(message: string): void;
  logPromise(message: string): Promise<void>;
  sendUnsentReports(): void;
  setAttribute(key: string, value: string): Promise<void>;
  setAttributes(attributes: { [key: string]: string }): Promise<void>;
  setUserId(userId: string): Promise<void>;
  recordError(jsErrorDict: JavaScriptErrorObject): void;
  recordErrorPromise(jsErrorDict: JavaScriptErrorObject): Promise<void>;
  setCrashlyticsCollectionEnabled(enabled: boolean): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboCrashlytics');
