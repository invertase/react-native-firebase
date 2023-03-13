// @flow
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +logEvent: (name: string, params: Object) => Promise<void>;
  +setAnalyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
  +setSessionTimeoutDuration: (duration: number) => Promise<void>;
  +getAppInstanceId: () => Promise<string>;
  +setUserId: (id: string) => Promise<void>;
  +setUserProperty: (name: string, value: string) => Promise<void>;
  +setUserProperties: (properties: Object) => Promise<void>;
  +resetAnalyticsData: () => Promise<void>;
  +setDefaultEventParameters: (params: Object) => Promise<void>;
  +initiateOnDeviceConversionMeasurementWithEmailAddress: (emailAddress: string) => Promise<void>;
}
  
export default (TurboModuleRegistry.get<Spec>('RNFBAnalyticsModule'): ?Spec);
