#ifndef RNFirebaseMessaging_h
#define RNFirebaseMessaging_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseMessaging : RCTEventEmitter<RCTBridgeModule, FIRMessagingDelegate>

+ (_Nonnull instancetype)instance;

#if !TARGET_OS_TV
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo;
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(void (^_Nonnull)(UIBackgroundFetchResult))completionHandler;
#endif

@end

#else
@interface RNFirebaseMessaging : NSObject
@end
#endif

#endif
