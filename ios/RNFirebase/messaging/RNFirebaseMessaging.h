#ifndef RNFirebaseMessaging_h
#define RNFirebaseMessaging_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@import UserNotifications;

@interface RNFirebaseMessaging : RCTEventEmitter<RCTBridgeModule, FIRMessagingDelegate>

typedef void (^RCTRemoteNotificationCallback)(UIBackgroundFetchResult result);
typedef void (^RCTWillPresentNotificationCallback)(UNNotificationPresentationOptions result);
typedef void (^RCTNotificationResponseCallback)();

@property (nonatomic, assign) bool connectedToFCM;

#if !TARGET_OS_TV
+ (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo;
+ (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull RCTRemoteNotificationCallback)completionHandler;
+ (void)didReceiveLocalNotification:(nonnull UILocalNotification *)notification;
+ (void)didReceiveNotificationResponse:(nonnull UNNotificationResponse *)response withCompletionHandler:(nonnull RCTNotificationResponseCallback)completionHandler;
+ (void)willPresentNotification:(nonnull UNNotification *)notification withCompletionHandler:(nonnull RCTWillPresentNotificationCallback)completionHandler;
#endif

@end

#else
@interface RNFirebaseMessaging : NSObject
@end
#endif

#endif
