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
  hasOwnProperty,
  isInteger,
  isNumber,
  isObject,
  isString,
  isUndefined,
  pathChild,
  pathLastComponent,
  pathParent,
  ReferenceBase,
  toFilePath,
  isModularCall,
} from '@react-native-firebase/app/dist/module/common';
import StorageDownloadTask from './StorageDownloadTask';
import StorageListResult, { provideStorageReferenceClass } from './StorageListResult';
import { StringFormat } from './StorageStatics';
import StorageUploadTask from './StorageUploadTask';
import { validateMetadata } from './utils';
import type {
  StorageReference,
  SettableMetadata,
  ListOptions,
  FullMetadata,
  Task,
  Storage,
} from './types/storage';
import type { ListResultInternal, StorageInternal } from './types/internal';

export default class Reference extends ReferenceBase implements StorageReference {
  _storage: StorageInternal;

  constructor(storage: StorageInternal, path: string) {
    super(path);
    this._storage = storage;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#bucket
   */
  get bucket(): string {
    return this._storage._customUrlOrRegion!.replace('gs://', '');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#fullPath
   */
  get fullPath(): string {
    return this.path;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#name
   */
  get name(): string {
    return pathLastComponent(this.path);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#parent
   */
  get parent(): StorageReference | null {
    const parentPath = pathParent(this.path);
    if (parentPath === null) {
      return parentPath;
    }
    return new Reference(this._storage, parentPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#root
   */
  get root(): StorageReference {
    return new Reference(this._storage, '/');
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#storage
   */
  get storage(): Storage {
    return this._storage;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#child
   */
  child(path: string): StorageReference {
    const childPath = pathChild(this.path, path);
    return new Reference(this._storage, childPath);
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#delete
   */
  delete(): Promise<void> {
    return this._storage.native.delete(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getDownloadURL
   */
  getDownloadURL(): Promise<string> {
    return this._storage.native.getDownloadURL(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#getMetadata
   */
  getMetadata(): Promise<FullMetadata> {
    return this._storage.native.getMetadata(this.toString());
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#list
   */
  list(options?: ListOptions): Promise<StorageListResult> {
    if (!isUndefined(options) && !isObject(options)) {
      throw new Error(
        "firebase.storage.StorageReference.list(*) 'options' expected an object value.",
      );
    }

    const listOptions: { maxResults: number; pageToken?: string } = {
      maxResults: 1000,
    };

    const isModular = isModularCall(arguments);

    if (options) {
      if (hasOwnProperty(options, 'maxResults')) {
        const maxResults = options.maxResults;
        // Modular typings allow `null` for omission - ignore safely.
        if (isModular && (maxResults === null || isUndefined(maxResults))) {
          // no-op (keep default)
        } else {
          if (!isNumber(maxResults) || !isInteger(maxResults)) {
            throw new Error(
              "firebase.storage.StorageReference.list(*) 'options.maxResults' expected a number value.",
            );
          }

          if (maxResults < 1 || maxResults > 1000) {
            throw new Error(
              "firebase.storage.StorageReference.list(*) 'options.maxResults' expected a number value between 1-1000.",
            );
          }

          listOptions.maxResults = maxResults;
        }
      }

      if (hasOwnProperty(options, 'pageToken')) {
        const pageToken = options.pageToken;
        // Modular typings allow `null` for omission - ignore safely.
        if (isModular && (pageToken === null || isUndefined(pageToken))) {
          // no-op
        } else if (!isUndefined(pageToken) && pageToken !== null) {
          if (!isString(pageToken)) {
            throw new Error(
              "firebase.storage.StorageReference.list(*) 'options.pageToken' expected a string value.",
            );
          }

          listOptions.pageToken = pageToken;
        }
      }
    }

    return this._storage.native
      .list(this.toString(), listOptions)
      .then((data: ListResultInternal) => new StorageListResult(this._storage, data));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#listAll
   */
  listAll(): Promise<StorageListResult> {
    return this._storage.native
      .listAll(this.toString())
      .then((data: ListResultInternal) => new StorageListResult(this._storage, data));
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#put
   */
  put(data: Blob | Uint8Array | ArrayBuffer, metadata?: SettableMetadata): Task {
    if (!isUndefined(metadata)) {
      validateMetadata(metadata, false);
    }

    return new StorageUploadTask(this, task =>
      Base64.fromData(data).then(({ string, format }) => {
        const { _string, _format, _metadata } = this._updateString(
          string as string,
          format,
          metadata,
          false,
        );
        return this._storage.native.putString(
          this.toString(),
          _string,
          _format,
          _metadata,
          task._id,
        );
      }),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#putString
   */
  putString(
    string: string,
    format: (typeof StringFormat)[keyof typeof StringFormat] = StringFormat.RAW,
    metadata?: SettableMetadata,
  ): Task {
    const { _string, _format, _metadata } = this._updateString(string, format, metadata, false);

    return new StorageUploadTask(this, task =>
      this._storage.native.putString(this.toString(), _string, _format, _metadata, task._id),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#fullPath
   */
  toString(): string {
    if (this.path.length <= 1) {
      return `${this._storage._customUrlOrRegion}`;
    }

    return `${this._storage._customUrlOrRegion}/${this.path}`;
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference#updateMetadata
   */
  updateMetadata(metadata: SettableMetadata): Promise<FullMetadata> {
    validateMetadata(metadata);
    return this._storage.native.updateMetadata(this.toString(), metadata);
  }

  /* ----------------------------------------
   *   EXTRA APIS (DO NOT ON EXIST WEB SDK)
   * ---------------------------------------- */

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
   */
  writeToFile(filePath: string): Task {
    if (!isString(filePath)) {
      throw new Error(
        "firebase.storage.StorageReference.writeToFile(*) 'filePath' expects a string value.",
      );
    }

    return new StorageDownloadTask(this, task =>
      this._storage.native.writeToFile(this.toString(), toFilePath(filePath), task._id),
    );
  }

  /**
   * @url https://firebase.google.com/docs/reference/js/firebase.storage.Reference
   */
  putFile(filePath: string, metadata?: SettableMetadata): Task {
    if (!isUndefined(metadata)) {
      validateMetadata(metadata, false);
    }

    if (!isString(filePath)) {
      throw new Error(
        "firebase.storage.StorageReference.putFile(*, _) 'filePath' expects a string value.",
      );
    }

    return new StorageUploadTask(this, task =>
      this._storage.native.putFile(this.toString(), toFilePath(filePath), metadata, task._id),
    );
  }

  _updateString(
    string: string,
    format: (typeof StringFormat)[keyof typeof StringFormat],
    metadata: SettableMetadata | undefined,
    update = false,
  ): { _string: string; _format: string; _metadata: SettableMetadata | undefined } {
    if (!isString(string)) {
      throw new Error(
        "firebase.storage.StorageReference.putString(*, _, _) 'string' expects a string value.",
      );
    }

    if (!Object.values(StringFormat).includes(format)) {
      throw new Error(
        `firebase.storage.StorageReference.putString(_, *, _) 'format' provided is invalid, must be one of ${Object.values(
          StringFormat,
        ).join(',')}.`,
      );
    }

    if (!isUndefined(metadata)) {
      validateMetadata(metadata, update);
    }

    let _string = string;
    let _format = format;
    let _metadata = metadata;

    if (format === StringFormat.RAW) {
      _string = Base64.btoa(_string);
      _format = StringFormat.BASE64;
    } else if (format === StringFormat.DATA_URL) {
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
        _metadata!.contentType = mediaType;
        _string = base64String;
        _format = StringFormat.BASE64;
      }
    }
    return { _string, _metadata, _format };
  }
}

provideStorageReferenceClass(Reference);
