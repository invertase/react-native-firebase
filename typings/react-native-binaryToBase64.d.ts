/*
 * Deep import from `react-native` (not declared in `@types/react-native`).
 * Used by @react-native-firebase/app Base64 helper.
 */
declare module 'react-native/Libraries/Utilities/binaryToBase64' {
  export default function binaryToBase64(data: ArrayBuffer | Uint8Array): string;
}
