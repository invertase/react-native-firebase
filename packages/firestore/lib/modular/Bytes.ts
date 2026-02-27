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

import FirestoreBlob from '../FirestoreBlob';
import type { FirestoreBlobInternal } from '../types/internal';

export class Bytes extends FirestoreBlob {
  constructor(blob: FirestoreBlobInternal) {
    super(true);
    // Binary string was already parsed and created; avoid reparsing.
    (this as FirestoreBlobInternal)._binaryString = blob._binaryString;
  }

  static fromBase64String(base64: string): Bytes {
    try {
      return new Bytes(FirestoreBlob.fromBase64String(base64) as FirestoreBlobInternal);
    } catch (error) {
      throw new Error(`Failed to construct data from Base64 string: ${error}`);
    }
  }

  static fromUint8Array(array: Uint8Array): Bytes {
    return new Bytes(FirestoreBlob.fromUint8Array(array) as FirestoreBlobInternal);
  }

  toBase64(): string {
    return super.toBase64();
  }

  toUint8Array(): Uint8Array {
    return super.toUint8Array();
  }

  toString(): string {
    return `Bytes(base64: ${this.toBase64()})`;
  }

  isEqual(other: Bytes): boolean {
    return super.isEqual(other);
  }

  static _jsonSchemaVersion: string = 'firestore/bytes/1.0';
  static _jsonSchema = {
    type: Bytes._jsonSchemaVersion,
    bytes: 'string',
  };

  toJSON(): { type: string; bytes: string } {
    return {
      type: Bytes._jsonSchemaVersion,
      bytes: this.toBase64(),
    };
  }

  static fromJSON(json: object): Bytes {
    if (
      json &&
      typeof (json as { type?: unknown }).type === 'string' &&
      (json as { type?: string }).type === Bytes._jsonSchemaVersion &&
      typeof (json as { bytes?: unknown }).bytes === 'string'
    ) {
      return Bytes.fromBase64String((json as { bytes: string }).bytes);
    }

    throw new Error('Unexpected error creating Bytes from JSON.');
  }
}
