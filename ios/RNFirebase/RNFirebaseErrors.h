#ifndef RNFirebaseErrors_h
#define RNFirebaseErrors_h

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif
#import "Firebase.h"

@interface RNFirebaseErrors : NSObject <RCTBridgeModule> {

}

+ (void) handleException:(NSException *)exception
            withCallback:(RCTResponseSenderBlock)callback;

+ (NSDictionary *) handleFirebaseError:(NSString *) name
                                 error:(NSError *) error
                              withUser:(FIRUser *) user;
@end

#endif
