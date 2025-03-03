export declare class Bytes extends FirestoreBlob {
  static fromBase64String(base64: string): Bytes;

  static fromUint8Array(array: Uint8Array): Bytes;

  toBase64(): string;

  toUint8Array(): Uint8Array;

  isEqual(other: Bytes): boolean;
}
