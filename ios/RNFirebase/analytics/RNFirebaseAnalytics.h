#ifndef RNFirebaseAnalytics_h
#define RNFirebaseAnalytics_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseAnalytics/FIRAnalytics.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseAnalytics : NSObject <RCTBridgeModule> {

}

@end

#else
@interface RNFirebaseAnalytics : NSObject
@end
#endif

#endif
