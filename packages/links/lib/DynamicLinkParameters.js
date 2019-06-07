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

import DynamicLinkAnalyticsParameters from './DynamicLinkAnalyticsParameters';
import DynamicLinkAndroidParameters from './DynamicLinkAndroidParameters';
import DynamicLinkIOSParameters from './DynamicLinkIOSParameters';
import DynamicLinkItunesParameters from './DynamicLinkItunesParameters';
import DynamicLinkNavigationParameters from './DynamicLinkNavigationParameters';
import DynamicLinkSocialParameters from './DynamicLinkSocialParameters';
import MutatableParams from './MutatableParams';

export default class DynamicLinkParameters extends MutatableParams {
  constructor(link, domainURIPrefix) {
    super();
    this._link = link;
    this._domainURIPrefix = domainURIPrefix;
  }

  get analytics() {
    return new DynamicLinkAnalyticsParameters(this);
  }

  get android() {
    return new DynamicLinkAndroidParameters(this);
  }

  get ios() {
    return new DynamicLinkIOSParameters(this);
  }

  get itunes() {
    return new DynamicLinkItunesParameters(this);
  }

  get navigation() {
    return new DynamicLinkNavigationParameters(this);
  }

  get social() {
    return new DynamicLinkSocialParameters(this);
  }

  build() {
    if (this.get('analytics')) this.analytics.validate();
    if (this.get('android')) this.android.validate();
    if (this.get('ios')) this.ios.validate();
    if (this.get('itunes')) this.itunes.validate();
    if (this.get('navigation')) this.navigation.validate();
    if (this.get('social')) this.social.validate();

    return {
      link: this._link,
      domainURIPrefix: this._domainURIPrefix,
      ...this.toJSON(),
    };
  }
}
