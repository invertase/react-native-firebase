#ifndef RNFirebaseAdMob_h
#define RNFirebaseAdMob_h

#import <React/RCTBridgeModule.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)
#import "Firebase.h"
#import "RNFirebaseEvents.h"
#import <React/RCTEventEmitter.h>
#import "GoogleMobileAds/GADInterstitialDelegate.h"
#import "GoogleMobileAds/GADAdDelegate.h"


@interface RNFirebaseAdMob : RCTEventEmitter <RCTBridgeModule, GADInterstitialDelegate, GADAdDelegate>
@property NSMutableDictionary *interstitials;

- (GADRequest *)buildRequest:(NSDictionary *)request;
- (NSDictionary *)errorCodeToDictionary:(NSError *)error;
@end

#else
@interface RNFirebaseAdMob : NSObject <RCTBridgeModule> {
}
@end
#endif

#endif
