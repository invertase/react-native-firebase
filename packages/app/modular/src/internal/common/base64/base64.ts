const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function binaryToBase64(binary: ArrayBuffer | Uint8Array): string {
  return btoa(new Uint8Array(binary).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

export function btoa(input: string): string {
  let map: string;
  let i = 0;
  let block = 0;
  let output = '';

  for (
    block = 0, i = 0, map = CHARS;
    input.charAt(i | 0) || ((map = '='), i % 1);
    output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
  ) {
    const charCode = input.charCodeAt((i += 3 / 4));

    if (charCode > 0xff) {
      throw new Error(
        'btoa: The string to be encoded contains characters outside of the Latin1 range.',
      );
    }

    block = (block << 8) | charCode;
  }

  return output;
}
