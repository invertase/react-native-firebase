/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Collaborators that RNFBMessaging+NSNotificationCenter.m starts after launch; not under test.
 */
#import <Foundation/Foundation.h>

@interface RNFBMessagingAppDelegate : NSObject
+ (instancetype)sharedInstance;
- (void)observe;
@end

@implementation RNFBMessagingAppDelegate

+ (instancetype)sharedInstance {
  static RNFBMessagingAppDelegate *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBMessagingAppDelegate alloc] init];
  });
  return shared;
}

- (void)observe {
}

@end

@interface RNFBMessagingUNUserNotificationCenter : NSObject
+ (instancetype)sharedInstance;
- (void)observe;
@end

@implementation RNFBMessagingUNUserNotificationCenter

+ (instancetype)sharedInstance {
  static RNFBMessagingUNUserNotificationCenter *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBMessagingUNUserNotificationCenter alloc] init];
  });
  return shared;
}

- (void)observe {
}

@end
