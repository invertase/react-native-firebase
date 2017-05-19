#ifndef RNFirebaseRemoteConfig_h
#define RNFirebaseRemoteConfig_h

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@interface RNFirebaseRemoteConfig : NSObject <RCTBridgeModule>

@end

#endif
