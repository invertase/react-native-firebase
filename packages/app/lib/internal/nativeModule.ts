// This is fallback for when the platform is not with native SDKs.
// In this case we use the web Firebase JS SDK.
export { getReactNativeModule } from './nativeModuleWeb';
export { setReactNativeModule } from './nativeModuleWeb';
