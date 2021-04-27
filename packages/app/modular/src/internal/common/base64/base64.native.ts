// @ts-ignore
import toBase64 from 'react-native/Libraries/Utilities/binaryToBase64';

export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return toBase64(binary);
}
