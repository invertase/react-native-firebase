import React, { Component } from 'react';
import { View, Button, Platform } from 'react-native';
import fb from './firebase';

global.Promise = require('bluebird');

const unitId = {
  ...Platform.select({
    android: {
      banner: 'ca-app-pub-3940256099942544/6300978111',
      express: 'ca-app-pub-3940256099942544/2793859312',
      interstitial: 'ca-app-pub-3940256099942544/1033173712',
      rewarded: 'ca-app-pub-3940256099942544/5224354917',
    },
    ios: {
      banner: 'ca-app-pub-3940256099942544/6300978111',
      express: 'ca-app-pub-3940256099942544/4270592515',
      interstitial: 'ca-app-pub-3940256099942544/1033173712',
      rewarded: 'ca-app-pub-3940256099942544/1712485313',
    },
  }),
};

const firebase = fb.native;

// Components
const Banner = firebase.admob.Banner;
const NativeExpress = firebase.admob.NativeExpress;

// API
const interstitial = firebase.admob().interstitial(unitId.interstitial);
interstitial.loadAd();

const rewarded = firebase.admob().rewarded(unitId.rewarded);
rewarded.loadAd();


function bootstrap() {
  // Remove logging on production
  if (!__DEV__) {
    console.log = () => {
    };
    console.warn = () => {
    };
    console.error = () => {
    };
    console.disableYellowBox = true;
  }

  class Root extends Component {

    showInterstitial() {
      interstitial.show();
    };

    showRewarded() {
      rewarded.show();
    }

    render() {
      return (
        <View>
          <Banner
            unitId={unitId.banner}
            size={'SMART_BANNER'}
          />
          <NativeExpress
            unitId={'ca-app-pub-3940256099942544/2793859312'}
            size={'300x200'}
          />
          <Button
            title={'Show Interstitial'}
            onPress={this.showInterstitial}
          />
          <Button
            title={'Show Rewarded Video'}
            onPress={this.showRewarded}
          />
        </View>
      );
    }
  }

  return Root;
}

export default bootstrap();
