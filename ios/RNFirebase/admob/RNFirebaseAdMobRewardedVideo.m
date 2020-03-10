#import "RNFirebaseAdMobRewardedVideo.h"
#import "RNFirebaseUtil.h"

@implementation RNFirebaseAdMobRewardedVideo

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

- (id)initWithProps:(NSString *)adUnit delegate:(RNFirebaseAdMob *)delegate {
    self = [super init];
    if (self) {
        _adUnitID = adUnit;
        _delegate = delegate;
        _videoAd = [self createRewardedVideo];
    }
    return self;
}

- (GADRewardBasedVideoAd *)createRewardedVideo {
    GADRewardBasedVideoAd *videoAd = [GADRewardBasedVideoAd sharedInstance];
    videoAd.delegate = self;
    return videoAd;
}

- (void)loadAd:(NSDictionary *)request {
    [_videoAd loadRequest:[RNFirebaseAdMob buildRequest:request] withAdUnitID:_adUnitID];
}

- (void)show {
    if (_videoAd.isReady) {
        [_videoAd presentFromRootViewController:[UIApplication sharedApplication].delegate.window.rootViewController];
    }
}

- (void)sendJSEvent:(NSString *)type payload:(NSDictionary *)payload {
    [RNFirebaseUtil sendJSEvent:self.delegate name:ADMOB_REWARDED_VIDEO_EVENT body:@{
            @"type": type,
            @"adUnit": _adUnitID,
            @"payload": payload
    }];
}

- (void)rewardBasedVideoAd:(GADRewardBasedVideoAd *)rewardBasedVideoAd
   didRewardUserWithReward:(GADAdReward *)reward {
    [self sendJSEvent:@"onRewarded" payload:@{
            @"type":reward.type,
            @"amount":reward.amount,
    }];
}

- (void)rewardBasedVideoAdDidReceiveAd:(GADRewardBasedVideoAd *)rewardBasedVideoAd {
    [self sendJSEvent:@"onAdLoaded" payload:@{}];
}

- (void)rewardBasedVideoAdDidOpen:(GADRewardBasedVideoAd *)rewardBasedVideoAd {
    [self sendJSEvent:@"onAdOpened" payload:@{}];
}

- (void)rewardBasedVideoAdDidStartPlaying:(GADRewardBasedVideoAd *)rewardBasedVideoAd {
    [self sendJSEvent:@"onRewardedVideoStarted" payload:@{}];
}

- (void)rewardBasedVideoAdDidClose:(GADRewardBasedVideoAd *)rewardBasedVideoAd {
    [self sendJSEvent:@"onAdClosed" payload:@{}];
}

- (void)rewardBasedVideoAdWillLeaveApplication:(GADRewardBasedVideoAd *)rewardBasedVideoAd {
    [self sendJSEvent:@"onAdLeftApplication" payload:@{}];
}

- (void)rewardBasedVideoAd:(GADRewardBasedVideoAd *)rewardBasedVideoAd
    didFailToLoadWithError:(NSError *)error {
    [self sendJSEvent:@"onAdFailedToLoad" payload:[RNFirebaseAdMob errorCodeToDictionary:error]];
}

#endif

@end
