/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Base64, isString } from '@react-native-firebase/app/lib/common';

export default class FirestoreBlob {
  constructor(internal = false, binaryString) {
    if (internal === false) {
      throw new Error(
        'firebase.firestore.Blob constructor is private, use Blob.<field>() instead.',
      );
    }

    this._binaryString = binaryString;
  }

  /**
   * Creates a new Blob from the given Base64 string
   *
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#.fromBase64String
   * @param base64 string
   */
  static fromBase64String(base64) {
    if (!isString(base64) || base64.length < 1) {
      throw new Error(
        'firestore.Blob.fromBase64String expects a string of at least 1 character in length',
      );
    }

    return new FirestoreBlob(true, Base64.atob(base64));
  }

  /**
   * Creates a new Blob from the given Uint8Array.
   *
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#.fromUint8Array
   * @param array Array
   */
  static fromUint8Array(array) {
    if (!(array instanceof Uint8Array)) {
      throw new Error('firestore.Blob.fromUint8Array expects an instance of Uint8Array');
    }

    return new FirestoreBlob(
      true,
      Array.prototype.map.call(array, $ => String.fromCharCode($)).join(''),
    );
  }

  /**
   * Returns 'true' if this Blob is equal to the provided one.
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#isEqual
   * @param {*} blob Blob The Blob to compare against. Value must not be null.
   * @returns boolean 'true' if this Blob is equal to the provided one.
   */
  isEqual(blob) {
    if (!(blob instanceof FirestoreBlob)) {
      throw new Error('firestore.Blob.isEqual expects an instance of Blob');
    }

    return this._binaryString === blob._binaryString;
  }

  /**
   * Returns the bytes of a Blob as a Base64-encoded string.
   *
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#toBase64
   * @returns string The Base64-encoded string created from the Blob object.
   */
  toBase64() {
    return Base64.btoa(this._binaryString);
  }

  /**
   * Returns the bytes of a Blob in a new Uint8Array.
   *
   * @url https://firebase.google.com/docs/reference/js/firebase.firestore.Blob#toUint8Array
   * @returns non-null Uint8Array The Uint8Array created from the Blob object.
   */
  toUint8Array() {
    return new Uint8Array(this._binaryString.split('').map(c => c.charCodeAt(0)));
  }

  /**
   * Returns a string representation of this blob instance
   *
   * @returns {string}
   * @memberof Blob
   */
  toString() {
    return `firestore.Blob(base64: ${this.toBase64()})`;
  }
}
