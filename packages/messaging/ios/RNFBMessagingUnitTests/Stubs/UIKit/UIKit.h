/**
 * Host-test stand-in for the UIKit symbols referenced by the messaging iOS sources. The unit
 * project runs on a macOS destination (IosTest-AD-1), which has no UIKit.
 */

#import <Foundation/Foundation.h>

@protocol UIApplicationDelegate <NSObject>
@end

typedef NS_ENUM(NSInteger, UIApplicationState) {
  UIApplicationStateActive,
  UIApplicationStateInactive,
  UIApplicationStateBackground,
};

typedef NS_ENUM(NSUInteger, UIBackgroundFetchResult) {
  UIBackgroundFetchResultNewData,
  UIBackgroundFetchResultNoData,
  UIBackgroundFetchResultFailed,
};

typedef NSUInteger UIBackgroundTaskIdentifier;
static const UIBackgroundTaskIdentifier UIBackgroundTaskInvalid = 0;

static NSString *const UIApplicationLaunchOptionsRemoteNotificationKey =
    @"UIApplicationLaunchOptionsRemoteNotificationKey";

@interface UIApplication : NSObject
+ (UIApplication *)sharedApplication;
@property(nonatomic, weak) id<UIApplicationDelegate> delegate;
@property(nonatomic, readonly) UIApplicationState applicationState;
@property(nonatomic, readonly, getter=isRegisteredForRemoteNotifications)
    BOOL registeredForRemoteNotifications;
- (void)registerForRemoteNotifications;
- (void)unregisterForRemoteNotifications;
- (void)endBackgroundTask:(UIBackgroundTaskIdentifier)identifier;
@end
