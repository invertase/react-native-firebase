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

export default function buildAnalytics(analyticsParams) {
  if (!isObject(analyticsParams)) {
    throw new Error("'dynamicLinksParams.analytics' must be an object.");
  }

  const params = {};

  if (analyticsParams.campaign) {
    if (!isString(analyticsParams.campaign)) {
      throw new Error("'dynamicLinksParams.analytics.campaign' must be a string.");
    }

    params.campaign = analyticsParams.campaign;
  }

  if (analyticsParams.content) {
    if (!isString(analyticsParams.content)) {
      throw new Error("'dynamicLinksParams.analytics.content' must be a string.");
    }

    params.content = analyticsParams.content;
  }

  if (analyticsParams.medium) {
    if (!isString(analyticsParams.medium)) {
      throw new Error("'dynamicLinksParams.analytics.medium' must be a string.");
    }

    params.medium = analyticsParams.medium;
  }

  if (analyticsParams.source) {
    if (!isString(analyticsParams.source)) {
      throw new Error("'dynamicLinksParams.analytics.source' must be a string.");
    }

    params.source = analyticsParams.source;
  }

  if (analyticsParams.term) {
    if (!isString(analyticsParams.term)) {
      throw new Error("'dynamicLinksParams.analytics.term' must be a string.");
    }

    params.term = analyticsParams.term;
  }

  return params;
}
