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
import { createDeprecationProxy } from '@react-native-firebase/app/lib/common';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';

const TYPE_MAP = {
  a: 'added',
  m: 'modified',
  r: 'removed',
};

export default class FirestoreDocumentChange {
  constructor(firestore, nativeData) {
    this._firestore = firestore;
    this._nativeData = nativeData;
    this._isMetadataChange = nativeData.isMetadataChange;
  }

  get doc() {
    return createDeprecationProxy(
      new FirestoreDocumentSnapshot(this._firestore, this._nativeData.doc),
    );
  }

  get newIndex() {
    return this._nativeData.ni;
  }

  get oldIndex() {
    return this._nativeData.oi;
  }

  get type() {
    return TYPE_MAP[this._nativeData.type];
  }
}
