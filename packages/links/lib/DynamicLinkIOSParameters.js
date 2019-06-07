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

import MutatableParams from './MutatableParams';

export default class DynamicLinkIOSParameters extends MutatableParams {
  setAppStoreId(appStoreId) {
    return this.set('ios.appStoreId', appStoreId);
  }

  setBundleId(bundleId) {
    return this.set('ios.bundleId', bundleId);
  }

  setCustomScheme(customScheme) {
    return this.set('ios.customScheme', customScheme);
  }

  setFallbackUrl(fallbackUrl) {
    return this.set('ios.fallbackUrl', fallbackUrl);
  }

  setIPadBundleId(iPadBundleId) {
    return this.set('ios.iPadBundleId', iPadBundleId);
  }

  setIPadFallbackUrl(iPadFallbackUrl) {
    return this.set('ios.iPadFallbackUrl', iPadFallbackUrl);
  }

  setMinimumVersion(minimumVersion) {
    return this.set('ios.minimumVersion', minimumVersion);
  }

  validate() {
    if (this.get('ios') && !this.get('ios.bundleId')) {
      throw new Error('DynamicLinkIOSParameters: Missing required `bundleId` property');
    }
  }
}
