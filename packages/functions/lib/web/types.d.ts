/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Augment the Firebase Functions SDK to include emulatorOrigin property
 * which is set as a workaround for emulator configuration on web.
 */
declare module 'firebase/functions' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Functions {
    emulatorOrigin?: string;
  }
}

/**
 * Type declaration for RNFBAppModule to include eventsSendEvent method
 * used for streaming events on web platform.
 */
declare module '@react-native-firebase/app/lib/internal/web/RNFBAppModule' {
  interface RNFBAppModuleType {
    NATIVE_FIREBASE_APPS: any[];
    FIREBASE_RAW_JSON: string;
    initializeApp(options: any, appConfig: any): Promise<any>;
    deleteApp(name: string): Promise<void>;
    setLogLevel(logLevel: string): void;
    metaGetAll(): Promise<{ [key: string]: string | boolean }>;
    jsonGetAll(): Promise<{ [key: string]: string | boolean }>;
    preferencesClearAll(): Promise<void>;
    preferencesGetAll(): Promise<{ [key: string]: string | boolean }>;
    preferencesSetBool(key: string, value: boolean): Promise<void>;
    preferencesSetString(key: string, value: string): void;
    setAutomaticDataCollectionEnabled(name: string, enabled: boolean): void;
    eventsNotifyReady(ready: boolean): void;
    eventsAddListener(eventType: string): void;
    eventsRemoveListener(eventType: string, removeAll?: boolean): void;
    addListener?: (eventName: string) => void;
    removeListeners?: (count: number) => void;
    eventsSendEvent(eventName: string, eventBody: any): void;
  }
  const RNFBAppModule: RNFBAppModuleType;
  export default RNFBAppModule;
}

