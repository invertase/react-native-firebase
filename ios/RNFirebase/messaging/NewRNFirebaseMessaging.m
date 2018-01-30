#import "NewRNFirebaseMessaging.h"

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
@import UserNotifications;
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <FirebaseInstanceID/FIRInstanceID.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@interface NewRNFirebaseMessaging ()

@end

@implementation NewRNFirebaseMessaging

RCT_EXPORT_MODULE()

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseMessaging instance");
        [self initialiseMessaging];
    }
    return self;
}

- (void)initialiseMessaging {
    // Establish Firebase managed data channel
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
}

- (void)dealloc {

}

// ** Start React Module methods **
RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([[FIRInstanceID instanceID] token]);
}

RCT_EXPORT_METHOD(requestPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (RCTRunningInAppExtension()) {
        reject(@"request_permission_unavailable", @"requestPermission is not supported in App Extensions", nil);
        return;
    }
    
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        UIUserNotificationType types = (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge);
        [RCTSharedApplication() registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:types categories:nil]];
        // Unfortunately on iOS 9 or below, there's no way to tell whether the user accepted or
        // rejected the permissions popup
        // TODO: Is there something we can listen for?
        resolve(@{@"status":@"unknown"});
    } else {
        // iOS 10 or later
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            // For iOS 10 display notification (sent via APNS)
            UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
            [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError * _Nullable error) {
                if (granted) {
                    resolve(@{@"status": @"granted"});
                } else {
                    reject(@"permission_error", @"Failed to grant permission", error);
                }
            }];
        #endif
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() registerForRemoteNotifications];
    });
}

// Non Web SDK methods

RCT_EXPORT_METHOD(deleteInstanceId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[FIRInstanceID instanceID] deleteIDWithHandler:^(NSError * _Nullable error) {
        if (!error) {
            resolve(nil);
        } else {
            reject(@"instance_id_error", @"Failed to delete instance id", error);
        }
    }];
}

RCT_EXPORT_METHOD(getBadgeNumber: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([RCTSharedApplication() applicationIconBadgeNumber]));
}

RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    UILocalNotification *localUserInfo = [self bridge].launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];
    if (localUserInfo) {
        resolve([[localUserInfo userInfo] copy]);
    } else {
        resolve([[self bridge].launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey] copy]);
    }
}

RCT_EXPORT_METHOD(subscribeToTopic: (NSString*) topic) {
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic) {
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
}


RCT_EXPORT_METHOD(setBadgeNumber: (NSInteger*) number) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() setApplicationIconBadgeNumber:*number];
    });
}

- (NSArray<NSString *> *)supportedEvents {
    return @[MESSAGING_MESSAGE_RECEIVED, MESSAGING_TOKEN_REFRESHED];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation NewRNFirebaseMessaging
@end
#endif
