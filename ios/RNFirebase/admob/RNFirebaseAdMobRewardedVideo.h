#ifndef RNFirebaseAdMobRewardedVideo_h
#define RNFirebaseAdMobRewardedVideo_h

#import <React/RCTBridgeModule.h>
#import "RNFirebaseEvents.h"

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import <GoogleMobileAds/GADRewardBasedVideoAdDelegate.h>
#import <GoogleMobileAds/GADRewardBasedVideoAd.h>
#import <React/RCTEventEmitter.h>
#import "RNFirebaseAdMob.h"

@interface RNFirebaseAdMobRewardedVideo : NSObject <GADRewardBasedVideoAdDelegate>
@property NSString *adUnitID;
@property RNFirebaseAdMob *delegate;
@property GADRewardBasedVideoAd *videoAd;

- (id)initWithProps:(NSString *)adUnit delegate:(RNFirebaseAdMob *)delegate;

- (void)show;
- (void)loadAd:(NSDictionary *)request;
- (void)setCustomData:(NSString *)customData;
- (void)sendJSEvent:(NSString *)type payload:(nullable NSDictionary *)payload;

@end

#else
@interface RNFirebaseAdMobRewardedVideo : NSObject {
}
@end
#endif

#endif
