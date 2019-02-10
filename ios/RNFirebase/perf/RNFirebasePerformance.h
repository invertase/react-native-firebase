#ifndef RNFirebasePerformance_h
#define RNFirebasePerformance_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebasePerformance/FIRPerformance.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebasePerformance : NSObject <RCTBridgeModule> {

}

@property NSMutableDictionary *traces;

@end

#else
@interface RNFirebasePerformance : NSObject
@end
#endif

#endif
