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

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import AdEventType from './AdEventType';
import AdsConsentDebugGeography from './AdsConsentDebugGeography';
import AdsConsentStatus from './AdsConsentStatus';
import MaxAdContentRating from './MaxAdContentRating';
import RewardedAdEventType from './RewardedAdEventType';
import BannerAdSize from './BannerAdSize';
import TestIds from './TestIds';
import validateAdRequestConfiguration from './validateAdRequestConfiguration';
import version from './version';

const statics = {
  AdsConsentDebugGeography,
  AdsConsentStatus,
  AdEventType,
  RewardedAdEventType,
  MaxAdContentRating,
  TestIds,
  BannerAdSize,
};

const namespace = 'admob';

const nativeModuleName = [
  'RNFBAdMobModule',
  'RNFBAdMobInterstitialModule',
  'RNFBAdMobRewardedModule',
];

class FirebaseAdMobModule extends FirebaseModule {
  constructor(...args) {
    super(...args);

    this.emitter.addListener('admob_interstitial_event', event => {
      this.emitter.emit(`admob_interstitial_event:${event.adUnitId}:${event.requestId}`, event);
    });

    this.emitter.addListener('admob_rewarded_event', event => {
      this.emitter.emit(`admob_rewarded_event:${event.adUnitId}:${event.requestId}`, event);
    });
  }

  setRequestConfiguration(requestConfiguration) {
    let config;
    try {
      config = validateAdRequestConfiguration(requestConfiguration);
    } catch (e) {
      throw new Error(`firebase.admob().setRequestConfiguration(*) ${e.message}`);
    }

    return this.native.setRequestConfiguration(config);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/admob';
export const SDK_VERSION = version;

export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: ['admob_interstitial_event', 'admob_rewarded_event'],
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseAdMobModule,
});

export const firebase = getFirebaseRoot();

export AdsConsentDebugGeography from './AdsConsentDebugGeography';
export AdsConsentStatus from './AdsConsentStatus';
export MaxAdContentRating from './MaxAdContentRating';
export TestIds from './TestIds';
export AdEventType from './AdEventType';
export BannerAdSize from './BannerAdSize';
export RewardedAdEventType from './RewardedAdEventType';
export AdsConsent from './AdsConsent';
export InterstitialAd from './ads/InterstitialAd';
export RewardedAd from './ads/RewardedAd';
export BannerAd from './ads/BannerAd';
