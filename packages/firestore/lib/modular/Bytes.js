import FirestoreBlob from '../FirestoreBlob';

/**
 * An immutable object representing an array of bytes.
 */
export class Bytes extends FirestoreBlob {
  /**
   * @hideconstructor
   * @param {firebase.firestore.Blob} blob
   */
  constructor(blob) {
    super(true);
    // binary string was already parsed and created, potentially expensive
    // don't parse it again, just set it into the new FirebaseBlob
    this._binaryString = blob._binaryString;
  }

  /**
   * @param {string} base64
   * @returns {Bytes}
   */
  static fromBase64String(base64) {
    return new Bytes(FirestoreBlob.fromBase64String(base64));
  }

  /**
   * @param {Uint8Array} array
   * @returns {Bytes}
   */
  static fromUint8Array(array) {
    return new Bytes(FirestoreBlob.fromUint8Array(array));
  }

  /**
   * @returns {string}
   */
  toBase64() {
    return super.toBase64();
  }

  /**
   * @returns {Uint8Array}
   */
  toUint8Array() {
    return super.toUint8Array();
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
    return super.isEqual(other);
  }
}
