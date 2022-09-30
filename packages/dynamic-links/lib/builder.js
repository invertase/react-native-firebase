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
import buildAnalytics from './builders/analytics';
import buildAndroid from './builders/android';
import buildIos from './builders/ios';
import buildItunes from './builders/itunes';
import buildNavigation from './builders/navigation';
import buildSocial from './builders/social';
import buildOtherPlatform from './builders/otherPlatform';

export default function build(dynamicLinksParams) {
  if (!isObject(dynamicLinksParams)) {
    throw new Error("'dynamicLinksParams' must be an object.");
  }

  const {
    link,
    domainUriPrefix,
    android,
    analytics,
    ios,
    itunes,
    navigation,
    social,
    otherPlatform,
  } = dynamicLinksParams;

  if (!link) {
    throw new Error("missing required 'link' property.");
  }

  if (!isString(link)) {
    throw new Error("'link' expected a string.");
  }

  // TODO better validation?
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    throw new Error("'link' expected a well-formatted URL using the HTTP or HTTPS scheme.");
  }

  if (!domainUriPrefix) {
    throw new Error("missing required 'domainUriPrefix' property.");
  }

  if (!isString(domainUriPrefix)) {
    throw new Error("'domainUriPrefix' expected a string.");
  }

  if (!domainUriPrefix.startsWith('http://') && !domainUriPrefix.startsWith('https://')) {
    throw new Error(
      "'domainUriPrefix' expected a well-formatted URL using the HTTP or HTTPS scheme.",
    );
  }

  const params = {
    link,
    domainUriPrefix,
  };

  if (analytics) {
    params.analytics = buildAnalytics(analytics);
  }

  if (android) {
    params.android = buildAndroid(android);
  }

  if (ios) {
    params.ios = buildIos(ios);
  }

  if (itunes) {
    params.itunes = buildItunes(itunes);
  }

  if (navigation) {
    params.navigation = buildNavigation(navigation);
  }

  if (social) {
    params.social = buildSocial(social);
  }

  if (otherPlatform) {
    params.otherPlatform = buildOtherPlatform(otherPlatform);
  }

  return params;
}
