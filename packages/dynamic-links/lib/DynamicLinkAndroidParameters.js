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

export default class DynamicLinkAndroidParameters extends MutatableParams {
  setFallbackUrl(fallbackUrl) {
    return this.set('android.fallbackUrl', fallbackUrl);
  }

  setMinimumVersion(minimumVersion) {
    return this.set('android.minimumVersion', minimumVersion);
  }

  setPackageName(packageName) {
    return this.set('android.packageName', packageName);
  }

  validate() {
    if (this.get('android') && !this.get('android.packageName')) {
      throw new Error('DynamicLinkAndroidParameters: Missing required `packageName` property');
    }
  }
}
