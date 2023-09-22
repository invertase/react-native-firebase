import { firebase } from '../index';

/**
 * An immutable object representing an array of bytes.
 */
export class Bytes {
  /**
   * @hideconstructor
   * @param {firebase.firestore.Blob} blob
   */
  constructor(blob) {
    this._blob = blob;
  }

  /**
   * @param {string} base64
   * @returns {Bytes}
   */
  static fromBase64String(base64) {
    return new Bytes(firebase.firestore.Blob.fromBase64String(base64));
  }

  /**
   * @param {Uint8Array} array
   * @returns {Bytes}
   */
  static fromUint8Array(array) {
    return new Bytes(firebase.firestore.Blob.fromUint8Array(array));
  }

  /**
   * @returns {string}
   */
  toBase64() {
    return this._blob.toBase64();
  }

  /**
   * @returns {Uint8Array}
   */
  toUint8Array() {
    return this._blob.toUint8Array();
  }

  /**
   * @returns {string}
   */
  toString() {
    return 'Bytes(base64: ' + this.toBase64() + ')';
  }

  /**
   * @param {Bytes} other
   * @returns {boolean}
   */
  isEqual(other) {
    return this._blob.isEqual(other._blob);
  }
}
