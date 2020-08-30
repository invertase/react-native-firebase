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

export default function buildSocial(socialParameters) {
  if (!isObject(socialParameters)) {
    throw new Error("'dynamicLinksParams.social' must be an object.");
  }

  const params = {};

  if (socialParameters.descriptionText) {
    if (!isString(socialParameters.descriptionText)) {
      throw new Error("'dynamicLinksParams.social.descriptionText' must be a string.");
    }

    params.descriptionText = socialParameters.descriptionText;
  }

  if (socialParameters.imageUrl) {
    if (!isString(socialParameters.imageUrl)) {
      throw new Error("'dynamicLinksParams.social.imageUrl' must be a string.");
    }

    params.imageUrl = socialParameters.imageUrl;
  }

  if (socialParameters.title) {
    if (!isString(socialParameters.title)) {
      throw new Error("'dynamicLinksParams.social.title' must be a string.");
    }

    params.title = socialParameters.title;
  }

  return params;
}
