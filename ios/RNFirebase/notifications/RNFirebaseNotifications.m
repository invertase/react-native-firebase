#import "RNFirebaseNotifications.h"

#if __has_include(<FirebaseMessaging/FIRMessaging.h>)

@implementation RNFirebaseNotifications
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getInitialNotification:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    UILocalNotification *localUserInfo = [self bridge].launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];
    if (localUserInfo) {
        // TODO: Proper format
        resolve([[localUserInfo userInfo] copy]);
    } else {
        resolve(nil);
    }
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

