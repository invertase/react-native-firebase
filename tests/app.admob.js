import React, { Component } from 'react';
import { View, Button, Platform, AppRegistry } from 'react-native';
import firebase from 'react-native-firebase';

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

// Components
const { Banner, NativeExpress } = firebase.admob;

// API
const interstitial = firebase.admob().interstitial(unitId.interstitial);
interstitial.loadAd();

const rewarded = firebase.admob().rewarded(unitId.rewarded);
rewarded.loadAd();

class Root extends Component {
  showInterstitial() {
    interstitial.show();
  }

  showRewarded() {
    rewarded.show();
  }

  render() {
    return (
      <View style={{ paddingTop: 100 }}>
        <Banner unitId={unitId.banner} size="SMART_BANNER" />
        <NativeExpress
          unitId="ca-app-pub-3940256099942544/2793859312"
          size="300x200"
        />
        <Button title="Show Interstitial" onPress={this.showInterstitial} />
        <Button title="Show Rewarded Video" onPress={this.showRewarded} />
      </View>
    );
  }
}

AppRegistry.registerComponent('testing', () => Root);
