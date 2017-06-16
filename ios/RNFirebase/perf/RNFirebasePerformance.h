#ifndef RNFirebasePerformance_h
#define RNFirebasePerformance_h

#import <React/RCTBridgeModule.h>

@interface RNFirebasePerformance : NSObject <RCTBridgeModule> {

}

@property NSMutableDictionary *traces;

@end

#endif
