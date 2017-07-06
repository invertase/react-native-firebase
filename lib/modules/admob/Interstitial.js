import { NativeModules, Platform } from 'react-native';
import { statics } from './';
import AdRequest from './AdRequest';
import { nativeToJSError } from '../../utils';

const FirebaseAdMob = NativeModules.RNFirebaseAdMob;

let subscriptions = [];

export default class Interstitial {

  constructor(admob: Object, adUnit: string) {
    // Interstitials on iOS require a new instance each time
    if (Platform.OS === 'ios') {
      FirebaseAdMob.clearInterstitial(adUnit);
    }

    for (let i = 0, len = subscriptions.length; i < len; i++) {
      subscriptions[i].remove();
    }
    subscriptions = [];

    this.admob = admob;
    this.adUnit = adUnit;
    this.loaded = false;
    this.admob.removeAllListeners(`interstitial_${adUnit}`);
    this.admob.on(`interstitial_${adUnit}`, this._onInterstitialEvent);
  }

  /**
   * Handle a JS emit event
   * @param event
   * @private
   */
  _onInterstitialEvent = (event) => {
    const eventType = `interstitial:${this.adUnit}:${event.type}`;

    let emitData = Object.assign({}, event);

    switch (event.type) {
      case 'onAdLoaded':
        this.loaded = true;
        break;
      case 'onAdFailedToLoad':
        emitData = nativeToJSError(event.payload.code, event.payload.message);
        emitData.type = event.type;
        break;
      default:
    }

    this.admob.emit(eventType, emitData);
    this.admob.emit(`interstitial:${this.adUnit}:*`, emitData);
  };

  /**
   * Load an ad with an instance of AdRequest
   * @param request
   * @returns {*}
   */
  loadAd(request?: AdRequest) {
    let adRequest = request;

    if (!adRequest || !Object.keys(adRequest)) {
      adRequest = new AdRequest().addTestDevice().build();
    }

    return FirebaseAdMob.interstitialLoadAd(this.adUnit, adRequest);
  }

  /**
   * Return a local instance of isLoaded
   * @returns {boolean}
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * Show the advert - will only show if loaded
   * @returns {*}
   */
  show() {
    if (this.loaded) {
      FirebaseAdMob.interstitialShowAd(this.adUnit);
    }
  }

  /**
   * Listen to an Ad event
   * @param eventType
   * @param listenerCb
   * @returns {null}
   */
  on(eventType, listenerCb) {
    if (!statics.EventTypes[eventType]) {
      console.warn(`Invalid event type provided, must be one of: ${Object.keys(statics.EventTypes).join(', ')}`);
      return null;
    }

    const sub = this.admob.on(`interstitial:${this.adUnit}:${eventType}`, listenerCb);
    subscriptions.push(sub);
    return sub;
  }
}
