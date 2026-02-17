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

import { createDeprecationProxy } from '@react-native-firebase/app/dist/module/common';
import FirestoreDocumentSnapshot from './FirestoreDocumentSnapshot';

const TYPE_MAP: Record<string, 'added' | 'modified' | 'removed'> = {
  a: 'added',
  m: 'modified',
  r: 'removed',
};

export interface DocumentChangeNativeData {
  type: string;
  doc: { path: string; data?: unknown; metadata?: [boolean, boolean]; exists?: boolean };
  ni: number;
  oi: number;
  isMetadataChange?: boolean;
}

export default class FirestoreDocumentChange {
  _firestore: unknown;
  _nativeData: DocumentChangeNativeData;
  _isMetadataChange: boolean;
  _converter: unknown;

  constructor(firestore: unknown, nativeData: DocumentChangeNativeData, converter: unknown) {
    this._firestore = firestore;
    this._nativeData = nativeData;
    this._isMetadataChange = nativeData.isMetadataChange ?? false;
    this._converter = converter;
  }

  get doc(): FirestoreDocumentSnapshot {
    return createDeprecationProxy(
      new FirestoreDocumentSnapshot(this._firestore as any, this._nativeData.doc, this._converter),
    ) as FirestoreDocumentSnapshot;
  }

  get newIndex(): number {
    return this._nativeData.ni;
  }

  get oldIndex(): number {
    return this._nativeData.oi;
  }

  get type(): 'added' | 'modified' | 'removed' {
    return TYPE_MAP[this._nativeData.type] ?? 'modified';
  }
}
