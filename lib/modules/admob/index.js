import Interstitial from './Interstitial';
import AdRequest from './AdRequest';
import Banner from './Banner';
import Base from './../base';

const FirebaseAdMob = NativeModules.RNFirebaseAdMob;
const FirebaseAdMobEvt = new NativeEventEmitter(FirebaseAdMob);

export default class Admob extends Base {

  interstitial(adUnit: string) {
    return new Interstitial(this, FirebaseAdMobEvt, adUnit);
  }

}

export const statics = {
  Banner,
  AdRequest,
};
