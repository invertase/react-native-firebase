#import "RNFirebaseNotifications.h"

#if __has_include(<FirebaseMessaging/FIRMessaging.h>)
#import "RNFirebaseEvents.h"
#import "RNFirebaseMessaging.h"
#import "RNFirebaseUtil.h"
#import <React/RCTUtils.h>

// For iOS 10 we need to implement UNUserNotificationCenterDelegate to receive display
// notifications via APNS
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
@import UserNotifications;
@interface RNFirebaseNotifications () <UNUserNotificationCenterDelegate>
#else
@interface RNFirebaseNotifications ()
#endif
@end

@implementation RNFirebaseNotifications

static RNFirebaseNotifications *theRNFirebaseNotifications = nil;

+ (nonnull instancetype)instance {
    return theRNFirebaseNotifications;
}

RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseNotifications instance");
        [self configure];
    }
    return self;
}

- (void)configure {
    // If we're on iOS 10 then we need to set this as a delegate for the UNUserNotificationCenter
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
#endif
    
    // Set static instance for use from AppDelegate
    theRNFirebaseNotifications = self;
}

// *******************************************************
// ** Start AppDelegate methods
// ** iOS 8/9 Only
// *******************************************************

- (void)didReceiveLocalNotification:(nonnull UILocalNotification *)notification {
    #if !defined(__IPHONE_10_0) || __IPHONE_OS_VERSION_MAX_ALLOWED < __IPHONE_10_0
        NSString *event;
        if (RCTSharedApplication().applicationState == UIApplicationStateBackground) {
            // notification_displayed
            event = NOTIFICATIONS_NOTIFICATION_DISPLAYED;
        } else if (RCTSharedApplication().applicationState == UIApplicationStateInactive) {
            // notification_displayed
            event = NOTIFICATIONS_NOTIFICATION_PRESSED;
        } else {
            // notification_received
            event = NOTIFICATIONS_NOTIFICATION_RECEIVED;
        }

        NSDictionary *message = [self parseUILocalNotification:notification];
        [RNFirebaseUtil sendJSEvent:self name:event body:message];
    #endif
}

// Listen for background messages
- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
    // FCM Data messages come through here if they specify content-available=true
    // Pass them over to the RNFirebaseMessaging handler instead
    if (userInfo[@"aps"] && ((NSDictionary*)userInfo[@"aps"]).count == 1 && userInfo[@"aps"][@"content-available"]) {
        [[RNFirebaseMessaging instance] didReceiveRemoteNotification:userInfo];
        return;
    }

    NSString *event;
    if (RCTSharedApplication().applicationState == UIApplicationStateBackground) {
        // notification_displayed
        event = NOTIFICATIONS_NOTIFICATION_DISPLAYED;
    } else if (RCTSharedApplication().applicationState == UIApplicationStateInactive) {
        // notification_displayed
        event = NOTIFICATIONS_NOTIFICATION_PRESSED;
    } else {
        // notification_received
        // On IOS 10, foreground notifications also go through willPresentNotification
        // This prevents duplicate messages from hitting the JS app
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            return;
        #else
            event = NOTIFICATIONS_NOTIFICATION_RECEIVED;
        #endif
    }

    NSDictionary *message = [self parseUserInfo:userInfo messageType:@"RemoteNotification" category:nil];

    [RNFirebaseUtil sendJSEvent:self name:event body:message];
}

// Listen for background messages
- (void)didReceiveRemoteNotification:(NSDictionary *)userInfo
              fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    // FCM Data messages come through here if they specify content-available=true
    // Pass them over to the RNFirebaseMessaging handler instead
    if (userInfo[@"aps"] && ((NSDictionary*)userInfo[@"aps"]).count == 1 && userInfo[@"aps"][@"content-available"]) {
        [[RNFirebaseMessaging instance] didReceiveRemoteNotification:userInfo];
        return;
    }
    
    
    NSString *event;
    if (RCTSharedApplication().applicationState == UIApplicationStateBackground) {
        // notification_displayed
        event = NOTIFICATIONS_NOTIFICATION_DISPLAYED;
    } else if (RCTSharedApplication().applicationState == UIApplicationStateInactive) {
        // notification_displayed
        event = NOTIFICATIONS_NOTIFICATION_PRESSED;
    } else {
        // notification_received
        // On IOS 10, foreground notifications also go through willPresentNotification
        // This prevents duplicate messages from hitting the JS app
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            return;
        #else
            event = NOTIFICATIONS_NOTIFICATION_RECEIVED;
        #endif
    }

    NSDictionary *message = [self parseUserInfo:userInfo messageType:@"RemoteNotificationHandler" category:nil];

    [RNFirebaseUtil sendJSEvent:self name:event body:message];
    completionHandler(UIBackgroundFetchResultNoData);
}

// *******************************************************
// ** Finish AppDelegate methods
// *******************************************************

// *******************************************************
// ** Start UNUserNotificationCenterDelegate methods
// ** iOS 10+
// *******************************************************

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
// Handle incoming notification messages while app is in the foreground.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    
    UNNotificationTrigger *trigger = notification.request.trigger;
    BOOL isFcm = trigger && [notification.request.trigger class] == [UNPushNotificationTrigger class];
    BOOL isScheduled = trigger && [notification.request.trigger class] == [UNCalendarNotificationTrigger class];
    
    NSString *event;
    UNNotificationPresentationOptions options;
    NSDictionary *message = [self parseUNNotification:notification messageType:@"PresentNotification"];
    
    if (isFcm || isScheduled) {
        // If app is in the background
        if (RCTSharedApplication().applicationState == UIApplicationStateInactive) {
            // display the notification
            options = UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound;
            // notification_displayed
            event = NOTIFICATIONS_NOTIFICATION_DISPLAYED;
        } else {
            // don't show notification
            options = UNNotificationPresentationOptionNone;
            // notification_received
            event = NOTIFICATIONS_NOTIFICATION_RECEIVED;
        }
    } else {
        // Triggered by `notifications().displayNotification(notification)`
        // Display the notification
        options = UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound;
        // notification_displayed
        event = NOTIFICATIONS_NOTIFICATION_DISPLAYED;
    }
    
    [RNFirebaseUtil sendJSEvent:self name:event body:message];
    completionHandler(options);
}

// Handle notification messages after display notification is tapped by the user.
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
#if defined(__IPHONE_11_0)
         withCompletionHandler:(void(^)(void))completionHandler {
#else
         withCompletionHandler:(void(^)())completionHandler {
#endif
     NSDictionary *message = [self parseUNNotificationResponse:response messageType:@"NotificationResponse"];
     
     [RNFirebaseUtil sendJSEvent:self name:NOTIFICATIONS_NOTIFICATION_PRESSED body:message];
     completionHandler();
}

#endif

// *******************************************************
// ** Finish UNUserNotificationCenterDelegate methods
// *******************************************************

RCT_EXPORT_METHOD(cancelAllNotifications) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        [RCTSharedApplication() cancelAllLocalNotifications];
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
            if (notificationCenter != nil) {
                [[UNUserNotificationCenter currentNotificationCenter] removeAllPendingNotificationRequests];
            }
        #endif
    }
}

RCT_EXPORT_METHOD(cancelNotification:(NSString*) notificationId) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        for (UILocalNotification *notification in RCTSharedApplication().scheduledLocalNotifications) {
            NSDictionary *notificationInfo = notification.userInfo;
            if ([notificationId isEqualToString:[notificationInfo valueForKey:@"notificationId"]]) {
                [RCTSharedApplication() cancelLocalNotification:notification];
            }
        }
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
            if (notificationCenter != nil) {
                [[UNUserNotificationCenter currentNotificationCenter] removePendingNotificationRequestsWithIdentifiers:@[notificationId]];
            }
        #endif
    }
}

RCT_EXPORT_METHOD(displayNotification:(NSDictionary*) notification
                             resolver:(RCTPromiseResolveBlock)resolve
                             rejecter:(RCTPromiseRejectBlock)reject) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        UILocalNotification* notif = [self buildUILocalNotification:notification withSchedule:false];
        [RCTSharedApplication() presentLocalNotificationNow:notif];
        resolve(nil);
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNNotificationRequest* request = [self buildUNNotificationRequest:notification withSchedule:false];
            [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
                if (!error) {
                    resolve(nil);
                }else{
                    reject(@"notifications/display_notification_error", @"Failed to display notificaton", error);
                }
            }];
        #endif
    }
}

RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    UILocalNotification *localNotification = [self bridge].launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];
    if (localNotification) {
        NSDictionary *notification = [self parseUILocalNotification:localNotification];
        resolve(notification);
    } else {
        NSDictionary *remoteNotification = [self bridge].launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
        if (remoteNotification) {
            NSDictionary *message = [self parseUserInfo:remoteNotification messageType:@"InitialMessage" category:nil];
            resolve(message);
        } else {
            resolve(nil);
        }
    }
}

RCT_EXPORT_METHOD(getScheduledNotifications:(RCTPromiseResolveBlock)resolve
                                   rejecter:(RCTPromiseRejectBlock)reject) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        NSMutableArray* notifications = [[NSMutableArray alloc] init];
        for (UILocalNotification *notif in [RCTSharedApplication() scheduledLocalNotifications]){
            NSDictionary *notification = [self parseUILocalNotification:notif];
            [notifications addObject:notification];
        }
        resolve(notifications);
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            [[UNUserNotificationCenter currentNotificationCenter] getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> * _Nonnull requests) {
                NSMutableArray* notifications = [[NSMutableArray alloc] init];
                for (UNNotificationRequest *notif in requests){
                    NSDictionary *notification = [self parseUNNotificationRequest:notif];
                    [notifications addObject:notification];
                }
                resolve(notifications);
            }];
        #endif
    }
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        // No such functionality on iOS 8/9
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
            if (notificationCenter != nil) {
                [[UNUserNotificationCenter currentNotificationCenter] removeAllDeliveredNotifications];
            }
        #endif
    }
}

RCT_EXPORT_METHOD(removeDeliveredNotification:(NSString*) notificationId) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        // No such functionality on iOS 8/9
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNUserNotificationCenter *notificationCenter = [UNUserNotificationCenter currentNotificationCenter];
            if (notificationCenter != nil) {
                [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[notificationId]];
            }
        #endif
    }
}

RCT_EXPORT_METHOD(scheduleNotification:(NSDictionary*) notification
                              resolver:(RCTPromiseResolveBlock)resolve
                              rejecter:(RCTPromiseRejectBlock)reject) {
    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        UILocalNotification* notif = [self buildUILocalNotification:notification withSchedule:true];
        [RCTSharedApplication() scheduleLocalNotification:notif];
        resolve(nil);
    } else {
        #if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
            UNNotificationRequest* request = [self buildUNNotificationRequest:notification withSchedule:true];
            [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
                if (!error) {
                    resolve(nil);
                }else{
                    reject(@"notification/schedule_notification_error", @"Failed to schedule notificaton", error);
                }
            }];
        #endif
    }
}

- (UILocalNotification*) buildUILocalNotification:(NSDictionary *) notification
                                     withSchedule:(BOOL) withSchedule {
    UILocalNotification *localNotification = [[UILocalNotification alloc] init];
    if (notification[@"body"]) {
        localNotification.alertBody = notification[@"body"];
    }
    if (notification[@"data"]) {
        localNotification.userInfo = notification[@"data"];
    }
    if (notification[@"sound"]) {
        localNotification.soundName = notification[@"sound"];
    }
    if (notification[@"title"]) {
        localNotification.alertTitle = notification[@"title"];
    }
    if (notification[@"ios"]) {
        NSDictionary *ios = notification[@"ios"];
        if (ios[@"alertAction"]) {
            localNotification.alertAction = ios[@"alertAction"];
        }
        if (ios[@"badge"]) {
            NSNumber *badge = ios[@"badge"];
            localNotification.applicationIconBadgeNumber = badge.integerValue;
        }
        if (ios[@"category"]) {
            localNotification.category = ios[@"category"];
        }
        if (ios[@"hasAction"]) {
            localNotification.hasAction = ios[@"hasAction"];
        }
        if (ios[@"launchImage"]) {
            localNotification.alertLaunchImage = ios[@"launchImage"];
        }
    }
    if (withSchedule) {
        NSDictionary *schedule = notification[@"schedule"];
        NSNumber *fireDateNumber = schedule[@"fireDate"];
        NSDate *fireDate = [NSDate dateWithTimeIntervalSince1970:([fireDateNumber doubleValue] / 1000.0)];
        localNotification.fireDate = fireDate;
        
        NSString *interval = schedule[@"repeatInterval"];
        if (interval) {
            if ([interval isEqualToString:@"minute"]) {
                localNotification.repeatInterval = NSCalendarUnitMinute;
            } else if ([interval isEqualToString:@"hour"]) {
                localNotification.repeatInterval = NSCalendarUnitHour;
            } else if ([interval isEqualToString:@"day"]) {
                localNotification.repeatInterval = NSCalendarUnitDay;
            } else if ([interval isEqualToString:@"week"]) {
                localNotification.repeatInterval = NSCalendarUnitWeekday;
            }
        }
        
    }
    
    return localNotification;
}

- (UNNotificationRequest*) buildUNNotificationRequest:(NSDictionary *) notification
                                         withSchedule:(BOOL) withSchedule {
    UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
    if (notification[@"body"]) {
        content.body = notification[@"body"];
    }
    if (notification[@"data"]) {
        content.userInfo = notification[@"data"];
    }
    if (notification[@"sound"]) {
        content.sound = notification[@"sound"];
    }
    if (notification[@"subtitle"]) {
        content.subtitle = notification[@"subtitle"];
    }
    if (notification[@"title"]) {
        content.title = notification[@"title"];
    }
    if (notification[@"ios"]) {
        NSDictionary *ios = notification[@"ios"];
        if (ios[@"attachments"]) {
            NSMutableArray *attachments = [[NSMutableArray alloc] init];
            for (NSDictionary *a in ios[@"attachments"]) {
                NSString *identifier = a[@"identifier"];
                NSURL *url = [NSURL URLWithString:a[@"url"]];
                NSDictionary *options = a[@"options"];
                
                NSError *error;
                UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:identifier URL:url options:options error:&error];
                if (attachment) {
                    [attachments addObject:attachment];
                } else {
                    NSLog(@"Failed to create attachment: %@", error);
                }
            }
            content.attachments = attachments;
        }

        if (ios[@"badge"]) {
            content.badge = ios[@"badge"];
        }
        if (ios[@"category"]) {
            content.categoryIdentifier = ios[@"category"];
        }
        if (ios[@"launchImage"]) {
            content.launchImageName = ios[@"launchImage"];
        }
        if (ios[@"threadIdentifier"]) {
            content.threadIdentifier = ios[@"threadIdentifier"];
        }
    }
    
    if (withSchedule) {
        NSDictionary *schedule = notification[@"schedule"];
        NSNumber *fireDateNumber = schedule[@"fireDate"];
        NSString *interval = schedule[@"repeatInterval"];
        NSDate *fireDate = [NSDate dateWithTimeIntervalSince1970:([fireDateNumber doubleValue] / 1000.0)];
        
        NSCalendarUnit calendarUnit;
        if (interval) {
            if ([interval isEqualToString:@"minute"]) {
                calendarUnit = NSCalendarUnitSecond;
            } else if ([interval isEqualToString:@"hour"]) {
                calendarUnit = NSCalendarUnitMinute | NSCalendarUnitSecond;
            } else if ([interval isEqualToString:@"day"]) {
                calendarUnit = NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
            } else if ([interval isEqualToString:@"week"]) {
                calendarUnit = NSCalendarUnitWeekday | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
            }
        } else {
            // Needs to match exactly to the secpmd
            calendarUnit = NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
        }
        
        NSDateComponents *components = [[NSCalendar currentCalendar] components:calendarUnit fromDate:fireDate];
        UNCalendarNotificationTrigger *trigger = [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:components repeats:interval];
        return [UNNotificationRequest requestWithIdentifier:notification[@"notificationId"] content:content trigger:trigger];
    } else {
        return [UNNotificationRequest requestWithIdentifier:notification[@"notificationId"] content:content trigger:nil];
    }
}

- (NSDictionary*) parseUILocalNotification:(UILocalNotification *) localNotification {
    NSMutableDictionary *notification = [[NSMutableDictionary alloc] init];
    
    if (localNotification.alertBody) {
        notification[@"body"] = localNotification.alertBody;
    }
    if (localNotification.userInfo) {
        notification[@"data"] = localNotification.userInfo;
    }
    if (localNotification.soundName) {
        notification[@"sound"] = localNotification.soundName;
    }
    if (localNotification.alertTitle) {
         notification[@"title"] = localNotification.alertTitle;
    }
    
    NSMutableDictionary *ios = [[NSMutableDictionary alloc] init];
    if (localNotification.alertAction) {
        ios[@"alertAction"] = localNotification.alertAction;
    }
    if (localNotification.applicationIconBadgeNumber) {
        ios[@"badge"] = @(localNotification.applicationIconBadgeNumber);
    }
    if (localNotification.category) {
        ios[@"category"] = localNotification.category;
    }
    if (localNotification.hasAction) {
        ios[@"hasAction"] = @(localNotification.hasAction);
    }
    if (localNotification.alertLaunchImage) {
        ios[@"launchImage"] = localNotification.alertLaunchImage;
    }
    notification[@"ios"] = ios;
    
    return notification;
}

- (NSDictionary*) parseUNNotificationRequest:(UNNotificationRequest *) localNotification {
    NSMutableDictionary *notification = [[NSMutableDictionary alloc] init];

    notification[@"notificationId"] = localNotification.identifier;
    
    if (localNotification.content.body) {
        notification[@"body"] = localNotification.content.body;
    }
    if (localNotification.content.userInfo) {
        notification[@"data"] = localNotification.content.userInfo;
    }
    if (localNotification.content.sound) {
        notification[@"sound"] = localNotification.content.sound;
    }
    if (localNotification.content.subtitle) {
        notification[@"subtitle"] = localNotification.content.subtitle;
    }
    if (localNotification.content.title) {
        notification[@"title"] = localNotification.content.title;
    }
    
    NSMutableDictionary *ios = [[NSMutableDictionary alloc] init];
    
    if (localNotification.content.attachments) {
        NSMutableArray *attachments = [[NSMutableArray alloc] init];
        for (UNNotificationAttachment *a in localNotification.content.attachments) {
            NSMutableDictionary *attachment = [[NSMutableDictionary alloc] init];
            attachment[@"identifier"] = a.identifier;
            attachment[@"type"] = a.type;
            attachment[@"url"] = [a.URL absoluteString];
            [attachments addObject:attachment];
        }
        ios[@"attachments"] = attachments;
    }
    
    if (localNotification.content.badge) {
        ios[@"badge"] = localNotification.content.badge;
    }
    if (localNotification.content.categoryIdentifier) {
        ios[@"category"] = localNotification.content.categoryIdentifier;
    }
    if (localNotification.content.launchImageName) {
        ios[@"launchImage"] = localNotification.content.launchImageName;
    }
    if (localNotification.content.threadIdentifier) {
        ios[@"threadIdentifier"] = localNotification.content.threadIdentifier;
    }
    notification[@"ios"] = ios;
    
    return notification;
}
    
- (NSDictionary*)parseUNNotificationResponse:(UNNotificationResponse *)response
                                 messageType:(NSString *)messageType {
     NSMutableDictionary *notificationResponse = [[NSMutableDictionary alloc] init];
     NSDictionary *notification = [self parseUNNotification:response.notification messageType:messageType];
     notificationResponse[@"notification"] = notification;
     notificationResponse[@"action"] = response.actionIdentifier;
     
     return notificationResponse;
}
    
- (NSDictionary*)parseUNNotification:(UNNotification *)notification
                         messageType:(NSString *)messageType {
    NSDictionary *userInfo = notification.request.content.userInfo;
    NSString *category = notification.request.content.categoryIdentifier;

    return [self parseUserInfo:userInfo messageType:messageType category:category];
}

- (NSDictionary*)parseUserInfo:(NSDictionary *)userInfo
                   messageType:(NSString *) messageType
                      category:(NSString *) category {
                    
    NSMutableDictionary *notification = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *ios = [[NSMutableDictionary alloc] init];

    for (id k1 in userInfo) {
        if ([k1 isEqualToString:@"aps"]) {
            NSDictionary *aps = userInfo[k1];
            for (id k2 in aps) {
                if ([k2 isEqualToString:@"alert"]) {
                    NSDictionary *alert = aps[k2];
                    for (id k3 in alert) {
                        if ([k3 isEqualToString:@"body"]) {
                            notification[@"body"] = alert[k3];
                        } else if ([k3 isEqualToString:@"subtitle"]) {
                            notification[@"subtitle"] = alert[k3];
                        } else if ([k3 isEqualToString:@"title"]) {
                            notification[@"title"] = alert[k3];
                        } else if ([k3 isEqualToString:@"loc-args"]
                                   || [k3 isEqualToString:@"loc-key"]
                                   || [k3 isEqualToString:@"title-loc-args"]
                                   || [k3 isEqualToString:@"title-loc-key"]) {
                            // Ignore known keys
                        } else {
                            NSLog(@"Unknown alert key: %@", k2);
                        }
                    }
                } else if ([k2 isEqualToString:@"badge"]) {
                    ios[@"badge"] = aps[k2];
                } else if ([k2 isEqualToString:@"category"]) {
                    ios[@"category"] = aps[k2];
                } else if ([k2 isEqualToString:@"sound"]) {
                    notification[@"sound"] = aps[k2];
                } else {
                    NSLog(@"Unknown aps key: %@", k2);
                }
            }
        } else if ([k1 isEqualToString:@"gcm.message_id"]) {
            notification[@"notificationId"] = userInfo[k1];
        } else if ([k1 isEqualToString:@"gcm.n.e"]
                   || [k1 isEqualToString:@"gcm.notification.sound2"]
                   || [k1 isEqualToString:@"google.c.a.c_id"]
                   || [k1 isEqualToString:@"google.c.a.c_l"]
                   || [k1 isEqualToString:@"google.c.a.e"]
                   || [k1 isEqualToString:@"google.c.a.udt"]
                   || [k1 isEqualToString:@"google.c.a.ts"]) {
            // Ignore known keys
        } else {
            // Assume custom data
            data[k1] = userInfo[k1];
        }
    }
                          
    if (!ios[@"category"]) {
        ios[@"category"] = category;
    }

    // TODO: What to do with this?
    // message[@"messageType"] = messageType;

    notification[@"data"] = data;
    notification[@"ios"] = ios;

    return notification;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[NOTIFICATIONS_NOTIFICATION_DISPLAYED, NOTIFICATIONS_NOTIFICATION_PRESSED, NOTIFICATIONS_NOTIFICATION_RECEIVED];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseNotifications
@end
#endif
