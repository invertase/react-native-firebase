#import "RNFirebaseMessaging.h"

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
@import UserNotifications;
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <FirebaseMessaging/FirebaseMessaging.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
@import UserNotifications;
#endif

@implementation RNFirebaseMessaging

static RNFirebaseMessaging *theRNFirebaseMessaging = nil;
static bool jsReady = FALSE;
static NSString* initialToken = nil;
static NSMutableArray* pendingMessages = nil;

+ (nonnull instancetype)instance {
    return theRNFirebaseMessaging;
}

RCT_EXPORT_MODULE()

- (id)init {
    self = [super init];
    if (self != nil) {
        DLog(@"Setting up RNFirebaseMessaging instance");
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

// Listen for FCM data messages that arrive as a remote notification
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
    NSDictionary *message = [self parseUserInfo:userInfo];
    [self sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
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
    DLog(@"Received new FCM token: %@", fcmToken);
    [self sendJSEvent:self name:MESSAGING_TOKEN_REFRESHED body:fcmToken];
}

// Listen for data messages in the foreground
- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
    NSDictionary *message = [self parseFIRMessagingRemoteMessage:remoteMessage];
    [self sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
}

// Receive data messages on iOS 10+ directly from FCM (bypassing APNs) when the app is in the foreground.
// To enable direct data messages, you can set [Messaging messaging].shouldEstablishDirectChannel to YES.
- (void)messaging:(nonnull FIRMessaging *)messaging
didReceiveMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
    NSDictionary *message = [self parseFIRMessagingRemoteMessage:remoteMessage];
    [self sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
}

// *******************************************************
// ** Finish FIRMessagingDelegate methods
// *******************************************************

// ** Start React Module methods **
RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (initialToken) {
    resolve(initialToken);
    initialToken = nil;
  } else if ([[FIRMessaging messaging] FCMToken]) {
    resolve([[FIRMessaging messaging] FCMToken]);
  } else {
    NSString * senderId = [[FIRApp defaultApp] options].GCMSenderID;
    [[FIRMessaging messaging] retrieveFCMTokenForSenderID:senderId completion:^(NSString * _Nullable FCMToken, NSError * _Nullable error) {
        if (error) {
            reject(@"messaging/fcm-token-error", @"Failed to retrieve FCM token.", error);
        } else if (FCMToken) {
            resolve(FCMToken);
        } else {
            resolve([NSNull null]);
        }
    }];
  }
}

RCT_EXPORT_METHOD(deleteToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSString * senderId = [[FIRApp defaultApp] options].GCMSenderID;
  [[FIRMessaging messaging] deleteFCMTokenForSenderID:senderId completion:^(NSError * _Nullable error) {
    if (error) {
      reject(@"messaging/fcm-token-error", @"Failed to delete FCM token.", error);
    } else {
      resolve([NSNull null]);
    }
  }];
}


RCT_EXPORT_METHOD(getAPNSToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSData *apnsToken = [FIRMessaging messaging].APNSToken;
    if (apnsToken) {
        const char *data = [apnsToken bytes];
        NSMutableString *token = [NSMutableString string];
        for (NSInteger i = 0; i < apnsToken.length; i++) {
            [token appendFormat:@"%02.2hhX", data[i]];
        }
        resolve([token copy]);
    } else {
        resolve([NSNull null]);
    }
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
            self.permissionRejecter = reject;
            self.permissionResolver = resolve;
        });
    } else {
        if (@available(iOS 10.0, *)) {
            // For iOS 10 display notification (sent via APNS)
            UNAuthorizationOptions authOptions = UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
            [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError * _Nullable error) {
                if (granted) {
                    resolve(nil);
                } else {
                    reject(@"messaging/permission_error", @"Failed to grant permission", error);
                }
            }];
        }
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() registerForRemoteNotifications];
    });
}

RCT_EXPORT_METHOD(registerForRemoteNotifications:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [RCTSharedApplication() registerForRemoteNotifications];
    resolve(nil);
}

// Non Web SDK methods
RCT_EXPORT_METHOD(hasPermission:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        dispatch_async(dispatch_get_main_queue(), ^{
          BOOL hasPermission = [RCTConvert BOOL:@([RCTSharedApplication() currentUserNotificationSettings].types != UIUserNotificationTypeNone)];
          resolve(@(hasPermission));
        });
    } else {
        if (@available(iOS 10.0, *)) {
            [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
              BOOL hasPermission = [RCTConvert BOOL:@(settings.alertSetting == UNNotificationSettingEnabled)];
              resolve(@(hasPermission));
            }];
        }
    }
}


RCT_EXPORT_METHOD(sendMessage:(NSDictionary *) message
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

    // TODO: Listen for send success / errors
    resolve(nil);
}

RCT_EXPORT_METHOD(subscribeToTopic:(NSString*) topic
                           resolve:(RCTPromiseResolveBlock) resolve
                            reject:(RCTPromiseRejectBlock) reject) {
    [[FIRMessaging messaging] subscribeToTopic:topic];
    resolve(nil);
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic
                               resolve:(RCTPromiseResolveBlock) resolve
                                reject:(RCTPromiseRejectBlock) reject) {
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
    resolve(nil);
}

RCT_EXPORT_METHOD(jsInitialised:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    jsReady = TRUE;
    resolve(nil);
    if (initialToken) {
        [self sendJSEvent:self name:MESSAGING_TOKEN_REFRESHED body:initialToken];
    }
    if (pendingMessages) {
        for (id message in pendingMessages) {
            [RNFirebaseUtil sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
        }
        pendingMessages = nil;
    }
}

// ** Start internals **

// Because of the time delay between the app starting and the bridge being initialised
// we catch any events that are received before the JS is ready to receive them
- (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(id)body {
    if (emitter.bridge && jsReady) {
        [RNFirebaseUtil sendJSEvent:emitter name:name body:body];
    } else {
        if ([name isEqualToString:MESSAGING_TOKEN_REFRESHED]) {
            initialToken = body;
        } else if ([name isEqualToString:MESSAGING_MESSAGE_RECEIVED]) {
            if (!pendingMessages) {
                pendingMessages = [[NSMutableArray alloc] init];
            }
            [pendingMessages addObject:body];
        } else {
            DLog(@"Received unexpected message type");
        }
    }
}

- (NSDictionary*)parseFIRMessagingRemoteMessage:(FIRMessagingRemoteMessage *)remoteMessage {
    NSDictionary *appData = remoteMessage.appData;

    NSMutableDictionary *message = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
    for (id k1 in appData) {
        if ([k1 isEqualToString:@"collapse_key"]) {
            message[@"collapseKey"] = appData[@"collapse_key"];
        } else if ([k1 isEqualToString:@"from"]) {
            message[@"from"] = appData[k1];
        } else if ([k1 isEqualToString:@"notification"]) {
            // Ignore for messages
        } else {
            // Assume custom data key
            data[k1] = appData[k1];
        }
    }
    message[@"data"] = data;

    return message;
}

- (NSDictionary*)parseUserInfo:(NSDictionary *)userInfo {
    NSMutableDictionary *message = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];

    for (id k1 in userInfo) {
        if ([k1 isEqualToString:@"aps"]) {
            // Ignore notification section
        } else if ([k1 isEqualToString:@"gcm.message_id"]) {
            message[@"messageId"] = userInfo[k1];
        } else if ([k1 isEqualToString:@"google.c.a.ts"]) {
            message[@"sentTime"] = userInfo[k1];
        } else if ([k1 isEqualToString:@"gcm.n.e"]
                   || [k1 isEqualToString:@"gcm.notification.sound2"]
                   || [k1 isEqualToString:@"google.c.a.c_id"]
                   || [k1 isEqualToString:@"google.c.a.c_l"]
                   || [k1 isEqualToString:@"google.c.a.e"]
                   || [k1 isEqualToString:@"google.c.a.udt"]) {
            // Ignore known keys
        } else {
            // Assume custom data
            data[k1] = userInfo[k1];
        }
    }

    message[@"data"] = data;

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

