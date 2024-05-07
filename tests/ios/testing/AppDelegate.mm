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

#import "RNFBMessagingModule.h"
#import "RNFBAppCheckModule.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize RNFBAppCheckModule, it sets the custom RNFBAppCheckProviderFactory
  // which lets us configure any of the available native platform providers,
  // and reconfigure if needed, dynamically after `[FIRApp configure]` just like the other platforms.
  [RNFBAppCheckModule sharedInstance];
  
  // Install the AppCheck debug provider so we may get tokens on iOS Simulators for testing.
  // See https://firebase.google.com/docs/app-check/ios/debug-provider for instructions on configuring a debug token
  // This *must* be done before the `[FIRApp configure]` line, so it must be done in AppDelegate for any app
  // that wants to enforce AppCheck restrictions on their backend while also doing testing on iOS Simulator.
//  FIRAppCheckDebugProviderFactory *providerFactory = [[FIRAppCheckDebugProviderFactory alloc] init];
//  [FIRAppCheck setAppCheckProviderFactory:providerFactory];

  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  [FIRApp configureWithName:@"secondaryFromNative" options:[FIROptions defaultOptions]];

  self.moduleName = @"testing";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:@{}];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
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

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
