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

import { hasOwnProperty, isBoolean, isObject } from '@react-native-firebase/app/lib/common';

export default function buildNavigation(navigationParams) {
  if (!isObject(navigationParams)) {
    throw new Error("'dynamicLinksParams.navigation' must be an object.");
  }

  const params = {};

  if (hasOwnProperty(navigationParams, 'forcedRedirectEnabled')) {
    if (!isBoolean(navigationParams.forcedRedirectEnabled)) {
      throw new Error("'dynamicLinksParams.navigation.forcedRedirectEnabled' must be a boolean.");
    }

    params.forcedRedirectEnabled = navigationParams.forcedRedirectEnabled;
  }

  return params;
}
