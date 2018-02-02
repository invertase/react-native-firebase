#import "RNFirebaseMessaging.h"

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
@import UserNotifications;
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <FirebaseInstanceID/FIRInstanceID.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

// For iOS 10 we need to implement UNUserNotificationCenterDelegate to receive display
// notifications via APNS
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
@import UserNotifications;

@interface RNFirebaseMessaging () <UNUserNotificationCenterDelegate>
@end
#endif

@implementation RNFirebaseMessaging

static RNFirebaseMessaging *theRNFirebaseMessaging = nil;

+ (nonnull instancetype)instance {
    return theRNFirebaseMessaging;
}

RCT_EXPORT_MODULE()

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseMessaging instance");
        [self configure];
    }
    return self;
}

- (void)configure {
    // Set as delegate for FIRMessaging
    [FIRMessaging messaging].delegate = self;
    
    // Establish Firebase managed data channel
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
    
    // If we're on iOS 10 then we need to set this as a delegate for the UNUserNotificationCenter
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
#endif
    
    // Set static instance for use from AppDelegate
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        theRNFirebaseMessaging = self;
    });
}

- (void)dealloc {

}

// ** AppDelegate methods **

// Listen for background messages
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
    BOOL isFromBackground = (RCTSharedApplication().applicationState == UIApplicationStateInactive);
    
    // TODO: Format data before send
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:userInfo];
}

// Listen for background messages
- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo
              fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    BOOL isFromBackground = (RCTSharedApplication().applicationState == UIApplicationStateInactive);
    
    // TODO: Format data before send
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:userInfo];
}

// ** UNUserNotificationCenterDelegate methods **
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
// Handle incoming notification messages while app is in the foreground.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    NSDictionary *userInfo = notification.request.content.userInfo;
    
    // TODO: Format data before send
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:userInfo];
    
    // TODO: Change this to your preferred presentation option
    completionHandler(UNNotificationPresentationOptionNone);
}

// Handle notification messages after display notification is tapped by the user.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
#if defined(__IPHONE_11_0)
         withCompletionHandler:(void(^)(void))completionHandler {
#else
         withCompletionHandler:(void(^)())completionHandler {
#endif
    NSDictionary *userInfo = response.notification.request.content.userInfo;
             
    // TODO: Format data before send
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:userInfo];
             
    completionHandler();
}

#endif

// ** FIRMessagingDelegate methods **

// Listen for FCM tokens
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
    NSLog(@"Received new FCM token: %@", fcmToken);
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_TOKEN_REFRESHED body:fcmToken];
}

// Listen for data messages in the foreground
- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
    NSDictionary *appData = remoteMessage.appData;
    
    NSMutableDictionary *message = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
    for (id k1 in appData) {
        if ([k1 isEqualToString:@"collapse_key"]) {
            message[@"collapseKey"] = appData[@"collapse_key"];
        } else if ([k1 isEqualToString:@"from"]) {
            message[@"from"] = appData[@"from"];
        } else if ([k1 isEqualToString:@"notification"]) {
            NSDictionary *n = appData[@"notification"];
            NSMutableDictionary *notification = [[NSMutableDictionary alloc] init];
            for (id k2 in appData[@"notification"]) {
                if ([k2 isEqualToString:@"badge"]) {
                    notification[@"badge"] = n[@"badge"];
                } else if ([k2 isEqualToString:@"body"]) {
                    notification[@"body"] = n[@"body"];
                } else if ([k2 isEqualToString:@"sound"]) {
                    notification[@"sound"] = n[@"sound"];
                } else if ([k2 isEqualToString:@"title"]) {
                    notification[@"title"] = n[@"title"];
                } else {
                    NSLog(@"Unknown notification key: %@", k2);
                }
            }
            message[@"notification"] = notification;
        } else {
            data[k1] = appData[k1];
        }
    }
    message[@"data"] = data;
    message[@"openedFromTray"] = @(false);
    
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
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

RCT_EXPORT_METHOD(getBadge: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([RCTSharedApplication() applicationIconBadgeNumber]));
}

RCT_EXPORT_METHOD(getInitialMessage:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    NSDictionary *notification = [self bridge].launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
    if (notification) {
        resolve([notification copy]);
    } else {
        resolve(nil);
    }
}

RCT_EXPORT_METHOD(setBadge: (NSInteger*) number) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() setApplicationIconBadgeNumber:*number];
    });
}

RCT_EXPORT_METHOD(subscribeToTopic: (NSString*) topic) {
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic) {
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
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
@implementation RNFirebaseMessaging
@end
#endif
