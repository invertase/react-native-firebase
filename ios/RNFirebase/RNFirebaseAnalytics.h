#ifndef RNFirebaseAnalytics_h
#define RNFirebaseAnalytics_h

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@interface RNFirebaseAnalytics : NSObject <RCTBridgeModule> {

}

@end

#endif
