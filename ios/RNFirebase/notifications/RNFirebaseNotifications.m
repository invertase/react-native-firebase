#import "RNFirebaseNotifications.h"

#if __has_include(<FirebaseMessaging/FIRMessaging.h>)
#import <React/RCTUtils.h>

#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
@import UserNotifications;
#endif

@implementation RNFirebaseNotifications
RCT_EXPORT_MODULE();

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
        resolve(nil);
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

- (NSArray<NSString *> *)supportedEvents {
    return @[];
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

