#ifndef RNFirebaseMessaging_h
#define RNFirebaseMessaging_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
@import UserNotifications;

@protocol RNFirebaseNativeMessagingDelegate <NSObject>
- (void)registerFirebaseNotificationCategoriesAndActions: (UNUserNotificationCenter *) center;
@end

@interface RNFirebaseMessaging : RCTEventEmitter<RCTBridgeModule, FIRMessagingDelegate>

+ (_Nonnull instancetype)instance;

@property _Nullable RCTPromiseRejectBlock permissionRejecter;
@property _Nullable RCTPromiseResolveBlock permissionResolver;
@property (nonatomic, weak) id <RNFirebaseNativeMessagingDelegate> nativeDelegate;

#if !TARGET_OS_TV
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo;
- (void)didRegisterUserNotificationSettings:(nonnull UIUserNotificationSettings *)notificationSettings;
#endif

@end

#else
@interface RNFirebaseMessaging : NSObject
@end
#endif

#endif

