/**
 * 
 * AdMob representation wrapper
 */
import { SharedEventEmitter } from '../../utils/events';
import { getLogger } from '../../utils/log';
import { getNativeModule } from '../../utils/native';
import ModuleBase from '../../utils/ModuleBase';
import Interstitial from './Interstitial';
import RewardedVideo from './RewardedVideo';
import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';
import Banner from './Banner';
import NativeExpress from './NativeExpress';
import EventTypes, { NativeExpressEventTypes, RewardedVideoEventTypes } from './EventTypes';
const NATIVE_EVENTS = ['interstitial_event', 'rewarded_video_event'];
export const MODULE_NAME = 'RNFirebaseAdMob';
export const NAMESPACE = 'admob';
export default class AdMob extends ModuleBase {
  constructor(app) {
    super(app, {
      events: NATIVE_EVENTS,
      moduleName: MODULE_NAME,
      hasMultiAppSupport: false,
      hasCustomUrlSupport: false,
      namespace: NAMESPACE
    });
    this._initialized = false;
    this._appId = null;
    SharedEventEmitter.addListener('interstitial_event', this._onInterstitialEvent.bind(this));
    SharedEventEmitter.addListener('rewarded_video_event', this._onRewardedVideoEvent.bind(this));
  }

  _onInterstitialEvent(event) {
    const {
      adUnit
    } = event;
    const jsEventType = `interstitial_${adUnit}`;

    if (SharedEventEmitter.listeners(jsEventType).length === 0) {// TODO
    }

    SharedEventEmitter.emit(jsEventType, event);
  }

  _onRewardedVideoEvent(event) {
    const {
      adUnit
    } = event;
    const jsEventType = `rewarded_video_${adUnit}`;

    if (SharedEventEmitter.listeners(jsEventType).length === 0) {// TODO
    }

    SharedEventEmitter.emit(jsEventType, event);
  }

  initialize(appId) {
    if (this._initialized) {
      getLogger(this).warn('AdMob has already been initialized!');
    } else {
      this._initialized = true;
      this._appId = appId;
      getNativeModule(this).initialize(appId);
    }
  }

  openDebugMenu() {
    if (!this._initialized) {
      getLogger(this).warn('AdMob needs to be initialized before opening the dev menu!');
    } else {
      getLogger(this).info('Opening debug menu');
      getNativeModule(this).openDebugMenu(this._appId);
    }
  }

  interstitial(adUnit) {
    return new Interstitial(this, adUnit);
  }

  rewarded(adUnit) {
    return new RewardedVideo(this, adUnit);
  }

}
export const statics = {
  Banner,
  NativeExpress,
  AdRequest,
  VideoOptions,
  EventTypes,
  RewardedVideoEventTypes,
  NativeExpressEventTypes
};