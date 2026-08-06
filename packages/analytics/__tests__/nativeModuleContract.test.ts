import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'logEvent',
  'setAnalyticsCollectionEnabled',
  'setSessionTimeoutDuration',
  'getAppInstanceId',
  'getSessionId',
  'setUserId',
  'setUserProperty',
  'setUserProperties',
  'resetAnalyticsData',
  'setDefaultEventParameters',
  'setConsent',
  'logTransaction',
  'initiateOnDeviceConversionMeasurementWithEmailAddress',
  'initiateOnDeviceConversionMeasurementWithHashedEmailAddress',
  'initiateOnDeviceConversionMeasurementWithPhoneNumber',
  'initiateOnDeviceConversionMeasurementWithHashedPhoneNumber',
] as const;

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract(
      {
        namespace: 'analytics',
        nativeModuleName: 'NativeRNFBTurboAnalytics',
        nativeEvents: false,
        hasMultiAppSupport: false,
        hasCustomUrlOrRegionSupport: false,
        turboModule: true,
        specMethods: SPEC_METHODS,
        createMock: method =>
          jest.fn(() =>
            method.startsWith('get')
              ? Promise.resolve(method === 'getSessionId' ? 1 : 'id')
              : undefined,
          ),
      },
      {
        logEvent: wrapped => {
          void wrapped.logEvent('test_event', { foo: 'bar' });
        },
        setAnalyticsCollectionEnabled: wrapped => {
          void wrapped.setAnalyticsCollectionEnabled(true);
        },
        setSessionTimeoutDuration: wrapped => {
          void wrapped.setSessionTimeoutDuration(1800000);
        },
        setUserId: wrapped => {
          void wrapped.setUserId('user-1');
        },
        setUserProperty: wrapped => {
          void wrapped.setUserProperty('role', 'admin');
        },
        setUserProperties: wrapped => {
          void wrapped.setUserProperties({ role: 'admin' });
        },
        setDefaultEventParameters: wrapped => {
          void wrapped.setDefaultEventParameters({ campaign: 'spring' });
        },
        setConsent: wrapped => {
          void wrapped.setConsent({ analytics_storage: true });
        },
        logTransaction: wrapped => {
          void wrapped.logTransaction('txn-1');
        },
        initiateOnDeviceConversionMeasurementWithEmailAddress: wrapped => {
          void wrapped.initiateOnDeviceConversionMeasurementWithEmailAddress('value');
        },
        initiateOnDeviceConversionMeasurementWithHashedEmailAddress: wrapped => {
          void wrapped.initiateOnDeviceConversionMeasurementWithHashedEmailAddress('value');
        },
        initiateOnDeviceConversionMeasurementWithPhoneNumber: wrapped => {
          void wrapped.initiateOnDeviceConversionMeasurementWithPhoneNumber('value');
        },
        initiateOnDeviceConversionMeasurementWithHashedPhoneNumber: wrapped => {
          void wrapped.initiateOnDeviceConversionMeasurementWithHashedPhoneNumber('value');
        },
      },
    );
  });
});
