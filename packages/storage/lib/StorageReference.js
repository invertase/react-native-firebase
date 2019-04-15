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

import {
  Base64,
  getDataUrlParts,
  isObject,
  isString,
  isUndefined,
  ReferenceBase,
} from '@react-native-firebase/common';
import { validateMetadata } from './utils';
import StorageStatics from './StorageStatics';
import StorageUploadTask from './StorageUploadTask';
import StorageDownloadTask from './StorageDownloadTask';

export default class StorageReference extends ReferenceBase {
  constructor(storage, path) {
    super(path);
    this._storage = storage;
  }

  get bucket() {
    return this._storage._customUrlOrRegion.replace('gs://', '');
  }

  get name() {
    return this.path.substring(this.path.lastIndexOf('/') + 1, this.path.length);
  }

  get parent() {
    if (this.path === '/') return null;
    return new StorageReference(this._storage, this.path.substring(0, this.path.lastIndexOf('/')));
  }

  get root() {
    return new StorageReference(this._storage, '/');
  }

  get storage() {
    return this._storage;
  }

  get fullPath() {
    return this.path;
  }

  child(path) {
    return new StorageReference(this._storage, `${this.path}/${path}`);
  }

  toString() {
    return `${this._storage._customUrlOrRegion}/${this.path}`;
  }

  delete() {
    return this._storage.native.delete(this.toString());
  }

  getDownloadURL() {
    return this._storage.native.getDownloadURL(this.toString());
  }

  getMetadata() {
    return this._storage.native.getMetadata(this.toString());
  }

  updateMetadata(metadata) {
    validateMetadata(metadata);
    return this._storage.native.updateMetadata(this.toString(), metadata);
  }

  downloadFile(filePath) {
    // TODO(salakar) validate arg
    return new StorageDownloadTask(this, filePath);
  }

  put(data, metadata) {
    // TODO(salakar) validate args
    return Base64.fromData(data).then(({ string, format }) =>
      this.putString(string, format, metadata),
    );
  }

  putString(string, format = StorageStatics.StringFormat.RAW, metadata) {
    if (!isString(string)) {
      throw new Error(
        `firebase.storage.StorageReference.putString(*, _, _) 'string' expects a string value.`,
      );
    }

    if (!Object.values(StorageStatics.StringFormat).includes(format)) {
      throw new Error(
        `firebase.storage.StorageReference.putString(_, *, _) 'format' provided is invalid, must be one of ${Object.values(
          StorageStatics.StringFormat,
        ).join(',')}.`,
      );
    }

    // TODO(salakar) change to use SettableMetadata validator
    if (!isUndefined(metadata) && !isObject(metadata)) {
      throw new Error(
        `firebase.storage.StorageReference.putString(_, _, *) 'metadata' must be an object value if provided.`,
      );
    }

    let _string = string;
    let _format = format;
    let _metadata = metadata;

    if (format === StorageStatics.StringFormat.RAW) {
      _string = Base64.btoa(_string);
      _format = StorageStatics.StringFormat.BASE64;
    } else if (format === StorageStatics.StringFormat.DATA_URL) {
      const { mediaType, base64String } = getDataUrlParts(_string);
      if (isUndefined(base64String)) {
        throw new Error(
          `firebase.storage.StorageReference.putString(*, _, _) invalid data_url string provided.`,
        );
      }

      if (isUndefined(metadata) || isUndefined(metadata.contentType)) {
        if (isUndefined(metadata)) _metadata = {};
        _metadata.contentType = mediaType;
        _string = base64String;
        _format = StorageStatics.StringFormat.BASE64;
      }
    }

    // TODO(salakar) should return StorageTask
    return this._storage.native.putString(this.toString(), _string, _format, _metadata);
  }

  putFile(filePath, metadata) {
    // TODO(salakar) validate args
    let _filePath = filePath.replace('file://', '');
    if (_filePath.includes('%')) _filePath = decodeURIComponent(_filePath);
    return new StorageUploadTask(this, _filePath, metadata);
  }
}
