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
#import <Firebase/Firebase.h>
#import <RNFBApp/RNFBJSON.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <React/RCTConvert.h>
#import <React/RCTRootView.h>

#import "RNFBMessaging+AppDelegate.h"
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

  RCTRootView *rctRootView;
  if ([UIApplication sharedApplication].delegate != nil &&
      [UIApplication sharedApplication].delegate.window != nil &&
      [UIApplication sharedApplication].delegate.window.rootViewController != nil &&
      [UIApplication sharedApplication].delegate.window.rootViewController.view != nil &&
      [[UIApplication sharedApplication].delegate.window.rootViewController.view
          isKindOfClass:[RCTRootView class]]) {
    rctRootView =
        (RCTRootView *)[UIApplication sharedApplication].delegate.window.rootViewController.view;
  }

#if !(TARGET_IPHONE_SIMULATOR)
  if ([[RNFBJSON shared] getBooleanValue:@"messaging_ios_auto_register_for_remote_messages"
                            defaultValue:YES]) {
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  }
#endif

  if (notification.userInfo[UIApplicationLaunchOptionsRemoteNotificationKey]) {
    if ([UIApplication sharedApplication].applicationState == UIApplicationStateBackground) {
      if (rctRootView != nil) {
        isHeadless = YES;
        NSMutableDictionary *appPropertiesDict = rctRootView.appProperties != nil
                                                     ? [rctRootView.appProperties mutableCopy]
                                                     : [NSMutableDictionary dictionary];
        if ([appPropertiesDict objectForKey:@"isHeadless"] != nil &&
            [appPropertiesDict[@"isHeadless"] isEqual:@([RCTConvert BOOL:@(NO)])]) {
          appPropertiesDict[@"isHeadless"] = @([RCTConvert BOOL:@(isHeadless)]);
          rctRootView.appProperties = appPropertiesDict;
        }
      }

#if !(TARGET_IPHONE_SIMULATOR)
      // When an app launches in the background (BG mode) and is launched with the notification
      // launch option the app delegate method
      // application:didReceiveRemoteNotification:fetchCompletionHandler: will not get called unless
      // registerForRemoteNotifications was called early during app initialization - we call it here
      // in this scenario as the user can only call this via JS, at which point it'd be too late
      // resulting in the app being terminated. called irregardless of
      // `messaging_ios_auto_register_for_remote_messages` as this is most likely an app launching
      // as a result of a remote notification - so has been registered previously
      [[UIApplication sharedApplication] registerForRemoteNotifications];
#endif
    } else {
      if (rctRootView != nil) {
        isHeadless = NO;
        NSMutableDictionary *appPropertiesDict = rctRootView.appProperties != nil
                                                     ? [rctRootView.appProperties mutableCopy]
                                                     : [NSMutableDictionary dictionary];
        if ([appPropertiesDict objectForKey:@"isHeadless"] != nil &&
            [appPropertiesDict[@"isHeadless"] isEqual:@([RCTConvert BOOL:@(YES)])]) {
          appPropertiesDict[@"isHeadless"] = @([RCTConvert BOOL:@(isHeadless)]);
          rctRootView.appProperties = appPropertiesDict;
        }
      }
    }
  } else {
    if (rctRootView != nil) {
      isHeadless = NO;
      NSMutableDictionary *appPropertiesDict = rctRootView.appProperties != nil
                                                   ? [rctRootView.appProperties mutableCopy]
                                                   : [NSMutableDictionary dictionary];
      if ([appPropertiesDict objectForKey:@"isHeadless"] != nil &&
          [appPropertiesDict[@"isHeadless"] isEqual:@([RCTConvert BOOL:@(YES)])]) {
        appPropertiesDict[@"isHeadless"] = @([RCTConvert BOOL:@(isHeadless)]);
        rctRootView.appProperties = appPropertiesDict;
      }
    }
  }
}

- (void)application_onDidEnterForeground {
  if ([UIApplication sharedApplication].delegate != nil &&
      [UIApplication sharedApplication].delegate.window != nil &&
      [UIApplication sharedApplication].delegate.window.rootViewController != nil &&
      [UIApplication sharedApplication].delegate.window.rootViewController.view != nil &&
      [[UIApplication sharedApplication].delegate.window.rootViewController.view
          isKindOfClass:[RCTRootView class]]) {
    RCTRootView *rctRootView =
        (RCTRootView *)[UIApplication sharedApplication].delegate.window.rootViewController.view;

    if (rctRootView.appProperties != nil &&
        [rctRootView.appProperties[@"isHeadless"] isEqual:@(YES)]) {
      NSMutableDictionary *appPropertiesDict = [rctRootView.appProperties mutableCopy];
      isHeadless = NO;
      if ([appPropertiesDict objectForKey:@"isHeadless"] != nil &&
          [appPropertiesDict[@"isHeadless"] isEqual:@([RCTConvert BOOL:@(YES)])]) {
        appPropertiesDict[@"isHeadless"] = @([RCTConvert BOOL:@(isHeadless)]);
        rctRootView.appProperties = appPropertiesDict;
      }
    }
  }
}

@end
