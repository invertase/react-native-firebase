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

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
@import UserNotifications;
#endif
@interface RNFirebaseMessaging ()
@property (nonatomic, strong) NSMutableDictionary *callbackHandlers;
@end


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
    
    // Set static instance for use from AppDelegate
    theRNFirebaseMessaging = self;

    // Initialise callback handlers dictionary
    _callbackHandlers = [NSMutableDictionary dictionary];
}

// *******************************************************
// ** Start AppDelegate methods
// ** iOS 8/9 Only
// *******************************************************

// Listen for permission response
- (void) didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
    if (notificationSettings.types == UIUserNotificationTypeNone) {
        if (_permissionRejecter) {
            _permissionRejecter(@"messaging/permission_error", @"Failed to grant permission", nil);
        }
    } else if (_permissionResolver) {
        _permissionResolver(nil);
    }
    _permissionRejecter = nil;
    _permissionResolver = nil;
}

// *******************************************************
// ** Finish AppDelegate methods
// *******************************************************


// *******************************************************
// ** Start FIRMessagingDelegate methods
// ** iOS 8+
// *******************************************************

// Listen for FCM tokens
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
    NSLog(@"Received new FCM token: %@", fcmToken);
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_TOKEN_REFRESHED body:fcmToken];
}

// Listen for data messages in the foreground
- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
    NSDictionary *message = [self parseFIRMessagingRemoteMessage:remoteMessage openedFromTray:false];

    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
}

// *******************************************************
// ** Finish FIRMessagingDelegate methods
// *******************************************************

// ** Start React Module methods **
RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([[FIRInstanceID instanceID] token]);
}

RCT_EXPORT_METHOD(requestPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (RCTRunningInAppExtension()) {
        reject(@"messaging/request-permission-unavailable", @"requestPermission is not supported in App Extensions", nil);
        return;
    }

    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        UIUserNotificationType types = (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge);
        dispatch_async(dispatch_get_main_queue(), ^{
            [RCTSharedApplication() registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:types categories:nil]];
            // We set the promise for usage by the AppDelegate callback which listens
            // for the result of the permission request
            _permissionRejecter = reject;
            _permissionResolver = resolve;
        });
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            // For iOS 10 display notification (sent via APNS)
            UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
            [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError * _Nullable error) {
                if (granted) {
                    resolve(nil);
                } else {
                    reject(@"messaging/permission_error", @"Failed to grant permission", error);
                }
            }];
        #endif
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() registerForRemoteNotifications];
    });
}

// Non Web SDK methods

// TODO: Move to notifications
RCT_EXPORT_METHOD(getBadge: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        resolve(@([RCTSharedApplication() applicationIconBadgeNumber]));
    });
}

// TODO: Remove
RCT_EXPORT_METHOD(getInitialMessage:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    resolve(nil);
}

RCT_EXPORT_METHOD(hasPermission: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        dispatch_async(dispatch_get_main_queue(), ^{
            resolve(@([RCTSharedApplication() currentUserNotificationSettings].types != UIUserNotificationTypeNone));
        });
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                resolve(@(settings.alertSetting == UNNotificationSettingEnabled));
            }];
        #endif
    }
}


RCT_EXPORT_METHOD(sendMessage: (NSDictionary *) message
                      resolve:(RCTPromiseResolveBlock) resolve
                       reject:(RCTPromiseRejectBlock) reject) {
    if (!message[@"to"]) {
        reject(@"messaging/invalid-message", @"The supplied message is missing a 'to' field", nil);
    }
    NSString *to = message[@"to"];
    NSString *messageId = message[@"messageId"];
    NSNumber *ttl = message[@"ttl"];
    NSDictionary *data = message[@"data"];

    [[FIRMessaging messaging] sendMessage:data to:to withMessageID:messageId timeToLive:[ttl intValue]];
}

// TODO: Move to notifications
RCT_EXPORT_METHOD(setBadge: (NSInteger) number) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() setApplicationIconBadgeNumber:number];
    });
}

RCT_EXPORT_METHOD(subscribeToTopic: (NSString*) topic) {
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic) {
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
}

// Response handler methods

RCT_EXPORT_METHOD(completeNotificationResponse: (NSString*) messageId) {
    void(^callbackHandler)() = [_callbackHandlers objectForKey:messageId];
    if (!callbackHandler) {
        NSLog(@"There is no callback handler for messageId: %@", messageId);
        return;
    }
    callbackHandler();
    [_callbackHandlers removeObjectForKey:messageId];
}

RCT_EXPORT_METHOD(completePresentNotification: (NSString*) messageId
                                       result: (NSString*) result) {
    void(^callbackHandler)(UNNotificationPresentationOptions) = [_callbackHandlers objectForKey:messageId];
    if (!callbackHandler) {
        NSLog(@"There is no callback handler for messageId: %@", messageId);
        return;
    }
    UNNotificationPresentationOptions options;
    if ([result isEqualToString:@"UNNotificationPresentationOptionAll"]) {
        options = UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound;
    } else if ([result isEqualToString:@"UNNotificationPresentationOptionNone"]) {
        options = UNNotificationPresentationOptionNone;
    } else {
        NSLog(@"Invalid result for PresentNotification: %@", result);
        return;
    }
    callbackHandler(options);
    [_callbackHandlers removeObjectForKey:messageId];
}

RCT_EXPORT_METHOD(completeRemoteNotification: (NSString*) messageId
                                      result: (NSString*) result) {
    void(^callbackHandler)(UIBackgroundFetchResult) = [_callbackHandlers objectForKey:messageId];
    if (!callbackHandler) {
        NSLog(@"There is no callback handler for messageId: %@", messageId);
        return;
    }
    UIBackgroundFetchResult fetchResult;
    if ([result isEqualToString:@"UIBackgroundFetchResultNewData"]) {
        fetchResult = UIBackgroundFetchResultNewData;
    } else if ([result isEqualToString:@"UIBackgroundFetchResultNoData"]) {
        fetchResult = UIBackgroundFetchResultNoData;
    } else if ([result isEqualToString:@"UIBackgroundFetchResultFailed"]) {
        fetchResult = UIBackgroundFetchResultFailed;
    } else {
        NSLog(@"Invalid result for PresentNotification: %@", result);
        return;
    }
    callbackHandler(fetchResult);
    [_callbackHandlers removeObjectForKey:messageId];
}

// ** Start internals **

- (NSDictionary*)parseFIRMessagingRemoteMessage:(FIRMessagingRemoteMessage *)remoteMessage
                                 openedFromTray:(bool)openedFromTray {
    NSDictionary *appData = remoteMessage.appData;

    NSMutableDictionary *message = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
    for (id k1 in appData) {
        if ([k1 isEqualToString:@"collapse_key"]) {
            message[@"collapseKey"] = appData[@"collapse_key"];
        } else if ([k1 isEqualToString:@"from"]) {
            message[@"from"] = appData[k1];
        } else if ([k1 isEqualToString:@"notification"]) {
            NSDictionary *notification = appData[k1];
            NSMutableDictionary *notif = [[NSMutableDictionary alloc] init];
            for (id k2 in notification) {
                if ([k2 isEqualToString:@"badge"]) {
                    notif[@"badge"] = notification[k2];
                } else if ([k2 isEqualToString:@"body"]) {
                    notif[@"body"] = notification[k2];
                } else if ([k2 isEqualToString:@"body_loc_args"]) {
                    notif[@"bodyLocalizationArgs"] = notification[k2];
                } else if ([k2 isEqualToString:@"body_loc_key"]) {
                    notif[@"bodyLocalizationKey"] = notification[k2];
                } else if ([k2 isEqualToString:@"click_action"]) {
                    notif[@"clickAction"] = notification[k2];
                } else if ([k2 isEqualToString:@"sound"]) {
                    notif[@"sound"] = notification[k2];
                } else if ([k2 isEqualToString:@"subtitle"]) {
                    notif[@"subtitle"] = notification[k2];
                } else if ([k2 isEqualToString:@"title"]) {
                    notif[@"title"] = notification[k2];
                } else if ([k2 isEqualToString:@"title_loc_args"]) {
                    notif[@"titleLocalizationArgs"] = notification[k2];
                } else if ([k2 isEqualToString:@"title_loc_key"]) {
                    notif[@"titleLocalizationKey"] = notification[k2];
                } else {
                    NSLog(@"Unknown notification key: %@", k2);
                }
            }
            message[@"notification"] = notif;
        } else {
            // Assume custom data key
            data[k1] = appData[k1];
        }
    }
    message[@"messageType"] = @"RemoteMessage";
    message[@"data"] = data;
    message[@"openedFromTray"] = @(false);

    return message;
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

