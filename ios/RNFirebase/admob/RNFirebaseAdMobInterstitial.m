#import "RNFirebaseAdMobInterstitial.h"

@implementation RNFirebaseAdMobInterstitial

- (id)initWithProps:(NSString *)adUnit delegate:(RNFirebaseAdMob *)delegate {
    self = [super init];
    if (self) {
        _adUnitID = adUnit;
        _delegate = delegate;
        _interstitial = [self createInterstitial];
    }
    return self;
}

- (GADInterstitial *)createInterstitial {
    GADInterstitial *interstitial = [[GADInterstitial alloc] initWithAdUnitID:_adUnitID];
    interstitial.delegate = self;
    return interstitial;
}

- (void)loadAd:(NSDictionary *)request {
    [_interstitial loadRequest:[_delegate buildRequest:request]];
}

- (void)show {
    if (_interstitial.isReady) {
        [_interstitial presentFromRootViewController:[UIApplication sharedApplication].delegate.window.rootViewController];
    }
}

- (void)sendJSEvent:(NSString *)type payload:(NSDictionary *)payload {
    [_delegate sendEventWithName:ADMOB_INTERSTITIAL_EVENT body:@{
            @"type": type,
            @"adUnit": _adUnitID,
            @"payload": payload
    }];
}

- (void)interstitialDidReceiveAd:(nonnull GADInterstitial *)ad {
    [self sendJSEvent:@"onAdLoaded" payload:@{}];
}

- (void)interstitial:(GADInterstitial *)ad didFailToReceiveAdWithError:(GADRequestError *)error {
    [self sendJSEvent:@"onAdFailedToLoad" payload:[_delegate errorCodeToDictionary:error]];
}

- (void)interstitialWillPresentScreen:(GADInterstitial *)ad {
    [self sendJSEvent:@"onAdOpened" payload:@{}];
}

- (void)interstitialDidDismissScreen:(GADInterstitial *)ad {
    [self sendJSEvent:@"onAdClosed" payload:@{}];
}

- (void)interstitialWillLeaveApplication:(GADInterstitial *)ad {
    [self sendJSEvent:@"onAdLeftApplication" payload:@{}];
}

@end
