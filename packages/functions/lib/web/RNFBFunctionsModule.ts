import {
  getApp,
  getFunctions,
  httpsCallable,
  httpsCallableFromURL,
  connectFunctionsEmulator,
  type HttpsCallableStreamOptions,
  type HttpsCallableResult,
  type HttpsCallable,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFunctions';
import { emitEvent } from '@react-native-firebase/app/dist/module/internal/web/utils';
import type { HttpsCallableOptions } from '../index';
import type { NativeError } from '../HttpsError';
import type { CustomHttpsCallableOptions, FunctionsWebInternal } from '../types/internal';

interface WrapperData {
  data: unknown;
}

// Store active stream iterators for cancellation
let activeStreamIterators: Record<string, AsyncIterator<unknown>> = {};

/**
 * Helper function to generate a unique key for a stream.
 */
function getStreamKey(appName: string, region: string, listenerId: number): string {
  return `${appName}-${region}-${listenerId}`;
}

/**
 * Helper function to handle streaming callable execution.
 * @param callable - The callable instance to stream from
 * @param appName - The app name for event emission
 * @param region - The region for the stream key
 * @param callableData - The data to pass to the callable
 * @param listenerId - The listener ID for this stream
 */
async function executeCallableStream(
  callable: HttpsCallable<unknown, unknown, unknown>,
  appName: string,
  region: string,
  callableData: unknown,
  listenerId: number,
  options: HttpsCallableStreamOptions,
): Promise<void> {
  const streamKey = getStreamKey(appName, region, listenerId);

  try {
    const streamOptions: HttpsCallableStreamOptions = {};
    if (options.signal) {
      streamOptions.signal = options.signal;
    }
    if (options.limitedUseAppCheckTokens) {
      streamOptions.limitedUseAppCheckTokens = options.limitedUseAppCheckTokens;
    }
    const callableStream = Object.keys(streamOptions).length
      ? callable.stream(callableData || null, streamOptions)
      : callable.stream(callableData || null);

    const { stream, data } = await callableStream;

    // Get the iterator and store it for potential cancellation
    const iterator = stream[Symbol.asyncIterator]();
    activeStreamIterators[streamKey] = iterator;

    // Manual iteration to allow proper cancellation
    while (true) {
      const result = await iterator.next();

      if (result.done) {
        const finalData = await data;
        emitEvent('functions_streaming_event', {
          appName,
          listenerId,
          body: {
            data: finalData,
            error: null,
            done: true,
          },
        });
        break;
      }

      // Emit chunk data
      emitEvent('functions_streaming_event', {
        appName,
        listenerId,
        body: {
          data: result.value,
          error: null,
          done: false,
        },
      });
    }
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
  } finally {
    // Clean up the iterator reference
    delete activeStreamIterators[streamKey];
  }
}

/**
 * Helper function to get a configured Functions instance.
 * Handles app retrieval, region/custom domain configuration, and emulator connection.
 * @param appName - The name of the app to get the functions instance for.
 * @param regionOrCustomDomain - The region or custom domain to use for the functions instance.
 * @param host - The host to use for the functions emulator.
 * @param port - The port to use for the functions emulator.
 * @returns A configured FunctionsWebInternal instance.
 */
function getConfiguredFunctionsInstance(
  appName: string,
  regionOrCustomDomain: string | null,
  host: string | null,
  port: number,
): FunctionsWebInternal {
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

  return functionsInstance;
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
  ): Promise<HttpsCallableResult<unknown>> {
    try {
      const functionsInstance = getConfiguredFunctionsInstance(
        appName,
        regionOrCustomDomain,
        host,
        port,
      );

      const callable = Object.keys(options).length
        ? httpsCallable(functionsInstance, name, options)
        : httpsCallable(functionsInstance, name);

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
  ): Promise<HttpsCallableResult<unknown>> {
    try {
      const functionsInstance = getConfiguredFunctionsInstance(
        appName,
        regionOrCustomDomain,
        host,
        port,
      );

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
    options: CustomHttpsCallableOptions,
    listenerId: number,
  ): Promise<void> {
    const functionsInstance = getConfiguredFunctionsInstance(
      appName,
      regionOrCustomDomain,
      host,
      port,
    );

    const callable = Object.keys(options).length
      ? httpsCallable(functionsInstance, name, options)
      : httpsCallable(functionsInstance, name);

    const region = regionOrCustomDomain || 'us-central1';
    await executeCallableStream(
      callable,
      appName,
      region,
      wrapper.data,
      listenerId,
      options.httpsCallableStreamOptions,
    );
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
    options: CustomHttpsCallableOptions,
    listenerId: number,
  ): Promise<void> {
    const functionsInstance = getConfiguredFunctionsInstance(
      appName,
      regionOrCustomDomain,
      host,
      port,
    );

    const httpsCallableOptions: HttpsCallableOptions = {};
    if (options.timeout) {
      httpsCallableOptions.timeout = options.timeout;
    }
    if (options.limitedUseAppCheckTokens) {
      httpsCallableOptions.limitedUseAppCheckTokens = options.limitedUseAppCheckTokens;
    }

    const callable = httpsCallableFromURL(functionsInstance, url, httpsCallableOptions);
    const region = regionOrCustomDomain || 'us-central1';
    await executeCallableStream(
      callable,
      appName,
      region,
      wrapper.data,
      listenerId,
      options.httpsCallableStreamOptions,
    );
  },

  /**
   * Removes a streaming listener and cancels the underlying stream.
   * @param appName - The app name for the stream.
   * @param region - The region for the stream.
   * @param listenerId - The listener ID to remove.
   */
  removeFunctionsStreaming(appName: string, region: string, listenerId: number): void {
    const streamKey = getStreamKey(appName, region, listenerId);
    const iterator = activeStreamIterators[streamKey];

    if (iterator && typeof iterator.return === 'function') {
      // Call return() to signal the stream to close
      iterator.return();
      delete activeStreamIterators[streamKey];
    }
  },
};
