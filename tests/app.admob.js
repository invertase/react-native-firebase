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

import {
  AdsConsent,
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
} from '@react-native-firebase/admob';
import firebase from '@react-native-firebase/app';

function Root() {
  async function init() {
    await AdsConsent.setDebugGeography(1);

    const foo = await AdsConsent.requestInfoUpdate(['pub-4406399463942824']);
    console.warn(foo);
    const r = await AdsConsent.showForm({
      privacyPolicy: 'https://invertase.io/privacy-policy',
      // withPersonalizedAds: true,
      // withNonPersonalizedAds: false,
      // withAdFree: false,
    });
    // console.log(r);
    //
    // const p = await AdsConsent.getAdProviders();
    // console.warn('p', p);

    // console.log(Interstitial)
    // await Interstitial.request('ca-app-pub-3940256099942544/1033173712', {
    //   listener(event, error) {
    //     console.warn(event, error);
    //   },
    // });

    // const options = {
    //   requestNonPersonalizedAdsOnly: true,
    //   networkExtras: {
    //     user: '123',
    //     foo: 'bar',
    //     npa: '1',
    //   },
    //   keywords: ['foo'],
    //   testDevices: ['EMULATOR'],
    //   location: [53.481073, -2.237074],
    //   requestAgent: 'CoolAds',
    // };
    //
    //
    // const rewardedAd = RewardedAd.createForAdRequest(TestIds.REWARDED, options);
    // //
    // // rewardedAd.onAdEvent(console.log);
    // //
    // // rewardedAd.load();
    //
    // rewardedAd.onAdEvent(async (type, error, data) => {
    //   console.log('>>>', type, error, data);
    //
    //   if (type === 'rewarded_loaded') {
    //     await rewardedAd.show();
    //   }
    // });
    // //
    // rewardedAd.load();
  }

  // testing ssh - not sure the name
  //     const interstitialAd = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  //       //
  //     });
  //     await interstitialAd.show();
  //
  //     interstitialAd.onAdEvent(async (type, error) => {
  //       console.log('>>>', type, error);
  //       if (type === 'loaded') {
  //         console.log('!!!!! show')
  //       }
  //     });
  //
  //     interstitialAd.load();
  //   }

  useEffect(() => {
    init().catch(console.error);
  }, []);

  return (
    <View style={[styles.container, styles.horizontal]}>
      <Text>Hello</Text>
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
