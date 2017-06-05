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
    interstitial.delegate = _delegate;
    return interstitial;
}

- (void) loadAd {
    // todo build request
    [_interstitial loadRequest:[GADRequest request]];
}

- (void)showAd {
    [_interstitial presentFromRootViewController:[UIApplication sharedApplication].delegate.window.rootViewController];
}

@end
