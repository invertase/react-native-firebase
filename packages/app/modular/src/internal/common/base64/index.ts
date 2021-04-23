import * as impl from './base64';

export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return impl.binaryToBase64(binary);
}
