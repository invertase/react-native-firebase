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

import StorageTask, { UPLOAD_TASK, DOWNLOAD_TASK } from './task';

export default class StorageReference extends ReferenceBase {
  constructor(storage, path) {
    super(path);
    this._storage = storage;
  }

  get fullPath() {
    return this.path;
  }

  toString() {
    return `gs://${this._storage.app.options.storageBucket}${this.path}`;
  }

  child(path) {
    return new StorageReference(this._storage, `${this.path}/${path}`);
  }

  delete() {
    return getNativeModule(this._storage).delete(this.path);
  }

  getDownloadURL() {
    return getNativeModule(this._storage).getDownloadURL(this.path);
  }

  getMetadata() {
    return getNativeModule(this._storage).getMetadata(this.path);
  }

  updateMetadata(metadata) {
    return getNativeModule(this._storage).updateMetadata(this.path, metadata);
  }

  downloadFile(filePath) {
    return new StorageTask(
      DOWNLOAD_TASK,
      getNativeModule(this._storage).downloadFile(this.path, filePath),
      this,
    );
  }

  get put() {
    return this.putFile;
  }

  putFile(filePath, metadata) {
    let _filePath = filePath.replace('file://', '');
    if (_filePath.includes('%')) _filePath = decodeURI(_filePath);
    return new StorageTask(
      UPLOAD_TASK,
      getNativeModule(this._storage).putFile(this.path, _filePath, metadata),
      this,
    );
  }
}
