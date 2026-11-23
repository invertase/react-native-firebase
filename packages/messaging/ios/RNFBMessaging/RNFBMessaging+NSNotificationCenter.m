/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#else
@import FirebaseCore;
@import FirebaseMessaging;
#endif
#import <RNFBApp/RNFBJSON.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTConvert.h>

#import "RNFBMessaging+AppDelegatePrivate.h"
#import "RNFBMessaging+FIRMessagingDelegate.h"
#import "RNFBMessaging+NSNotificationCenter.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"

@implementation RNFBMessagingNSNotificationCenter
@synthesize isHeadless;
+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingNSNotificationCenter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingNSNotificationCenter alloc] init];
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingNSNotificationCenter *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingNSNotificationCenter *strongSelf = weakSelf;

    // Application
    // JS -> `getInitialNotification`
    // ObjC -> Initialize other delegates & observers
    [[NSNotificationCenter defaultCenter]
        addObserver:strongSelf
           selector:@selector(application_onDidFinishLaunchingNotification:)
               name:UIApplicationDidFinishLaunchingNotification
             object:nil];

    // Application
    // ObjC - > Mutates the root React components initialProps to toggle `isHeadless` state
    [[NSNotificationCenter defaultCenter] addObserver:strongSelf
                                             selector:@selector(application_onDidEnterForeground)
                                                 name:UIApplicationWillEnterForegroundNotification
                                               object:nil];
  });
}

// start observing immediately on class load - specifically for
// UIApplicationDidFinishLaunchingNotification
+ (void)load {
  [[self sharedInstance] observe];
}

#pragma mark -
#pragma mark Application Notifications

- (void)application_onDidFinishLaunchingNotification:(nonnull NSNotification *)notification {
  // setup our delegates & swizzling after app finishes launching
  // these methods are idempotent so can safely be called multiple times
  [[RNFBMessagingAppDelegate sharedInstance] observe];
  [[RNFBMessagingUNUserNotificationCenter sharedInstance] observe];
  [[RNFBMessagingFIRMessagingDelegate sharedInstance] observe];

  if ([[RNFBJSON shared] getBooleanValue:@"messaging_ios_auto_register_for_remote_messages"
                            defaultValue:YES]) {
#if TARGET_IPHONE_SIMULATOR && TARGET_CPU_ARM64
    // Intentional: do not call UIKit registerForRemoteNotifications on ARM64 Simulator —
    // it can wedge the main thread indefinitely. Physical devices and Intel Simulator still
    // poke UIKit. See okf-bundle/packages/messaging/ios-apns-simulator-registration.md.
    DLog(@"RNFBMessaging auto-register - ARM64 Simulator detected, "
         @"skipping UIKit registerForRemoteNotifications.");
#else
    [[UIApplication sharedApplication] registerForRemoteNotifications];
#endif
  }

  if (notification.userInfo[UIApplicationLaunchOptionsRemoteNotificationKey]) {
    if ([UIApplication sharedApplication].applicationState == UIApplicationStateBackground) {
      isHeadless = YES;
      [self syncRootViewHeadlessProperty];

      // When an app launches in the background (BG mode) and is launched with the notification
      // launch option the app delegate method
      // application:didReceiveRemoteNotification:fetchCompletionHandler: will not get called unless
      // registerForRemoteNotifications was called early during app initialization - we call it here
      // in this scenario as the user can only call this via JS, at which point it'd be too late
      // resulting in the app being terminated. called irregardless of
      // `messaging_ios_auto_register_for_remote_messages` as this is most likely an app launching
      // as a result of a remote notification - so has been registered previously
#if TARGET_IPHONE_SIMULATOR && TARGET_CPU_ARM64
      DLog(@"RNFBMessaging background launch register - ARM64 Simulator detected, "
           @"skipping UIKit registerForRemoteNotifications.");
#else
      [[UIApplication sharedApplication] registerForRemoteNotifications];
#endif
    } else {
      isHeadless = NO;
      [self syncRootViewHeadlessProperty];
    }
  } else {
    isHeadless = NO;
    [self syncRootViewHeadlessProperty];
  }
}

- (void)application_onDidEnterForeground {
  isHeadless = NO;
  [self syncRootViewHeadlessProperty];
}

// RCTRootView or RCTSurfaceHostingProxyRootView (bridgeless), in the app delegate window and
// in every connected window scene, also behind container and presented view controllers
- (void)syncRootViewHeadlessProperty {
  NSMutableArray<UIWindow *> *windows = [NSMutableArray array];
  id<UIApplicationDelegate> delegate = [UIApplication sharedApplication].delegate;
  // `window` is optional on UIApplicationDelegate; scene-based apps may not implement it.
  if ([delegate respondsToSelector:@selector(window)] && delegate.window != nil) {
    [windows addObject:delegate.window];
  }
  for (UIScene *scene in [UIApplication sharedApplication].connectedScenes) {
    if ([scene isKindOfClass:[UIWindowScene class]]) {
      [windows addObjectsFromArray:((UIWindowScene *)scene).windows];
    }
  }
  NSMutableArray<UIView *> *views = [NSMutableArray array];
  for (UIWindow *window in windows) {
    [self collectLoadedViewsOfViewController:window.rootViewController into:views];
  }
  NSNumber *value = @([RCTConvert BOOL:@(isHeadless)]);
  for (UIView *view in views) {
    if (![view respondsToSelector:@selector(appProperties)] ||
        ![view respondsToSelector:@selector(setAppProperties:)]) {
      continue;
    }
    NSDictionary *appProperties = [view valueForKey:@"appProperties"];
    if (![appProperties isKindOfClass:[NSDictionary class]] ||
        appProperties[@"isHeadless"] == nil || [appProperties[@"isHeadless"] isEqual:value]) {
      continue;
    }
    NSMutableDictionary *appPropertiesDict = [appProperties mutableCopy];
    appPropertiesDict[@"isHeadless"] = value;
    [view setValue:appPropertiesDict forKey:@"appProperties"];
  }
}

- (void)collectLoadedViewsOfViewController:(UIViewController *)controller
                                      into:(NSMutableArray<UIView *> *)views {
  if (controller == nil) {
    return;
  }
  if (controller.viewIfLoaded != nil) {
    [views addObject:controller.viewIfLoaded];
  }
  for (UIViewController *child in controller.childViewControllers) {
    [self collectLoadedViewsOfViewController:child into:views];
  }
  [self collectLoadedViewsOfViewController:controller.presentedViewController into:views];
}

@end
