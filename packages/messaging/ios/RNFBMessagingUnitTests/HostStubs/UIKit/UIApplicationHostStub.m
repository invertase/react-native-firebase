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
  });
  return shared;
}

- (UIApplicationState)applicationState {
  return UIApplicationStateActive;
}

- (BOOL)isRegisteredForRemoteNotifications {
  return NO;
}

- (void)registerForRemoteNotifications {
}

- (void)unregisterForRemoteNotifications {
}

- (void)endBackgroundTask:(UIBackgroundTaskIdentifier)identifier {
}

@end
