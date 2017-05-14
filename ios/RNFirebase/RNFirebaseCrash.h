#ifndef RNFirebaseCrash_h
#define RNFirebaseCrash_h

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@interface RNFirebaseCrash : NSObject <RCTBridgeModule> {

}

@end

#endif
