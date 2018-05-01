import Base64 from './utils/Base64';

type BlobFormat = 'string' | 'array';

export default class Blob {
  constructor(data, type: BlobFormat) {
    this._data = data;
    this._type = type;
  }

  /**
   * Creates a new Blob from the given Base64 string
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#.fromBase64String
   * @param base64 string
   */
  static fromBase64String(base64: string): Blob {
    // TODO convert to Uint8Array?
    return new Blob(base64, 'string');
  }

  /**
   * Creates a new Blob from the given Uint8Array.
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#.fromUint8Array
   * @param array Array
   */
  static fromUint8Array(array: Array): Blob {
    return new Blob(array, 'array');
  }

  /**
   * Returns 'true' if this Blob is equal to the provided one.
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#isEqual
   * @param {*} blob Blob The Blob to compare against. Value must not be null.
   * @returns boolean 'true' if this Blob is equal to the provided one.
   */
  isEqual(blob: Blob): boolean {
    // TODO comparison checks
    console.log(blob);
    return true;
  }

  /**
   * Returns the bytes of a Blob as a Base64-encoded string.
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#toBase64
   * @returns string The Base64-encoded string created from the Blob object.
   */
  toBase64(): string {
    if (this._type === 'string') return this._data;

    let binary = '';
    const len = this._data.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(this._data[i]);
    }

    return Base64.btoa(binary);
  }

  /**
   * Returns the bytes of a Blob in a new Uint8Array.
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#toUint8Array
   * @returns non-null Uint8Array The Uint8Array created from the Blob object.
   */
  toUint8Array(): Uint8Array {
    if (this._type === 'array') return this._data;
    // TODO conversion
    // TODO conversion
    // TODO conversion
    return new Uint8Array();
  }
}
