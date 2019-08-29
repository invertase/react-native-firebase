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

export default function buildAndroid(androidParams) {
  if (!isObject(androidParams)) {
    throw new Error("'dynamicLinksParams.android' must be an object.");
  }

  const params = {};

  if (androidParams.fallbackUrl) {
    if (!isString(androidParams.fallbackUrl)) {
      throw new Error("'dynamicLinksParams.android.fallbackUrl' must be a string.");
    }

    params.fallbackUrl = androidParams.fallbackUrl;
  }

  if (androidParams.minimumVersion) {
    if (!isString(androidParams.minimumVersion)) {
      throw new Error("'dynamicLinksParams.android.minimumVersion' must be a string.");
    }

    params.minimumVersion = androidParams.minimumVersion;
  }

  if (androidParams.packageName) {
    if (!isString(androidParams.packageName)) {
      throw new Error("'dynamicLinksParams.android.packageName' must be a string.");
    }

    params.packageName = androidParams.packageName;
  }

  if (!params.packageName) {
    throw new Error("'dynamicLinksParams.android' missing required 'packageName' property.");
  }

  return params;
}
