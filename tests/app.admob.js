/* eslint-disable no-console */
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

import React, { useEffect, Component } from 'react';
import { AppRegistry, Image, StyleSheet, View, Text } from 'react-native';

import { AdsConsent, InterstitialAd, RewardedAd } from '@react-native-firebase/admob';
import firebase from '@react-native-firebase/app';

function Root() {

  async function init() {
    // await AdsConsent.setDebugGeography(1);
    // const p = await AdsConsent.getAdProviders();
    // // console.warn(p);
    // await AdsConsent.requestInfoUpdate(['pub-6189033257628751']);
    // const r = await AdsConsent.showForm({
    //   privacyPolicy: 'https://invertase.io/privacy-policy',
    //   withPersonalizedAds: false,
    //   withNonPersonalizedAds: false,
    //   withAdFree: false,
    // });
    // console.log(Interstitial)
    // await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
    //   listener(event, error) {
    //     console.warn(event, error);
    //   },
    // });


    // const rewardedAd = RewardedAd.createForAdRequest('ca-app-pub-3940256099942544/5224354917', {
    //   requestNonPersonalizedAdsOnly: true,
    //   keywords: ['foo'],
    //   testDevices: ['EMULATOR'],
    //
    // });
    //
    // rewardedAd.onAdEvent(async (type, error, data) => {
    //   console.log('>>>', type, error, data);
    //
    //   if (type === 'rewarded_loaded') {
    //     rewardedAd.show();
    //   }
    // });
    //
    // rewardedAd.load();

// testing ssh - not sure the name
//     const interstitialAd = InterstitialAd.createForAdRequest('ca-app-pub-3940256099942544/1033173712', {
//       //
//     });

    // interstitialAd.onAdEvent(async (type, error) => {
    //   console.log('>>>', type, error);
    //   if (type === 'loaded') {
    //     console.log('!!!!! show')
    //     await interstitialAd.show();
    //   }
    // });
    //
    // setTimeout(() => {
    //   interstitialAd.load();
    // }, 1);
  }

  useEffect(() => {
    init().catch(console.error);
  }, []);

  return (
    <View style={[styles.container, styles.horizontal]}>
      <Text>Admob</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    height: 120,
    marginBottom: 16,
    width: 135,
  },
});

AppRegistry.registerComponent('testing', () => Root);
