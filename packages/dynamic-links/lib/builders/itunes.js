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

export default function buildiTunes(itunesParams) {
  if (!isObject(itunesParams)) {
    throw new Error("'dynamicLinksParams.itunes' must be an object.");
  }

  const params = {};

  if (itunesParams.affiliateToken) {
    if (!isString(itunesParams.affiliateToken)) {
      throw new Error("'dynamicLinksParams.itunes.affiliateToken' must be a string.");
    }

    params.affiliateToken = itunesParams.affiliateToken;
  }

  if (itunesParams.campaignToken) {
    if (!isString(itunesParams.campaignToken)) {
      throw new Error("'dynamicLinksParams.itunes.campaignToken' must be a string.");
    }

    params.campaignToken = itunesParams.campaignToken;
  }

  if (itunesParams.providerToken) {
    if (!isString(itunesParams.providerToken)) {
      throw new Error("'dynamicLinksParams.itunes.providerToken' must be a string.");
    }

    params.providerToken = itunesParams.providerToken;
  }

  return params;
}
