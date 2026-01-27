import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { HttpsCallableOptions } from '../lib/types/functions';

// Define generic types outside the interface
export type RequestData = unknown;
export type ResponseData = unknown;

export interface Spec extends TurboModule {
  /**
   * Calls a Cloud Function with the given name and data.
   *
   * @param emulatorHost - The emulator host (can be null)
   * @param emulatorPort - The emulator port (can be -1 for no emulator)
   * @param name - The name of the Cloud Function to call
   * @param data - The data to pass to the function
   * @param options - Additional options for the call
   * @returns Promise that resolves with the function result
   */
  httpsCallable(
    appName: string,
    region: string,
    emulatorHost: string | null,
    emulatorPort: number,
    name: string,
    data: { data: RequestData },
    options: { timeout?: number; limitedUseAppCheckTokens?: boolean },
  ): Promise<{ data: ResponseData }>;

  /**
   * Calls a Cloud Function using a full URL instead of just the function name.
   *
   * @param emulatorHost - The emulator host (can be null)
   * @param emulatorPort - The emulator port (can be -1 for no emulator)
   * @param url - The full URL of the Cloud Function
   * @param data - The data to pass to the function
   * @param options - Additional options for the call
   * @returns Promise that resolves with the function result
   */
  httpsCallableFromUrl(
    appName: string,
    region: string,
    emulatorHost: string | null,
    emulatorPort: number,
    url: string,
    data: { data: RequestData },
    options: { timeout?: number; limitedUseAppCheckTokens?: boolean },
  ): Promise<{ data: ResponseData }>;

  /**
   * Calls a Cloud Function with streaming support, emitting events as they arrive.
   *
   * @param emulatorHost - The emulator host (can be null)
   * @param emulatorPort - The emulator port (can be -1 for no emulator)
   * @param name - The name of the Cloud Function to call
   * @param data - The data to pass to the function
   * @param options - Additional options for the call
   * @param listenerId - Unique identifier for this stream listener
   */
  httpsCallableStream(
    appName: string,
    region: string,
    emulatorHost: string | null,
    emulatorPort: number,
    name: string,
    data: { data: RequestData },
    options: {
      timeout?: number;
      limitedUseAppCheckTokens?: boolean;
      httpsCallableStreamOptions: {
        /** cannot put AbortSignal here as it is for web only, but it will be passed in the options */
        signal?: unknown;
        limitedUseAppCheckTokens?: boolean;
      };
    },
    listenerId: number,
  ): void;

  /**
   * Calls a Cloud Function using a full URL with streaming support.
   *
   * @param emulatorHost - The emulator host (can be null)
   * @param emulatorPort - The emulator port (can be -1 for no emulator)
   * @param url - The full URL of the Cloud Function
   * @param data - The data to pass to the function
   * @param options - Additional options for the call
   * @param listenerId - Unique identifier for this stream listener
   */
  httpsCallableStreamFromUrl(
    appName: string,
    region: string,
    emulatorHost: string | null,
    emulatorPort: number,
    url: string,
    data: { data: RequestData },
    options: {
      timeout?: number;
      limitedUseAppCheckTokens?: boolean;
      httpsCallableStreamOptions: {
        /** cannot put AbortSignal here as it is for web only, but it will be passed in the options */
        signal?: unknown;
        limitedUseAppCheckTokens?: boolean;
      };
    },
    listenerId: number,
  ): void;

  /**
   * Removes/cancels a streaming listener.
   *
   * @param appName - The app name
   * @param region - The region
   * @param listenerId - The listener ID to remove
   */
  removeFunctionsStreaming(appName: string, region: string, listenerId: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboFunctions');
