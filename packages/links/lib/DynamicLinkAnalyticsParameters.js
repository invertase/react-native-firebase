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

import MutatableParams from '@react-native-firebase/common/lib/MutatableParams';

export default class DynamicLinkAnalyticsParameters extends MutatableParams {
  setCampaign(campaign) {
    return this.set('analytics.campaign', campaign);
  }

  setContent(content) {
    return this.set('analytics.content', content);
  }

  setMedium(medium) {
    return this.set('analytics.medium', medium);
  }

  setSource(source) {
    return this.set('analytics.source', source);
  }

  setTerm(term) {
    return this.set('analytics.term', term);
  }
}
