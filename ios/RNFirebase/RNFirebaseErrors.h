#ifndef RNFirebaseErrors_h
#define RNFirebaseErrors_h

#import <React/RCTBridgeModule.h>
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
