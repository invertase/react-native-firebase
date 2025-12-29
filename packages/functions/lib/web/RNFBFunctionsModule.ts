import {
  getApp,
  getFunctions,
  httpsCallable,
  httpsCallableFromURL,
  connectFunctionsEmulator,
} from '@react-native-firebase/app/lib/internal/web/firebaseFunctions';
import { emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';
import type { HttpsCallableOptions } from '../index';
import type { NativeError } from '../HttpsError';

interface WrapperData {
  data?: any;
}

// Map to store active streaming subscriptions by listenerId
// Subscription type from RxJS has an unsubscribe() method
interface Subscription {
  unsubscribe(): void;
}

const functionsStreamingListeners = new Map<number, Subscription>();

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
      let functionsInstance;
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
        (functionsInstance as any).emulatorOrigin = `http://${host}:${port}`;
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
      let functionsInstance;
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
        (functionsInstance as any).emulatorOrigin = `http://${host}:${port}`;
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
  httpsCallableStream(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    name: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
    listenerId: number,
  ): void {
    // Wrap entire function to catch any synchronous errors
    try {
      const app = getApp(appName);
      let functionsInstance;
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

      // if data is undefined use null
      const data = wrapper['data'] ?? null;

      // Defer streaming to next tick to ensure event listeners are set up
      setTimeout(() => {
        try {
          // Ignore if the listener already exists
          if (functionsStreamingListeners.has(listenerId)) {
            return;
          }

          // Call the streaming version
          const callableWithStream = callable as any;

          if (typeof callableWithStream.stream === 'function') {
            const subscription = callableWithStream.stream(data).subscribe({
              next: (chunk: any) => {
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: chunk.data ?? null,
                    error: null,
                    done: false,
                  },
                });
              },
              error: (error: any) => {
                const { code, message, details } = error;
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: null,
                    error: {
                      code: code ? code.replace('functions/', '') : 'unknown',
                      message: message || error.toString(),
                      details,
                    },
                    done: true,
                  },
                });
                // Remove listener on error
                functionsStreamingListeners.delete(listenerId);
              },
              complete: () => {
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: null,
                    error: null,
                    done: true,
                  },
                });
                // Remove listener on completion
                functionsStreamingListeners.delete(listenerId);
              },
            });

            // Store subscription in the listeners map
            functionsStreamingListeners.set(listenerId, subscription);
          } else {
            // Fallback: streaming not supported, emit error
            emitEvent('functions_streaming_event', {
              eventName: 'functions_streaming_event',
              listenerId,
              body: {
                data: null,
                error: {
                  code: 'unsupported',
                  message: 'Streaming is not supported in this Firebase SDK version',
                  details: null,
                },
                done: true,
              },
            });
          }
        } catch (streamError: any) {
          // Error during streaming setup
          const { code, message, details } = streamError;
          emitEvent('functions_streaming_event', {
            eventName: 'functions_streaming_event',
            listenerId,
            body: {
              data: null,
              error: {
                code: code ? code.replace('functions/', '') : 'unknown',
                message: message || streamError.toString(),
                details,
              },
              done: true,
            },
          });
        }
      }, 0); // Execute on next tick
    } catch (error: any) {
      // Synchronous error during setup - emit immediately
      const { code, message, details } = error;
      emitEvent('functions_streaming_event', {
        eventName: 'functions_streaming_event',
        listenerId,
        body: {
          data: null,
          error: {
            code: code ? code.replace('functions/', '') : 'unknown',
            message: message || error.toString(),
            details,
          },
          done: true,
        },
      });
    }
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
  httpsCallableStreamFromUrl(
    appName: string,
    regionOrCustomDomain: string | null,
    host: string | null,
    port: number,
    url: string,
    wrapper: WrapperData,
    options: HttpsCallableOptions,
    listenerId: number,
  ): void {
    try {
      const app = getApp(appName);
      let functionsInstance;
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
      const data = wrapper['data'] ?? null;

      // Defer streaming to next tick to ensure event listeners are set up
      setTimeout(() => {
        try {
          // Ignore if the listener already exists
          if (functionsStreamingListeners.has(listenerId)) {
            return;
          }

          // Call the streaming version
          const callableWithStream = callable as any;

          if (typeof callableWithStream.stream === 'function') {
            const subscription = callableWithStream.stream(data).subscribe({
              next: (chunk: any) => {
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: chunk.data ?? null,
                    error: null,
                    done: false,
                  },
                });
              },
              error: (error: any) => {
                const { code, message, details } = error;
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: null,
                    error: {
                      code: code ? code.replace('functions/', '') : 'unknown',
                      message: message || error.toString(),
                      details,
                    },
                    done: true,
                  },
                });
                // Remove listener on error
                functionsStreamingListeners.delete(listenerId);
              },
              complete: () => {
                emitEvent('functions_streaming_event', {
                  eventName: 'functions_streaming_event',
                  listenerId,
                  body: {
                    data: null,
                    error: null,
                    done: true,
                  },
                });
                // Remove listener on completion
                functionsStreamingListeners.delete(listenerId);
              },
            });

            // Store subscription in the listeners map
            functionsStreamingListeners.set(listenerId, subscription);
          } else {
            // Fallback: streaming not supported, emit error
            emitEvent('functions_streaming_event', {
              eventName: 'functions_streaming_event',
              listenerId,
              body: {
                data: null,
                error: {
                  code: 'unsupported',
                  message: 'Streaming is not supported in this Firebase SDK version',
                  details: null,
                },
                done: true,
              },
            });
          }
        } catch (streamError: any) {
          // Error during streaming setup
          const { code, message, details } = streamError;
          emitEvent('functions_streaming_event', {
            eventName: 'functions_streaming_event',
            listenerId,
            body: {
              data: null,
              error: {
                code: code ? code.replace('functions/', '') : 'unknown',
                message: message || streamError.toString(),
                details,
              },
              done: true,
            },
          });
        }
      }, 0); // Execute on next tick
    } catch (error: any) {
      // Synchronous error during setup - emit immediately
      const { code, message, details } = error;
      emitEvent('functions_streaming_event', {
        eventName: 'functions_streaming_event',
        listenerId,
        body: {
          data: null,
          error: {
            code: code ? code.replace('functions/', '') : 'unknown',
            message: message || error.toString(),
            details,
          },
          done: true,
        },
      });
    }
  },

  /**
   * Removes a streaming listener.
   * @param listenerId - The listener ID to remove.
   */
  removeFunctionsStreaming(listenerId: number): void {
    const subscription = functionsStreamingListeners.get(listenerId);
    if (subscription) {
      // Unsubscribe from the RxJS stream
      subscription.unsubscribe();
      // Remove from the listeners map
      functionsStreamingListeners.delete(listenerId);
    }
  },
};
