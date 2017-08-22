import ModuleBase from './../../utils/ModuleBase';

import Interstitial from './Interstitial';
import RewardedVideo from './RewardedVideo';
import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';
import Banner from './Banner';
import NativeExpress from './NativeExpress';

import EventTypes, {
  NativeExpressEventTypes,
  RewardedVideoEventTypes,
} from './EventTypes';

export default class AdMob extends ModuleBase {
  static _NAMESPACE = 'admob';
  static _NATIVE_MODULE = 'RNFirebaseAdMob';

  constructor(firebaseApp: Object, options: Object = {}) {
    super(firebaseApp, options, true);

    this._initialized = false;
    this._appId = null;

    this._eventEmitter.addListener('interstitial_event', this._onInterstitialEvent.bind(this));
    this._eventEmitter.addListener('rewarded_video_event', this._onRewardedVideoEvent.bind(this));
  }

  _onInterstitialEvent(event) {
    const { adUnit } = event;
    const jsEventType = `interstitial_${adUnit}`;

    if (!this.hasListeners(jsEventType)) {
      // TODO
    }

    this.emit(jsEventType, event);
  }

  _onRewardedVideoEvent(event) {
    const { adUnit } = event;
    const jsEventType = `rewarded_video_${adUnit}`;

    if (!this.hasListeners(jsEventType)) {
      // TODO
    }

    this.emit(jsEventType, event);
  }

  initialize(appId: string) {
    if (this._initialized) {
      this.log.warn('AdMob has already been initialized!');
    } else {
      this._initialized = true;
      this._appId = appId;
      this._native.initialize(appId);
    }
  }

  openDebugMenu() {
    if (!this._initialized) {
      this.log.warn('AdMob needs to be initialized before opening the dev menu!');
    } else {
      this.log.info('Opening debug menu');
      this._native.openDebugMenu(this._appId);
    }
  }

  interstitial(adUnit: string) {
    return new Interstitial(this, adUnit);
  }

  rewarded(adUnit: string) {
    return new RewardedVideo(this, adUnit);
  }

  get namespace(): string {
    return 'firebase:admob';
  }
}

export const statics = {
  Banner,
  NativeExpress,
  AdRequest,
  VideoOptions,
  EventTypes,
  RewardedVideoEventTypes,
  NativeExpressEventTypes,
};
