/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <UIKit/UIKit.h>

@implementation UIApplication

+ (UIApplication *)sharedApplication {
  static UIApplication *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[UIApplication alloc] init];
    [shared resetForTesting];
  });
  return shared;
}

- (void)registerForRemoteNotifications {
}

- (void)unregisterForRemoteNotifications {
  self.unregisterForRemoteNotificationsCallCountForTesting += 1;
  self.registeredForRemoteNotifications = NO;
}

- (void)endBackgroundTask:(UIBackgroundTaskIdentifier)identifier {
  (void)identifier;
}

- (void)resetForTesting {
  self.applicationState = UIApplicationStateActive;
  self.registeredForRemoteNotifications = NO;
  self.unregisterForRemoteNotificationsCallCountForTesting = 0;
}

@end
