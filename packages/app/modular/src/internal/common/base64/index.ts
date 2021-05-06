import * as impl from './base64';

/**
 * Converts a binary value into a Base64 string format.
 */
export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return impl.binaryToBase64(binary);
}

/**
 * Encodes a string value into a Base64 string format.
 */
export function btoa(input: string): string {
  return impl.btoa(input);
}
