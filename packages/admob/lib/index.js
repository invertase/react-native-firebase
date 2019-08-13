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

import version from './version';
import AdsConsentDebugGeography from './AdsConsentDebugGeography';
import AdsConsentStatus from './AdsConsentStatus';
import MaxAdContentRating from './MaxAdContentRating';
import TestIds from './TestIds';

import AdEventType from './AdEventType';
import RewardedAdEventType from './RewardedAdEventType';

import validateAdRequestConfiguration from './validateAdRequestConfiguration';
import { isObject } from '@react-native-firebase/common';

const statics = {
  AdsConsentDebugGeography,
  AdsConsentStatus,
  AdEventType,
  RewardedAdEventType,
  MaxAdContentRating,
  TestIds,
};

const namespace = 'admob';

const nativeModuleName = ['RNFBAdMobModule', 'RNFBAdMobInterstitialModule', 'RNFBAdMobRewardedModule'];

class FirebaseAdMobModule extends FirebaseModule {

  constructor(...args) {
    super(...args);

    this.emitter.addListener('admob_interstitial_event', (event) => {
      console.log(event)
      this.emitter.emit(
        `admob_interstitial_event:${event.adUnitId}:${event.requestId}`,
        event,
      );
    });

    this.emitter.addListener('admob_rewarded_event', (event) => {
      this.emitter.emit(
        `admob_rewarded_event:${event.adUnitId}:${event.requestId}`,
        event,
      );
    });
  }

  setRequestConfiguration(requestConfiguration) {
    if (!isObject(requestConfiguration)) {
      throw new Error(
        `firebase.admob().setRequestConfiguration(*) 'requestConfiguration' expected an object value.`
      );
    }

    let config;
    try {
      config = validateAdRequestConfiguration(requestConfiguration);
    } catch (e) {
      throw new Error(
        `firebase.admob().setRequestConfiguration(*) ${e.message}`
      );
    }

    return this.native.setRequestConfiguration(config);
  }

  openDebugMenu(adUnitId) {
    return this.native.openDebugMenu(adUnitId);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/admob';
export const SDK_VERSION = version;

// import admob from '@react-native-firebase/admob';
// admob().X(...);
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

// import admob, { firebase } from '@react-native-firebase/admob';
// admob().X(...);
// firebase.admob().X(...);
export const firebase = getFirebaseRoot();

export AdsConsentDebugGeography from './AdsConsentDebugGeography';
export AdsConsentStatus from './AdsConsentStatus';
export MaxAdContentRating from './MaxAdContentRating';
export TestIds from './TestIds';
export AdEventType from './AdEventType';
export RewardedAdEventType from './RewardedAdEventType';

export AdsConsent from './AdsConsent';

export InterstitialAd from './ads/InterstitialAd';
export RewardedAd from './ads/RewardedAd';
export BannerAd from './ads/BannerAd';

