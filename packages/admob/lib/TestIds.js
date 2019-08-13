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

import { Platform } from 'react-native';

export default {
  ...Platform.select({
    android: {
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
      INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
      REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    },
    ios: {
      BANNER: 'ca-app-pub-3940256099942544/2934735716',
      INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
      REWARDED: 'ca-app-pub-3940256099942544/1712485313',
    },
  }),
};
