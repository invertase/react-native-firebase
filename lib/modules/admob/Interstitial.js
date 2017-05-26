import { NativeModules } from 'react-native';

const FirebaseAdMob = NativeModules.RNFirebaseAdmob;

export default class Interstitial {

  constructor(admob: Object, eventListener: Object, adunit: string) {
    this.admob = admob;
    this.adUnit = adunit;

    eventListener.addListener('interstitial_event', this._onInterstitialEvent.bind(this));
  }

  _onInterstitialEvent(event) {

  }

  loadAd(request: AdRequest) {
    return FirebaseAdMob.interstitialLoadAd(this.adUnit, request);
  }

  isLoaded() {
    return true;
  }

  show() {
    return FirebaseAdMob.interstitialShowAd(this.adUnit);
  }
}
