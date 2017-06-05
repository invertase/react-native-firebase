#ifndef RNFirebaseAdMobInterstitial_h
#define RNFirebaseAdMobInterstitial_h

#import <React/RCTBridgeModule.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import "GoogleMobileAds/GADInterstitialDelegate.h"
#import "GoogleMobileAds/GADInterstitial.h"
#import <React/RCTEventEmitter.h>
#import "RNFirebaseAdMob.h"

@interface RNFirebaseAdMobInterstitial : NSObject <GADInterstitialDelegate>
@property NSString *adUnitID;
@property RNFirebaseAdMob *delegate;
@property GADInterstitial *interstitial;

- (id)initWithProps:(NSString *)adUnit delegate:(RNFirebaseAdMob *)delegate;

- (void)showAd;
- (void)loadAd;

@end

#else
@interface RNFirebaseAdMobInterstitial : NSObject <RCTBridgeModule> {
}
@end
#endif

#endif

