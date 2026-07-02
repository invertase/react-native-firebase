import { describe, it, jest } from '@jest/globals';
import { assertTurboContract } from '../../app/__tests__/turboModuleContractHelper';

const SPEC_METHODS = [
  'checkForUnsentReports',
  'crash',
  'crashWithStackPromise',
  'deleteUnsentReports',
  'didCrashOnPreviousExecution',
  'log',
  'logPromise',
  'sendUnsentReports',
  'setAttribute',
  'setAttributes',
  'setUserId',
  'recordError',
  'recordErrorPromise',
  'setCrashlyticsCollectionEnabled',
] as const;

const ERROR_FIXTURE = {
  message: 'test',
  isUnhandledRejection: false,
  frames: [{ src: '<unknown>', line: 0, col: 0, fn: '<unknown>', file: 'test:0:0' }],
};

describe('TurboModule wrapper contract (NewArch-AD-17.1)', function () {
  it('exposes every spec method callable through the real wrapper', function () {
    assertTurboContract(
      {
        namespace: 'crashlytics',
        nativeModuleName: 'NativeRNFBTurboCrashlytics',
        nativeEvents: false,
        hasMultiAppSupport: false,
        hasCustomUrlOrRegionSupport: false,
        turboModule: true,
        specMethods: SPEC_METHODS,
        createMock: method =>
          jest.fn(() =>
            method.startsWith('check') || method.startsWith('did')
              ? Promise.resolve(false)
              : Promise.resolve(),
          ),
        customizeRaw: raw => {
          Object.defineProperty(raw, 'getConstants', {
            value: jest.fn(() => ({
              isCrashlyticsCollectionEnabled: false,
              isErrorGenerationOnJSCrashEnabled: false,
              isCrashlyticsJavascriptExceptionHandlerChainingEnabled: false,
            })),
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'isCrashlyticsCollectionEnabled', {
            value: false,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'isErrorGenerationOnJSCrashEnabled', {
            value: false,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(raw, 'isCrashlyticsJavascriptExceptionHandlerChainingEnabled', {
            value: false,
            enumerable: true,
            configurable: true,
          });
        },
      },
      {
        setAttribute: wrapped => {
          void wrapped.setAttribute('key', 'value');
        },
        setAttributes: wrapped => {
          void wrapped.setAttributes({ key: 'value' });
        },
        setUserId: wrapped => {
          void wrapped.setUserId('user');
        },
        setCrashlyticsCollectionEnabled: wrapped => {
          void wrapped.setCrashlyticsCollectionEnabled(true);
        },
        log: wrapped => {
          wrapped.log('message');
        },
        logPromise: wrapped => {
          wrapped.logPromise('message');
        },
        recordError: wrapped => {
          wrapped.recordError(ERROR_FIXTURE);
        },
        recordErrorPromise: wrapped => {
          void wrapped.recordErrorPromise(ERROR_FIXTURE);
        },
        crashWithStackPromise: wrapped => {
          void wrapped.crashWithStackPromise(ERROR_FIXTURE);
        },
        crash: wrapped => {
          wrapped.crash();
        },
        sendUnsentReports: wrapped => {
          wrapped.sendUnsentReports();
        },
      },
    );
  });
});
