#ifndef RNFirebaseMessaging_h
#define RNFirebaseMessaging_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseMessaging : RCTEventEmitter<RCTBridgeModule, FIRMessagingDelegate>

#if !TARGET_OS_TV

#endif

@end

#else
@interface RNFirebaseMessaging : NSObject
@end
#endif

#endif
