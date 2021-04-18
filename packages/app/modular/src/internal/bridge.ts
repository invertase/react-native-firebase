import { NativeModules } from 'react-native';

interface BridgeAppModule {
  deleteApp(name: string): Promise<void>;
}

const config = {
  events: ['123'],
};

export default function bridge(app: FirebaseApp) {
  const module = getNativeModule(app, config);
  return module;
}

const bridge: BridgeAppModule = NativeModules.RNFirebaseModuleApp;

export default bridge;