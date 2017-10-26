#import "RNFirebaseMessaging.h"

@import UserNotifications;
#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <FirebaseInstanceID/FIRInstanceID.h>

#import <React/RCTEventDispatcher.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@implementation RCTConvert (NSCalendarUnit)

RCT_ENUM_CONVERTER(NSCalendarUnit,
                   (@{
                      @"year": @(NSCalendarUnitYear),
                      @"month": @(NSCalendarUnitMonth),
                      @"week": @(NSCalendarUnitWeekOfYear),
                      @"day": @(NSCalendarUnitDay),
                      @"hour": @(NSCalendarUnitHour),
                      @"minute": @(NSCalendarUnitMinute)
                      }),
                   0,
                   integerValue)
@end


@implementation RCTConvert (UNNotificationRequest)

+ (UNNotificationRequest *)UNNotificationRequest:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    UNMutableNotificationContent *content = [UNMutableNotificationContent new];
    content.title =[RCTConvert NSString:details[@"title"]];
    content.body =[RCTConvert NSString:details[@"body"]];
    NSString* sound = [RCTConvert NSString:details[@"sound"]];
    if(sound != nil){
        content.sound = [UNNotificationSound soundNamed:sound];
    }else{
        content.sound = [UNNotificationSound defaultSound];
    }
    content.categoryIdentifier = [RCTConvert NSString:details[@"click_action"]];
    content.userInfo = details;
    content.badge = [RCTConvert NSNumber:details[@"badge"]];

    NSDate *fireDate = [RCTConvert NSDate:details[@"fire_date"]];

    if(fireDate == nil){
        return [UNNotificationRequest requestWithIdentifier:[RCTConvert NSString:details[@"id"]] content:content trigger:nil];
    }

    NSCalendarUnit interval = [RCTConvert NSCalendarUnit:details[@"repeat_interval"]];
    NSCalendarUnit unitFlags;
    switch (interval) {
        case NSCalendarUnitMinute: {
            unitFlags = NSCalendarUnitSecond;
            break;
        }
        case NSCalendarUnitHour: {
            unitFlags = NSCalendarUnitMinute | NSCalendarUnitSecond;
            break;
        }
        case NSCalendarUnitDay: {
            unitFlags = NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
            break;
        }
        case NSCalendarUnitWeekOfYear: {
            unitFlags = NSCalendarUnitWeekday | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
            break;
        }
        case NSCalendarUnitMonth:{
            unitFlags = NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
        }
        case NSCalendarUnitYear:{
            unitFlags = NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
        }
        default:
            unitFlags = NSCalendarUnitDay | NSCalendarUnitMonth | NSCalendarUnitYear | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
            break;
    }
    NSDateComponents *components = [[NSCalendar currentCalendar] components:unitFlags fromDate:fireDate];
    UNCalendarNotificationTrigger *trigger = [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:components repeats:interval != 0];
    return [UNNotificationRequest requestWithIdentifier:[RCTConvert NSString:details[@"id"]] content:content trigger:trigger];
}

@end

@implementation RCTConvert (UILocalNotification)

+ (UILocalNotification *)UILocalNotification:(id)json
{
    NSDictionary<NSString *, id> *details = [self NSDictionary:json];
    UILocalNotification *notification = [UILocalNotification new];
    notification.fireDate = [RCTConvert NSDate:details[@"fire_date"]] ?: [NSDate date];
    if([notification respondsToSelector:@selector(setAlertTitle:)]){
        [notification setAlertTitle:[RCTConvert NSString:details[@"title"]]];
    }
    notification.alertBody = [RCTConvert NSString:details[@"body"]];
    notification.alertAction = [RCTConvert NSString:details[@"alert_action"]];
    notification.soundName = [RCTConvert NSString:details[@"sound"]] ?: UILocalNotificationDefaultSoundName;
    notification.userInfo = details;
    notification.category = [RCTConvert NSString:details[@"click_action"]];
    notification.repeatInterval = [RCTConvert NSCalendarUnit:details[@"repeat_interval"]];
    notification.applicationIconBadgeNumber = [RCTConvert NSInteger:details[@"badge"]];
    return notification;
}

RCT_ENUM_CONVERTER(UIBackgroundFetchResult, (@{
                                               @"UIBackgroundFetchResultNewData": @(UIBackgroundFetchResultNewData),
                                               @"UIBackgroundFetchResultNoData": @(UIBackgroundFetchResultNoData),
                                               @"UIBackgroundFetchResultFailed": @(UIBackgroundFetchResultFailed),
                                               }), UIBackgroundFetchResultNoData, integerValue)

RCT_ENUM_CONVERTER(UNNotificationPresentationOptions, (@{
                                                         @"UNNotificationPresentationOptionAll": @(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound),
                                                         @"UNNotificationPresentationOptionNone": @(UNNotificationPresentationOptionNone)}), UIBackgroundFetchResultNoData, integerValue)

@end

@interface RNFirebaseMessaging ()
@property (nonatomic, strong) NSMutableDictionary *notificationCallbacks;
@end

@implementation RNFirebaseMessaging

RCT_EXPORT_MODULE()

+ (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
    NSMutableDictionary* data = [[NSMutableDictionary alloc] initWithDictionary: userInfo];
    [data setValue:@"remote_notification" forKey:@"_notificationType"];
    [data setValue:@(RCTSharedApplication().applicationState == UIApplicationStateInactive) forKey:@"opened_from_tray"];
    [[NSNotificationCenter defaultCenter] postNotificationName:MESSAGING_NOTIFICATION_RECEIVED object:self userInfo:@{@"data": data}];
}

+ (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull RCTRemoteNotificationCallback)completionHandler {
    NSMutableDictionary* data = [[NSMutableDictionary alloc] initWithDictionary: userInfo];
    [data setValue:@"remote_notification" forKey:@"_notificationType"];
    [data setValue:@(RCTSharedApplication().applicationState == UIApplicationStateInactive) forKey:@"opened_from_tray"];
    [[NSNotificationCenter defaultCenter] postNotificationName:MESSAGING_NOTIFICATION_RECEIVED object:self userInfo:@{@"data": data, @"completionHandler": completionHandler}];
}

+ (void)didReceiveLocalNotification:(UILocalNotification *)notification {
    NSMutableDictionary* data = [[NSMutableDictionary alloc] initWithDictionary: notification.userInfo];
    [data setValue:@"local_notification" forKey:@"_notificationType"];
    [data setValue:@(RCTSharedApplication().applicationState == UIApplicationStateInactive) forKey:@"opened_from_tray"];
    [[NSNotificationCenter defaultCenter] postNotificationName:MESSAGING_NOTIFICATION_RECEIVED object:self userInfo:@{@"data": data}];
}

+ (void)willPresentNotification:(UNNotification *)notification withCompletionHandler:(nonnull RCTWillPresentNotificationCallback)completionHandler
{
    NSMutableDictionary* data = [[NSMutableDictionary alloc] initWithDictionary: notification.request.content.userInfo];
    [data setValue:@"will_present_notification" forKey:@"_notificationType"];
    [[NSNotificationCenter defaultCenter] postNotificationName:MESSAGING_NOTIFICATION_RECEIVED object:self userInfo:@{@"data": data, @"completionHandler": completionHandler}];
}

+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(nonnull RCTNotificationResponseCallback)completionHandler
{
    NSMutableDictionary* data = [[NSMutableDictionary alloc] initWithDictionary: response.notification.request.content.userInfo];
    [data setValue:@"notification_response" forKey:@"_notificationType"];
    [data setValue:@YES forKey:@"opened_from_tray"];
    if (response.actionIdentifier) {
        [data setValue:response.actionIdentifier forKey:@"_actionIdentifier"];
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:MESSAGING_NOTIFICATION_RECEIVED object:self userInfo:@{@"data": data, @"completionHandler": completionHandler}];
}

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

    // Set up listeners for data messages
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendDataMessageFailure:)
                                                 name:FIRMessagingSendErrorNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendDataMessageSuccess:)
                                                 name:FIRMessagingSendSuccessNotification
                                               object:nil];

    // Set up internal listener to send notification over bridge
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleNotificationReceived:)
                                                 name:MESSAGING_NOTIFICATION_RECEIVED
                                               object:nil];

    // Set this as a delegate for FIRMessaging
    dispatch_async(dispatch_get_main_queue(), ^{
        [FIRMessaging messaging].delegate = self;
    });
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleNotificationReceived:(NSNotification *)notification {
    id completionHandler = notification.userInfo[@"completionHandler"];
    NSMutableDictionary* data = notification.userInfo[@"data"];
    if(completionHandler != nil){
        NSString *completionHandlerId = [[NSUUID UUID] UUIDString];
        if (!self.notificationCallbacks) {
            // Lazy initialization
            self.notificationCallbacks = [NSMutableDictionary dictionary];
        }
        self.notificationCallbacks[completionHandlerId] = completionHandler;
        data[@"_completionHandlerId"] = completionHandlerId;
    }

    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_NOTIFICATION_RECEIVED body:data];
}


- (void)sendDataMessageFailure:(NSNotification *)notification {
    NSString *messageID = (NSString *)notification.userInfo[@"messageID"];
    NSLog(@"sendDataMessageFailure: %@", messageID);
}

- (void)sendDataMessageSuccess:(NSNotification *)notification {
    NSString *messageID = (NSString *)notification.userInfo[@"messageID"];
    NSLog(@"sendDataMessageSuccess: %@", messageID);
}

// ** Start FIRMessagingDelegate methods **
// Handle data messages in the background
- (void)applicationReceivedRemoteMessage:(FIRMessagingRemoteMessage *)remoteMessage {
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_NOTIFICATION_RECEIVED body:[remoteMessage appData]];
}

// Listen for token refreshes
- (void)messaging:(nonnull FIRMessaging *)messaging didRefreshRegistrationToken:(nonnull NSString *)fcmToken {
    NSLog(@"FCM registration token: %@", fcmToken);
    [RNFirebaseUtil sendJSEvent:self name:MESSAGING_TOKEN_REFRESHED body:fcmToken];
}
// ** End FIRMessagingDelegate methods **

// ** Start React Module methods **
RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    UILocalNotification *localUserInfo = [self bridge].launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];
    if (localUserInfo) {
        resolve([[localUserInfo userInfo] copy]);
    } else {
        resolve([[self bridge].launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey] copy]);
    }
}

RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([FIRMessaging messaging].FCMToken);
}

RCT_EXPORT_METHOD(deleteInstanceId:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[FIRInstanceID instanceID] deleteIDWithHandler:^(NSError * _Nullable error) {
        if (!error) {
            resolve(nil);
        } else {
            reject(@"instance_id_error", @"Failed to delete instance id", error);
        }
    }];
}

RCT_EXPORT_METHOD(requestPermissions:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (RCTRunningInAppExtension()) {
        return;
    }

    if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
        UIUserNotificationType allNotificationTypes =
        (UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge);
        UIUserNotificationSettings *settings =
        [UIUserNotificationSettings settingsForTypes:allNotificationTypes categories:nil];
        [RCTSharedApplication() registerUserNotificationSettings:settings];
        // Unfortunately on iOS 9 or below, there's no way to tell whether the user accepted or
        // rejected the permissions popup
        resolve(@{@"status":@"unknown"});
    } else {
        // iOS 10 or later
#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
        // For iOS 10 display notification (sent via APNS)
        [UNUserNotificationCenter currentNotificationCenter].delegate = self;
        UNAuthorizationOptions authOptions =
        UNAuthorizationOptionAlert
        | UNAuthorizationOptionSound
        | UNAuthorizationOptionBadge;
        [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError * _Nullable error) {
            resolve(@{@"granted":@(granted)});
        }];
#endif
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() registerForRemoteNotifications];
    });
}

RCT_EXPORT_METHOD(subscribeToTopic: (NSString*) topic) {
    [[FIRMessaging messaging] subscribeToTopic:topic];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic: (NSString*) topic) {
    [[FIRMessaging messaging] unsubscribeFromTopic:topic];
}

RCT_EXPORT_METHOD(createLocalNotification:(id)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        UNNotificationRequest* request = [RCTConvert UNNotificationRequest:data];
        [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
            if (!error) {
                resolve(nil);
            }else{
                reject(@"notification_error", @"Failed to present local notificaton", error);
            }
        }];
    }else{
        UILocalNotification* notif = [RCTConvert UILocalNotification:data];
        [RCTSharedApplication() presentLocalNotificationNow:notif];
        resolve(nil);
    }
}

RCT_EXPORT_METHOD(scheduleLocalNotification:(id)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        UNNotificationRequest* request = [RCTConvert UNNotificationRequest:data];
        [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
            if (!error) {
                resolve(nil);
            }else{
                reject(@"notification_error", @"Failed to present local notificaton", error);
            }
        }];
    }else{
        UILocalNotification* notif = [RCTConvert UILocalNotification:data];
        [RCTSharedApplication() scheduleLocalNotification:notif];
        resolve(nil);
    }
}

RCT_EXPORT_METHOD(removeDeliveredNotification:(NSString*) notificationId) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[notificationId]];
    }
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        [[UNUserNotificationCenter currentNotificationCenter] removeAllDeliveredNotifications];
    } else {
        [RCTSharedApplication() setApplicationIconBadgeNumber: 0];
    }
}

RCT_EXPORT_METHOD(cancelAllLocalNotifications) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        [[UNUserNotificationCenter currentNotificationCenter] removeAllPendingNotificationRequests];
    } else {
        [RCTSharedApplication() cancelAllLocalNotifications];
    }
}

RCT_EXPORT_METHOD(cancelLocalNotification:(NSString*) notificationId) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        [[UNUserNotificationCenter currentNotificationCenter] removePendingNotificationRequestsWithIdentifiers:@[notificationId]];
    } else {
        for (UILocalNotification *notification in RCTSharedApplication().scheduledLocalNotifications) {
            NSDictionary<NSString *, id> *notificationInfo = notification.userInfo;
            if([notificationId isEqualToString:[notificationInfo valueForKey:@"id"]]){
                [RCTSharedApplication() cancelLocalNotification:notification];
            }
        }
    }
}

RCT_EXPORT_METHOD(getScheduledLocalNotifications:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if([UNUserNotificationCenter currentNotificationCenter] != nil){
        [[UNUserNotificationCenter currentNotificationCenter] getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> * _Nonnull requests) {
            NSMutableArray* list = [[NSMutableArray alloc] init];
            for(UNNotificationRequest * notif in requests){
                UNMutableNotificationContent *content = notif.content;
                [list addObject:content.userInfo];
            }
            resolve(list);
        }];
    } else {
        NSMutableArray* list = [[NSMutableArray alloc] init];
        for(UILocalNotification * notif in [RCTSharedApplication() scheduledLocalNotifications]){
            [list addObject:notif.userInfo];
        }
        resolve(list);
    }
}

RCT_EXPORT_METHOD(setBadgeNumber: (NSInteger*) number) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [RCTSharedApplication() setApplicationIconBadgeNumber:number];
    });
}

RCT_EXPORT_METHOD(getBadgeNumber: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([RCTSharedApplication() applicationIconBadgeNumber]));
}

RCT_EXPORT_METHOD(send:(NSDictionary *)remoteMessage) {
    int64_t ttl = @([[remoteMessage valueForKey:@"ttl"] intValue]).doubleValue;
    NSString * mId = [remoteMessage valueForKey:@"id"];
    NSString * receiver = [remoteMessage valueForKey:@"sender"];
    NSDictionary * data = [remoteMessage valueForKey:@"data"];
    [[FIRMessaging messaging] sendMessage:data to:receiver withMessageID:mId timeToLive:ttl];
}

RCT_EXPORT_METHOD(finishRemoteNotification: (NSString *)completionHandlerId fetchResult:(UIBackgroundFetchResult)result) {
    RCTRemoteNotificationCallback completionHandler = self.notificationCallbacks[completionHandlerId];
    if (!completionHandler) {
        RCTLogError(@"There is no completion handler with completionHandlerId: %@", completionHandlerId);
        return;
    }
    completionHandler(result);
    [self.notificationCallbacks removeObjectForKey:completionHandlerId];
}

RCT_EXPORT_METHOD(finishWillPresentNotification: (NSString *)completionHandlerId fetchResult:(UNNotificationPresentationOptions)result) {
    RCTWillPresentNotificationCallback completionHandler = self.notificationCallbacks[completionHandlerId];
    if (!completionHandler) {
        RCTLogError(@"There is no completion handler with completionHandlerId: %@", completionHandlerId);
        return;
    }
    completionHandler(result);
    [self.notificationCallbacks removeObjectForKey:completionHandlerId];
}

RCT_EXPORT_METHOD(finishNotificationResponse: (NSString *)completionHandlerId) {
    RCTNotificationResponseCallback completionHandler = self.notificationCallbacks[completionHandlerId];
    if (!completionHandler) {
        RCTLogError(@"There is no completion handler with completionHandlerId: %@", completionHandlerId);
        return;
    }
    completionHandler();
    [self.notificationCallbacks removeObjectForKey:completionHandlerId];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[MESSAGING_TOKEN_REFRESHED, MESSAGING_NOTIFICATION_RECEIVED];
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
