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

import { isObject, isString } from '@react-native-firebase/app/lib/common';

export default function buildIos(iosParams) {
  if (!isObject(iosParams)) {
    throw new Error("'dynamicLinksParams.ios' must be an object.");
  }

  const params = {};

  if (iosParams.appStoreId) {
    if (!isString(iosParams.appStoreId)) {
      throw new Error("'dynamicLinksParams.ios.appStoreId' must be a string.");
    }

    params.appStoreId = iosParams.appStoreId;
  }

  if (iosParams.bundleId) {
    if (!isString(iosParams.bundleId)) {
      throw new Error("'dynamicLinksParams.ios.bundleId' must be a string.");
    }

    params.bundleId = iosParams.bundleId;
  }

  if (iosParams.customScheme) {
    if (!isString(iosParams.customScheme)) {
      throw new Error("'dynamicLinksParams.ios.customScheme' must be a string.");
    }

    params.customScheme = iosParams.customScheme;
  }

  if (iosParams.fallbackUrl) {
    if (!isString(iosParams.fallbackUrl)) {
      throw new Error("'dynamicLinksParams.ios.fallbackUrl' must be a string.");
    }

    params.fallbackUrl = iosParams.fallbackUrl;
  }

  if (iosParams.iPadBundleId) {
    if (!isString(iosParams.iPadBundleId)) {
      throw new Error("'dynamicLinksParams.ios.iPadBundleId' must be a string.");
    }

    params.iPadBundleId = iosParams.iPadBundleId;
  }

  if (iosParams.iPadFallbackUrl) {
    if (!isString(iosParams.iPadFallbackUrl)) {
      throw new Error("'dynamicLinksParams.ios.iPadFallbackUrl' must be a string.");
    }

    params.iPadFallbackUrl = iosParams.iPadFallbackUrl;
  }

  if (iosParams.minimumVersion) {
    if (!isString(iosParams.minimumVersion)) {
      throw new Error("'dynamicLinksParams.ios.minimumVersion' must be a string.");
    }

    params.minimumVersion = iosParams.minimumVersion;
  }

  if (!params.bundleId) {
    throw new Error("'dynamicLinksParams.ios' missing required 'bundleId' property.");
  }

  return params;
}
