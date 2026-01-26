import {
  getApp,
  getFunctions,
  httpsCallable,
  httpsCallableFromURL,
  connectFunctionsEmulator,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFunctions';
import { emitEvent } from '@react-native-firebase/app/dist/module/internal/web/utils';
import type { HttpsCallableOptions } from '../index';
import type { NativeError } from '../HttpsError';
import type { FunctionsWebInternal } from '../types/internal';

interface WrapperData {
  data: unknown;
}

/**
 * Helper function to handle streaming callable execution.
 * @param callable - The callable instance to stream from
 * @param appName - The app name for event emission
 * @param callableData - The data to pass to the callable
 * @param listenerId - The listener ID for this stream
 */
async function executeCallableStream(
  callable: any,
  appName: string,
  callableData: unknown,
  listenerId: number,
): Promise<void> {
  try {
    const callableStream = callableData ? callable.stream(callableData) : callable.stream();
    const { stream } = await callableStream;

    for await (const chunk of stream) {
      emitEvent('functions_streaming_event', {
        appName,
        listenerId,
        body: {
          data: chunk,
          error: null,
          done: false,
        },
      });
    }

    // Emit final result with done: true
    emitEvent('functions_streaming_event', {
      appName,
      listenerId,
      body: {
        data: null,
        error: null,
        done: true,
      },
    });
  } catch (error: any) {
    const { code, message, details } = error;
    emitEvent('functions_streaming_event', {
      appName,
      listenerId,
      body: {
        data: null,
        error: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message: message,
          details: details,
        },
        done: true,
      },
    });
  }
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  /**
   * Get and execute a Firebase Functions callable.
   * @param appName - The name of the app to get the functions instance for.
   * @param regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param host - The host to use for the functions emulator.
   * @param port - The port to use for the functions emulator.
   * @param name - The name of the functions callable.
   * @param wrapper - The wrapper object to use for the functions callable.
   * @param options - The options to use for the functions callable.
   * @returns The result of the functions callable.
   */
  async httpsCallable(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    name: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
  ): Promise<any> {
    try {
      const app = getApp(appName);
      let functionsInstance: FunctionsWebInternal;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
          functionsInstance.region = 'us-central1';
        } else {
          functionsInstance.region = regionOrCustomDomain;
          functionsInstance.customDomain = null;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      let callable;
      if (Object.keys(options).length) {
        callable = httpsCallable(functionsInstance, name, options);
      } else {
        callable = httpsCallable(functionsInstance, name);
      }
      // if data is undefined use null,
      const data = wrapper['data'] ?? null;
      const result = await callable(data);
      return result;
    } catch (error: any) {
      const { code, message, details } = error;
      const nativeError: NativeError = {
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },

  /**
   * Get and execute a Firebase Functions callable from a URL.
   * @param appName - The name of the app to get the functions instance for.
   * @param regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param host - The host to use for the functions emulator.
   * @param port - The port to use for the functions emulator.
   * @param url - The URL to use for the functions callable.
   * @param wrapper - The wrapper object to use for the functions callable.
   * @param options - The options to use for the functions callable.
   * @returns The result of the functions callable.
   */
  async httpsCallableFromUrl(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    url: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
  ): Promise<any> {
    try {
      const app = getApp(appName);
      let functionsInstance: FunctionsWebInternal;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
        } else {
          functionsInstance.region = regionOrCustomDomain;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      const callable = httpsCallableFromURL(functionsInstance, url, options);
      const result = await callable(wrapper['data']);
      return result;
    } catch (error: any) {
      const { code, message, details } = error;
      const nativeError: NativeError = {
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },

  /**
   * Stream a Firebase Functions callable.
   * @param appName - The name of the app to get the functions instance for.
   * @param regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param host - The host to use for the functions emulator.
   * @param port - The port to use for the functions emulator.
   * @param name - The name of the functions callable.
   * @param wrapper - The wrapper object to use for the functions callable.
   * @param options - The options to use for the functions callable.
   * @param listenerId - The listener ID for this stream.
   */
  async httpsCallableStream(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    name: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
    listenerId: number,
  ): Promise<void> {
    const app = getApp(appName);
    let functionsInstance: FunctionsWebInternal;
    if (regionOrCustomDomain) {
      functionsInstance = getFunctions(app, regionOrCustomDomain);
      // Hack to work around custom domain and region not being set on the instance.
      if (regionOrCustomDomain.startsWith('http')) {
        functionsInstance.customDomain = regionOrCustomDomain;
        functionsInstance.region = 'us-central1';
      } else {
        functionsInstance.region = regionOrCustomDomain;
        functionsInstance.customDomain = null;
      }
    } else {
      functionsInstance = getFunctions(app);
      functionsInstance.region = 'us-central1';
      functionsInstance.customDomain = null;
    }
    if (host) {
      connectFunctionsEmulator(functionsInstance, host, port);
      // Hack to work around emulator origin not being set on the instance.
      functionsInstance.emulatorOrigin = `http://${host}:${port}`;
    }

    let callable;
    if (Object.keys(options).length) {
      callable = httpsCallable(functionsInstance, name, options);
    } else {
      callable = httpsCallable(functionsInstance, name);
    }

    await executeCallableStream(callable, appName, wrapper.data, listenerId);
  },

  /**
   * Stream a Firebase Functions callable from a URL.
   * @param appName - The name of the app to get the functions instance for.
   * @param regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param host - The host to use for the functions emulator.
   * @param port - The port to use for the functions emulator.
   * @param url - The URL to use for the functions callable.
   * @param wrapper - The wrapper object to use for the functions callable.
   * @param options - The options to use for the functions callable.
   * @param listenerId - The listener ID for this stream.
   */
  async httpsCallableStreamFromUrl(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    url: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
    listenerId: number,
  ): Promise<void> {
    const app = getApp(appName);
    let functionsInstance: FunctionsWebInternal;
    if (regionOrCustomDomain) {
      functionsInstance = getFunctions(app, regionOrCustomDomain);
      // Hack to work around custom domain and region not being set on the instance.
      if (regionOrCustomDomain.startsWith('http')) {
        functionsInstance.customDomain = regionOrCustomDomain;
        functionsInstance.region = 'us-central1';
      } else {
        functionsInstance.region = regionOrCustomDomain;
        functionsInstance.customDomain = null;
      }
    } else {
      functionsInstance = getFunctions(app);
      functionsInstance.region = 'us-central1';
      functionsInstance.customDomain = null;
    }
    if (host) {
      connectFunctionsEmulator(functionsInstance, host, port);
      // Hack to work around emulator origin not being set on the instance.
      functionsInstance.emulatorOrigin = `http://${host}:${port}`;
    }

    const callable = httpsCallableFromURL(functionsInstance, url, options);
    await executeCallableStream(callable, appName, wrapper.data, listenerId);
  },

  /**
   * Removes a streaming listener.
   * Note: With the async/await stream implementation, cancellation is not currently supported.
   * This method is kept for API compatibility.
   * @param listenerId - The listener ID to remove.
   */
  removeFunctionsStreaming(listenerId: number): void {},
};
