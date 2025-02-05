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

import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';
import { promiseDefer } from './promise';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

/**
 * window.btoa
 */
function btoa(input) {
  let map;
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
        "'RNFirebase.Base64.btoa' failed: The string to be encoded contains characters outside of the Latin1 range.",
      );
    }

    block = (block << 8) | charCode;
  }

  return output;
}

/**
 * window.atob
 */
function atob(input) {
  let i = 0;
  let bc = 0;
  let bs = 0;
  let buffer;
  let output = '';

  const str = input.replace(/[=]+$/, '');

  if (str.length % 4 === 1) {
    throw new Error(
      "'RNFirebase.Base64.atob' failed: The string to be decoded is not correctly encoded.",
    );
  }

  for (
    bc = 0, bs = 0, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = CHARS.indexOf(buffer);
  }

  return output;
}

/**
 * Converts a Blob, ArrayBuffer or Uint8Array to a base64 string.
 */
function fromData(data) {
  if (data instanceof Blob) {
    const fileReader = new FileReader();
    const { resolve, reject, promise } = promiseDefer();

    fileReader.readAsDataURL(data);

    fileReader.onloadend = function onloadend() {
      resolve({ string: fileReader.result, format: 'data_url' });
    };

    fileReader.onerror = function onerror(event) {
      fileReader.abort();
      reject(event);
    };

    return promise;
  }

  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    return Promise.resolve({
      string: binaryToBase64(data),
      format: 'base64',
    });
  }

  throw new Error("'RNFirebase.Base64.fromData' failed: Unknown data type.");
}

export default {
  btoa,
  atob,
  fromData,
};
