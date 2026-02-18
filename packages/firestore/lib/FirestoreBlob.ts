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

import { Base64, isString } from '@react-native-firebase/app/dist/module/common';

export default class FirestoreBlob {
  _binaryString: string;

  constructor(internal = false, binaryString?: string) {
    if (internal === false) {
      throw new Error(
        'firebase.firestore.Blob constructor is private, use Blob.<field>() instead.',
      );
    }

    this._binaryString = binaryString ?? '';
  }

  static fromBase64String(base64: string): FirestoreBlob {
    if (!isString(base64) || base64.length < 1) {
      throw new Error(
        'firestore.Blob.fromBase64String expects a string of at least 1 character in length',
      );
    }

    return new FirestoreBlob(true, Base64.atob(base64));
  }

  static fromUint8Array(array: Uint8Array): FirestoreBlob {
    if (!(array instanceof Uint8Array)) {
      throw new Error('firestore.Blob.fromUint8Array expects an instance of Uint8Array');
    }

    return new FirestoreBlob(
      true,
      Array.prototype.map.call(array, (byte: number) => String.fromCharCode(byte)).join(''),
    );
  }

  isEqual(blob: FirestoreBlob): boolean {
    if (!(blob instanceof FirestoreBlob)) {
      throw new Error('firestore.Blob.isEqual expects an instance of Blob');
    }

    return this._binaryString === blob._binaryString;
  }

  toBase64(): string {
    return Base64.btoa(this._binaryString);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this._binaryString.split('').map(char => char.charCodeAt(0)));
  }

  toString(): string {
    return `firestore.Blob(base64: ${this.toBase64()})`;
  }
}
