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

import NativeError from '@react-native-firebase/app/lib/internal/NativeFirebaseError';
import AdEventType from '../AdEventType';
import RewardedAdEventType from '../RewardedAdEventType';

export default class MobileAd {
  constructor(type, admob, requestId, adUnitId, requestOptions) {
    this._type = type;
    this._admob = admob;
    this._requestId = requestId;
    this._adUnitId = adUnitId;
    this._requestOptions = requestOptions;

    this._loaded = false;
    this._onAdEventHandler = null;

    this._nativeListener = admob.emitter.addListener(
      `admob_${type}_event:${adUnitId}:${requestId}`,
      this._handleAdEvent.bind(this),
    );
  }

  _handleAdEvent(event) {
    const { type, error, data } = event.body;

    if (type === AdEventType.LOADED || type === RewardedAdEventType.LOADED) {
      this._loaded = true;
    }

    if (type === AdEventType.CLOSED || type === RewardedAdEventType.CLOSED) {
      this._loaded = false;
    }

    if (this._onAdEventHandler) {
      let nativeError;
      if (error) {
        nativeError = NativeError.fromEvent(error, 'admob');
      }

      this._onAdEventHandler(type, nativeError, data);
    }
  }

  _setAdEventHandler(handler) {
    this._onAdEventHandler = handler;
    return () => this._nativeListener.remove();
  }

  get adUnitId() {
    return this._adUnitId;
  }

  get loaded() {
    return this._loaded;
  }
}
