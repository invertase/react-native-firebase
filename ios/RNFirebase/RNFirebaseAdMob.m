#import "RNFirebaseAdMob.h"
#import "GoogleMobileAds/GADMobileAds.h"

#import "RNFirebaseAdMobInterstitial.h"

@implementation RNFirebaseAdMob
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _interstitials = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(initialize:(NSString *)appId) {
    [GADMobileAds configureWithApplicationID:appId];
}

RCT_EXPORT_METHOD(interstitialShowAd:(NSString *)adUnit) {
    RNFirebaseAdMobInterstitial * interstitial = [self getOrCreateInterstitial:adUnit];
    [interstitial showAd];
}

RCT_EXPORT_METHOD(interstitialLoadAd:(NSString *)adUnit request:(NSDictionary *) request) {
    RNFirebaseAdMobInterstitial * interstitial = [self getOrCreateInterstitial:adUnit];
    [interstitial loadAd];
}


- (RNFirebaseAdMobInterstitial *) getOrCreateInterstitial:(NSString *)adUnit {
    if (_interstitials[adUnit]) {
        return _interstitials[adUnit];
    }

    _interstitials[adUnit] =  [[RNFirebaseAdMobInterstitial alloc] initWithProps:adUnit delegate:self];
    return _interstitials[adUnit];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ADMOB_INTERSTITIAL_EVENT, ADMOB_REWARDED_VIDEO_EVENT];
}

@end
