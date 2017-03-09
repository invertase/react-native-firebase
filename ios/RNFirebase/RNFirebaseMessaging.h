#ifndef RNFirebaseMessaging_h
#define RNFirebaseMessaging_h

#import "Firebase.h"
#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"
#import "RCTUtils.h"

@interface RNFirebaseMessaging : RCTEventEmitter <RCTBridgeModule> {

}

+ (void) setup:(UIApplication *)application;

@end

#endif
