/*
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

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase/Firebase.h>

@import Firebase;

@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  [FIRApp configureWithName:@"secondaryFromNative" options:[FIROptions defaultOptions]];
  NSURL *jsCodeLocation;
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"testing"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];


  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<NSString *, id> *)options {
  return NO;
}

- (BOOL)application:(nonnull UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
    (nonnull void (^)(NSArray<id <UIUserActivityRestoring>> *_Nullable))restorationHandler {
#else
  (nonnull void (^)(NSArray *_Nullable))restorationHandler {
#endif
  return NO;
}

- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
  NSLog(@"TESTING1");
  [self aTest];
  NSLog(@"TESTING2");
}

- (void)aTest {
  NSLog(@"TESTING3");
}

- (void)messaging:(nonnull FIRMessaging *)messaging didReceiveMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
  NSLog(@"TESTING1");
  [self aTest];
  NSLog(@"TESTING2");
}

@end
