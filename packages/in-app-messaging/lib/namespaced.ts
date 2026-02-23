import { isBoolean, isString } from '@react-native-firebase/app/dist/module/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/dist/module/internal';
import type { ModuleConfig } from '@react-native-firebase/app/dist/module/internal';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import { version } from './version';
import type { InAppMessaging, Statics } from './types/in-app-messaging';

const statics: Statics = {
  SDK_VERSION: version,
};

const namespace = 'inAppMessaging';

const nativeModuleName = 'RNFBFiamModule';

class FirebaseFiamModule extends FirebaseModule implements InAppMessaging {
  _isMessagesDisplaySuppressed: boolean;
  _isAutomaticDataCollectionEnabled: boolean;

  constructor(
    app: ReactNativeFirebase.FirebaseAppBase,
    config: ModuleConfig,
    customUrlOrRegion?: string | null,
  ) {
    super(app, config, customUrlOrRegion);
    this._isMessagesDisplaySuppressed = this.native.isMessagesDisplaySuppressed;
    this._isAutomaticDataCollectionEnabled = this.native.isAutomaticDataCollectionEnabled;
  }

  get isMessagesDisplaySuppressed(): boolean {
    return this._isMessagesDisplaySuppressed;
  }

  get isAutomaticDataCollectionEnabled(): boolean {
    return this._isAutomaticDataCollectionEnabled;
  }

  setMessagesDisplaySuppressed(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.inAppMessaging().setMessagesDisplaySuppressed(*) 'enabled' must be a boolean.",
      );
    }

    this._isMessagesDisplaySuppressed = enabled;
    return this.native.setMessagesDisplaySuppressed(enabled);
  }

  setAutomaticDataCollectionEnabled(enabled: boolean): Promise<null> {
    if (!isBoolean(enabled)) {
      throw new Error(
        "firebase.inAppMessaging().setAutomaticDataCollectionEnabled(*) 'enabled' must be a boolean.",
      );
    }

    this._isAutomaticDataCollectionEnabled = enabled;
    return this.native.setAutomaticDataCollectionEnabled(enabled);
  }

  triggerEvent(eventId: string): Promise<null> {
    if (!isString(eventId)) {
      throw new Error("firebase.inAppMessaging().triggerEvent(*) 'eventId' must be a string.");
    }
    return this.native.triggerEvent(eventId);
  }
}

export const SDK_VERSION = version;

const inAppMessagingNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseFiamModule,
});

type InAppMessagingNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  InAppMessaging,
  Statics
> & {
  inAppMessaging: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<InAppMessaging, Statics>;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

export default inAppMessagingNamespace as unknown as InAppMessagingNamespace;

// import inAppMessaging, { firebase } from '@react-native-firebase/in-app-messaging';
// inAppMessaging().X(...);
// firebase.inAppMessaging().X(...);
export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'inAppMessaging',
    InAppMessaging,
    Statics,
    false
  >;
