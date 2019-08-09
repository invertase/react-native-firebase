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
import { isFunction, isObject, isString, isUndefined } from '@react-native-firebase/common';
import {
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import validateAdRequestOptions from '../validateAdRequestOptions';
import AdEventType from '../AdEventType';

let _interstitialRequest = 0;

export default class InterstitialAd {

  static createForAdRequest(adUnitId, requestOptions) {
    if (!isString(adUnitId)) {
      throw new Error(
        `firebase.admob() InterstitialAd.loadAd(*) 'adUnitId' expected an string value.`,
      );
    }

    let options = {};
    try {
      options = validateAdRequestOptions(requestOptions);
    } catch (e) {
      throw new Error(
        `firebase.admob() InterstitialAd.createForAdRequest(_, *) ${e.message}.`,
      );
    }

    const requestId = _interstitialRequest++;
    const admob = getFirebaseRoot().admob();
    return new InterstitialAd(admob, requestId, adUnitId, options);
  }

  constructor(admob, requestId, adUnitId, requestOptions) {
    this._admob = admob;
    this._requestId = requestId;
    this._adUnitId = adUnitId;
    this._requestOptions = requestOptions;

    this._loading = false;
    this._loaded = false;

    this._onAdEvent = null;
    console.log(`admob_interstitial_event:${adUnitId}:${requestId}`);

    // needs to be in admob constructor
    this._nativeListener = admob.emitter.addListener(
      `admob_interstitial_event:${adUnitId}:${requestId}`,
      this._handleAdEvent.bind(this),
    );
  }

  _handleAdEvent(event) {
    const { type, error } = event.body;
    console.log('_handleAdEvent', event);

    if (type === AdEventType.LOADED) {
      this._loaded = true;
    }

    console.log('onAdEvent', this._onAdEvent);
    if (this._onAdEvent) {
      let nativeError = undefined;
      if (error) {
        nativeError = NativeError.fromEvent(error, 'admob');
      }

      this._onAdEvent(type, nativeError);
    }
  }

  get adUnitId() {
    return this._adUnitId;
  }

  get loaded() {
    return this._loaded;
  }

  load() {
    // Prevent multiple load calls
    if (this._loading) {
      return;
    }

    this._loading = true;
    this._admob.native.interstitialLoad(this._requestId, this._adUnitId, this._requestOptions);
  }

  onAdEvent(listener) {
    if (!isFunction(listener)) {
      throw new Error(
        "firebase.admob() InterstitialAd.onAdEvent(*) 'listener' expected a function."
      );
    }

    this._onAdEvent = listener;
    return () => this._nativeListener.remove();
  }

  show(showOptions) {
    if (!this.loaded) {
      throw new Error(
        "firebase.admob() InterstitialAd.show() The requested InterstitialAd has not loaded and could not be shown."
      )
    }

    let options = {
      immersiveModeEnabled: false,
    };
    // todo validate options

    return this._admob.native.interstitialShow(
      this._requestId,
      options,
    );
  }
}
