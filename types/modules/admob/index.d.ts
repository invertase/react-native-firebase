/// <reference types="react" />
import ModuleBase from '../../utils/ModuleBase';
import Interstitial from './Interstitial';
import RewardedVideo from './RewardedVideo';
import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';
import * as React from 'react';
import App from '../core/firebase-app';
export declare type NativeEvent = {
    adUnit: string;
    payload: Object;
    type: string;
    [key: string]: any;
};
export declare const MODULE_NAME = "RNFirebaseAdmob";
export default class AdMob extends ModuleBase {
    private _appId?;
    private _initialized;
    static NAMESPACE: string;
    constructor(app: App);
    private _onInterstitialEvent(event);
    private _onRewardedVideoEvent(event);
    initialize(appId: string): void;
    openDebugMenu(): void;
    interstitial(adUnit: string): Interstitial;
    rewarded(adUnit: string): RewardedVideo;
}
export declare const statics: {
    Banner: React.StatelessComponent<{}>;
    NativeExpress: React.StatelessComponent<{}>;
    AdRequest: typeof AdRequest;
    VideoOptions: typeof VideoOptions;
    EventTypes: {
        onAdLoaded: string;
        onAdOpened: string;
        onAdLeftApplication: string;
        onAdClosed: string;
        onAdFailedToLoad: string;
    };
    RewardedVideoEventTypes: {
        onRewarded: string;
        onRewardedVideoStarted: string;
    };
    NativeExpressEventTypes: {
        onVideoEnd: string;
        onVideoMute: string;
        onVideoPause: string;
        onVideoPlay: string;
        onVideoStart: string;
    };
};
