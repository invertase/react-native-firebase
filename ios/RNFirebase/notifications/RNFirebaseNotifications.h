#ifndef RNFirebaseNotifications_h
#define RNFirebaseNotifications_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseNotifications : RCTEventEmitter<RCTBridgeModule>

#if !TARGET_OS_TV

#endif

@end

#else
@interface RNFirebaseNotifications : NSObject
@end
#endif

#endif
