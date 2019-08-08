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

import { NativeModules } from 'react-native';
import { isArray, isBoolean, isObject, isString, isUndefined } from '@react-native-firebase/common';

const native = NativeModules.RNFBAdmobConsentModule;

export default {
  /**
   *
   * @param publisherIds
   * @returns {*}
   */
  requestInfoUpdate(publisherIds) {
    if (!isArray(publisherIds)) {
      // todo throw
    }

    for (let i = 0; i < publisherIds.length; i++) {
      if (!isString(publisherIds[i])) {
        // todo throw
      }
    }

    // { status: UNKNOWN, isRequestLocationInEeaOrUnknown: bool }
    return native.requestInfoUpdate(publisherIds);
  },

  /**
   *
   * @param options
   * @returns {*}
   */
  showForm(options) {
    if (!isUndefined(options) && !isObject(options)) {
      // todo throw
    }

    // todo validate options
    // privacy policy required URL
    // withPersonalizedAds
    // withNonPersonalizedAds
    // withAdFree

    // { status, userPrefersAdFree }
    return native.showForm(options);
  },


  /**
   *
   */
  getAdProviders() {
    return native.getAdProviders();
  },

  /**
   *
   * @param geography
   */
  setDebugGeography(geography) {
    // todo validate
    // outside/inside of eu

    return native.setDebugGeography(geography);
  },

  /**
   *
   * @param status
   */
  setStatus(status) {
    // status: personalized, unpersonlized, unknown
    return native.setStatus(status);
  },

  /**
   *
   * @param boolean
   */
  setTagForUnderAgeOfConsent(boolean) {
    if (!isBoolean(boolean)) {
      // todo throw
    }

    return native.setTagForUnderAgeOfConsent(boolean);
  },

  /**
   *
   * @param deviceId
   */
  addTestDevice(deviceId) {
    if (!isString(deviceId)) {
      // todo throw
    }

    return native.addTestDevice(deviceId);
  }
}
