#ifndef NewRNFirebaseMessaging_h
#define NewRNFirebaseMessaging_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NewRNFirebaseMessaging : RCTEventEmitter<RCTBridgeModule, FIRMessagingDelegate>

#if !TARGET_OS_TV

#endif

@end

#else
@interface NewRNFirebaseMessaging : NSObject
@end
#endif

#endif
