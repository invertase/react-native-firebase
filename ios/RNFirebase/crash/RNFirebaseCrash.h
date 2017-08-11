#ifndef RNFirebaseCrash_h
#define RNFirebaseCrash_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseCrash/FIRCrashLog.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseCrash : NSObject <RCTBridgeModule> {

}

@end

#else
@interface RNFirebaseCrash : NSObject
@end
#endif

#endif
