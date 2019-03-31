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

import { ReferenceBase } from '@react-native-firebase/common';
import StorageTask, { UPLOAD_TASK, DOWNLOAD_TASK } from './StorageTask';
import { validateMetadata } from './SettableMetadata';

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
    return this._storage.native.delete(this.path);
  }

  getDownloadURL() {
    return this._storage.native.getDownloadURL(this.path);
  }

  getMetadata() {
    return this._storage.native.getMetadata(this.path);
  }

  updateMetadata(metadata) {
    validateMetadata(metadata);
    return this._storage.native.updateMetadata(this.path, metadata);
  }

  downloadFile(filePath) {
    return new StorageTask(
      DOWNLOAD_TASK,
      this._storage.native.downloadFile(this.path, filePath),
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
      this._storage.native.putFile(this.path, _filePath, metadata),
      this,
    );
  }
}
