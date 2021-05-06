export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return new window.TextDecoder('utf-8').decode(binary);
}

export function btoa(input: string): string {
  return window.btoa(input);
}
