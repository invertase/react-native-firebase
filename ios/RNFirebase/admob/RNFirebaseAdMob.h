#ifndef RNFirebaseAdMob_h
#define RNFirebaseAdMob_h
#import <Foundation/Foundation.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)
#import <Firebase.h>
#import "RNFirebaseEvents.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <GoogleMobileAds/GADInterstitialDelegate.h>
#import <GoogleMobileAds/GADRewardBasedVideoAdDelegate.h>


@interface RNFirebaseAdMob : RCTEventEmitter <RCTBridgeModule>
@property NSMutableDictionary *interstitials;
@property NSMutableDictionary *rewardedVideos;

+ (GADRequest *)buildRequest:(NSDictionary *)request;
+ (GADVideoOptions *)buildVideoOptions:(NSDictionary *)options;
+ (NSDictionary *)errorCodeToDictionary:(NSError *)error;
+ (GADAdSize)stringToAdSize:(NSString *)value;
@end

#else
@interface RNFirebaseAdMob : NSObject
@end
#endif

#endif
