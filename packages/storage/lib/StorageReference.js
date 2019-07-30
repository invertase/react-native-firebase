/* eslint-disable no-console */
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
  isString,
  pathChild,
  pathParent,
  isUndefined,
  getDataUrlParts,
  pathLastComponent,
  ReferenceBase, isObject, hasOwnProperty, isNumber,
} from '@react-native-firebase/common';
import { validateMetadata } from './utils';
import StorageStatics from './StorageStatics';
import StorageUploadTask from './StorageUploadTask';
import StorageDownloadTask from './StorageDownloadTask';
import StorageListResult, { provideStorageReferenceClass } from './StorageListResult';

export default class StorageReference extends ReferenceBase {
  constructor(storage, path) {
    super(path);
    this._storage = storage;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#bucket
   */
  get bucket() {
    return this._storage._customUrlOrRegion.replace('gs://', '');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#fullPath
   */
  get fullPath() {
    return this.path;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#name
   */
  get name() {
    return pathLastComponent(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#parent
   */
  get parent() {
    const parentPath = pathParent(this.path);
    if (parentPath === null) {
      return parentPath;
    }
    return new StorageReference(this._storage, parentPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#root
   */
  get root() {
    return new StorageReference(this._storage, '/');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#storage
   */
  get storage() {
    return this._storage;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#child
   */
  child(path) {
    const childPath = pathChild(this.path, path);
    return new StorageReference(this._storage, childPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   */
  delete() {
    return this._storage.native.delete(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   */
  getDownloadURL() {
    return this._storage.native.getDownloadURL(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   */
  getMetadata() {
    return this._storage.native.getMetadata(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#list
   */
  list(options) {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        "firebase.storage.StorageReference.list(*) 'options' expected an object value.",
      );
    }

    const listOptions = {
      maxResults: 1000,
    };


    if (hasOwnProperty(options, 'maxResults')) {
      if (!isNumber(options.maxResults)) {
        throw new Error(
          "firebase.storage.StorageReference.list(*) 'options.maxResults' expected a number value.",
        );
      }

      // todo integer check

      if (options.maxResults < 1 || options.maxResults > 1000) {
        throw new Error(
          "firebase.storage.StorageReference.list(*) 'options.maxResults' expected a number value between 1-1000.",
        );
      }

      listOptions.maxResults = options.maxResults;
    }

    if (options.pageToken) {
      if (!isString(options.pageToken)) {
        throw new Error(
          "firebase.storage.StorageReference.list(*) 'options.pageToken' expected a string value.",
        );
      }

      listOptions.pageToken = options.pageToken;
    }


    return this._storage.native
      .list(options)
      .then(data => new StorageListResult(this._storage, data));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#listAll
   */
  listAll() {
    return this._storage.native
      .listAll()
      .then(data => new StorageListResult(this._storage, data));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#put
   */
  put(data, metadata) {
    if (!isUndefined(metadata)) {
      validateMetadata(metadata);
    }

    return Base64.fromData(data).then(({ string, format }) =>
      this.putString(string, format, metadata),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putString
   */
  putString(string, format = StorageStatics.StringFormat.RAW, metadata) {
    if (!isString(string)) {
      throw new Error(
        "firebase.storage.StorageReference.putString(*, _, _) 'string' expects a string value.",
      );
    }

    if (!Object.values(StorageStatics.StringFormat).includes(format)) {
      throw new Error(
        `firebase.storage.StorageReference.putString(_, *, _) 'format' provided is invalid, must be one of ${Object.values(
          StorageStatics.StringFormat,
        ).join(',')}.`,
      );
    }

    if (!isUndefined(metadata)) {
      validateMetadata(metadata);
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
          'firebase.storage.StorageReference.putString(*, _, _) invalid data_url string provided.',
        );
      }

      if (isUndefined(metadata) || isUndefined(metadata.contentType)) {
        if (isUndefined(metadata)) {
          _metadata = {};
        }
        _metadata.contentType = mediaType;
        _string = base64String;
        _format = StorageStatics.StringFormat.BASE64;
      }
    }

    return new StorageUploadTask(this, task =>
      this._storage.native.putString(this.toString(), _string, _format, _metadata, task._id),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#fullPath
   */
  toString() {
    if (this.path.length <= 1) {
      return this._storage._customUrlOrRegion;
    }

    return `${this._storage._customUrlOrRegion}/${this.path}`;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   */
  updateMetadata(metadata) {
    validateMetadata(metadata);
    return this._storage.native.updateMetadata(this.toString(), metadata);
  }

  /* ----------------------------------------
   *   EXTRA APIS (DO NOT ON EXIST WEB SDK)
   * ---------------------------------------- */

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
   */
  writeToFile(filePath) {
    // TODO(salakar) validate arg?
    return new StorageDownloadTask(this, task =>
      this._storage.native.writeToFile(this.toString(), filePath, task._id),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
   */
  // TODO(deprecation) remove in 6.2.
  downloadFile(filePath) {
    console.warn(
      "firebase.storage.Reference.downloadFile() is deprecated, please rename usages to 'writeToFile()'",
    );
    return this.writeToFile(filePath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
   */
  putFile(filePath, metadata) {
    if (!isUndefined(metadata)) {
      validateMetadata(metadata);
    }

    if (!isString(filePath)) {
      throw new Error(
        "firebase.storage.StorageReference.putFile(*, _) 'filePath' expects a string value.",
      );
    }

    let _filePath = filePath.replace('file://', '');
    if (_filePath.includes('%')) {
      _filePath = decodeURIComponent(_filePath);
    }
    return new StorageUploadTask(this, task =>
      this._storage.native.putFile(this.toString(), _filePath, metadata, task._id),
    );
  }
}

provideStorageReferenceClass(StorageReference);
