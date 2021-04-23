export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return new TextDecoder('utf-8').decode(binary);
}
