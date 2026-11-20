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

// Hermes has native atob and btoa, far faster than the Base64 fallback.
type GlobalWithBase64 = typeof globalThis & {
  atob?: (data: string) => string;
  btoa?: (data: string) => string;
};

// String.fromCharCode.apply takes one argument per byte, so bytes are converted in chunks
// small enough for every engine's argument limit.
const FROM_CHAR_CODE_CHUNK_SIZE = 4096;

function base64ToBinaryString(base64: string): string {
  const { atob } = globalThis as GlobalWithBase64;
  return typeof atob === 'function' ? atob(base64) : Base64.atob(base64);
}

function binaryStringToBase64(binaryString: string): string {
  const { btoa } = globalThis as GlobalWithBase64;
  return typeof btoa === 'function' ? btoa(binaryString) : Base64.btoa(binaryString);
}

export class Blob {
  _binaryString: string;

  constructor(internal = false, binaryString?: string) {
    if (internal === false) {
      throw new Error(
        'firebase.firestore.Blob constructor is private, use Blob.<field>() instead.',
      );
    }

    this._binaryString = binaryString ?? '';
  }

  static fromBase64String(base64: string): Blob {
    if (!isString(base64) || base64.length < 1) {
      throw new Error(
        'firestore.Blob.fromBase64String expects a string of at least 1 character in length',
      );
    }

    let binaryString: string;
    try {
      binaryString = base64ToBinaryString(base64);
    } catch {
      throw new Error('firestore.Blob.fromBase64String expects a valid base64 string');
    }

    return new Blob(true, binaryString);
  }

  static fromUint8Array(array: Uint8Array): Blob {
    if (!(array instanceof Uint8Array)) {
      throw new Error('firestore.Blob.fromUint8Array expects an instance of Uint8Array');
    }

    let binaryString = '';
    for (let i = 0; i < array.length; i += FROM_CHAR_CODE_CHUNK_SIZE) {
      // apply accepts any array-like; the cast is only for TypeScript.
      binaryString += String.fromCharCode.apply(
        null,
        array.subarray(i, i + FROM_CHAR_CODE_CHUNK_SIZE) as unknown as number[],
      );
    }

    return new Blob(true, binaryString);
  }

  isEqual(blob: Blob): boolean {
    if (!(blob instanceof Blob)) {
      throw new Error('firestore.Blob.isEqual expects an instance of Blob');
    }

    return this._binaryString === blob._binaryString;
  }

  toBase64(): string {
    return binaryStringToBase64(this._binaryString);
  }

  toUint8Array(): Uint8Array {
    const binaryString = this._binaryString;
    const array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      array[i] = binaryString.charCodeAt(i);
    }

    return array;
  }

  toString(): string {
    return `firestore.Blob(base64: ${this.toBase64()})`;
  }
}
