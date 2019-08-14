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
  hasOwnProperty,
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
  isUndefined,
  isValidUrl,
} from '@react-native-firebase/app/lib/common';

export default function validateAdRequestOptions(options) {
  const out = {};

  if (isUndefined(options)) {
    return out;
  }

  if (!isObject(options)) {
    throw new Error("'options' expected an object value");
  }

  if (hasOwnProperty(options, 'requestNonPersonalizedAdsOnly')) {
    if (!isBoolean(options.requestNonPersonalizedAdsOnly)) {
      throw new Error("'options.requestNonPersonalizedAdsOnly' expected a boolean value");
    }

    out.requestNonPersonalizedAdsOnly = options.requestNonPersonalizedAdsOnly;
  }

  if (options.networkExtras) {
    if (!isObject(options.networkExtras)) {
      throw new Error("'options.networkExtras' expected an object of key/value pairs");
    }

    Object.entries(options.networkExtras).forEach(([key, value]) => {
      if (!isString(value)) {
        throw new Error(`'options.networkExtras' expected a string value for object key "${key}"`);
      }
    });

    out.networkExtras = options.networkExtras;
  }

  if (options.keywords) {
    if (!isArray(options.keywords)) {
      throw new Error("'options.keywords' expected an array containing string values");
    }

    for (let i = 0; i < options.keywords.length; i++) {
      const keyword = options.keywords[i];

      if (!isString(keyword)) {
        throw new Error("'options.keywords' expected an array containing string values");
      }
    }

    out.keywords = options.keywords;
  }

  if (options.testDevices) {
    if (!isArray(options.testDevices)) {
      throw new Error("'options.testDevices' expected an array containing string values");
    }

    for (let i = 0; i < options.testDevices.length; i++) {
      const device = options.testDevices[i];

      if (!isString(device)) {
        throw new Error("'options.testDevices' expected an array containing string values");
      }
    }

    out.testDevices = options.testDevices;
  }

  if (options.contentUrl) {
    if (!isString(options.contentUrl)) {
      throw new Error("'options.contentUrl' expected a string value");
    }

    if (!isValidUrl(options.contentUrl)) {
      throw new Error("'options.contentUrl' expected a valid HTTP or HTTPS url.");
    }

    if (options.contentUrl.length > 512) {
      throw new Error("'options.contentUrl' maximum length of a content URL is 512 characters.");
    }

    out.contentUrl = options.contentUrl;
  }

  if (options.location) {
    const error = new Error(
      "'options.location' expected an array value containing a latitude & longitude number value.",
    );

    if (!isArray(options.location)) {
      throw error;
    }

    const [latitude, longitude] = options.location;

    if (!isNumber(latitude) || !isNumber(longitude)) {
      throw error;
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error(
        `'options.location' latitude value must be a number between -90 and 90, but was: ${latitude}`,
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error(
        `'options.location' longitude value must be a number between -180 and 180, but was: ${latitude}`,
      );
    }

    out.location = [latitude, longitude];
  }

  if (hasOwnProperty(options, 'locationAccuracy')) {
    if (!isNumber(options.locationAccuracy)) {
      throw new Error("'options.locationAccuracy' expected a number value.");
    }

    if (options.locationAccuracy < 0) {
      throw new Error("'options.locationAccuracy' expected a number greater than 0.");
    }

    out.locationAccuracy = options.locationAccuracy;
  } else {
    out.locationAccuracy = 5;
  }

  if (options.requestAgent) {
    if (!isString(options.requestAgent)) {
      throw new Error("'options.requestAgent' expected a string value");
    }

    out.requestAgent = options.requestAgent;
  }

  return out;
}
