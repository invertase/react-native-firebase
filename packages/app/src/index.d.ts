import { ReactNativeFirebaseModule } from '@react-native-firebase/app-types';

/**
 * Provides various helpers for using Firebase in React Native.
 *
 * @firebase utils
 */
interface FirebaseUtilsModule extends ReactNativeFirebaseModule {
  // TODO
}

/**
 * @firebase firebase
 */
declare module 'react-native-firebase' {
  import { ReactNativeFirebaseNamespace } from '@react-native-firebase/app-types';
  const ReactNativeFirebase: ReactNativeFirebaseNamespace;
  export default ReactNativeFirebase;
}

declare module '@react-native-firebase/app-types' {
  interface ReactNativeFirebaseNamespace {
    utils?: {
      (app?: FirebaseApp): FirebaseUtilsModule;
    };
  }

  interface FirebaseApp {
    utils?(app?: FirebaseApp): FirebaseUtilsModule;
  }
}
