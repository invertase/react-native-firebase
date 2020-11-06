#ifndef RNFirebaseAdMobInterstitial_h
#define RNFirebaseAdMobInterstitial_h

#import <React/RCTBridgeModule.h>
#import "RNFirebaseEvents.h"

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import <GoogleMobileAds/GADInterstitialDelegate.h>
#import <GoogleMobileAds/GADInterstitial.h>
#import <React/RCTEventEmitter.h>
#import "RNFirebaseAdMob.h"

@interface RNFirebaseAdMobInterstitial : NSObject <GADInterstitialDelegate>
@property NSString *adUnitID;
@property RNFirebaseAdMob *delegate;
@property GADInterstitial *interstitial;

- (id)initWithProps:(NSString *)adUnit delegate:(RNFirebaseAdMob *)delegate;

- (void)show;
- (void)loadAd:(NSDictionary *)request;
- (void)sendJSEvent:(NSString *)type payload:(nullable NSDictionary *)payload;

@end

#else
@interface RNFirebaseAdMobInterstitial : NSObject {
}
@end
#endif

#endif
