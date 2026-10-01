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
 */

#import "SceneDelegate.h"

#import "AppDelegate.h"
#import "RNFBMessagingModule.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTDefines.h>
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

static NSString *const RNFBTestingMetroHost = @"127.0.0.1";

static NSUInteger RNFBTestingMetroPortNumber(void)
{
  NSString *envPort = [[[NSProcessInfo processInfo] environment] objectForKey:@"RCT_METRO_PORT"];
  if (envPort.length > 0) {
    return (NSUInteger)[envPort integerValue];
  }
  return (NSUInteger)RCT_METRO_PORT;
}

static NSString *RNFBTestingMetroHostPort(void)
{
  return [NSString stringWithFormat:@"%@:%lu", RNFBTestingMetroHost, RNFBTestingMetroPortNumber()];
}

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }

  UIWindowScene *windowScene = (UIWindowScene *)scene;
  self.dependencyProvider = [RCTAppDependencyProvider new];
  self.reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:self];
  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
  AppDelegate *appDelegate = (AppDelegate *)UIApplication.sharedApplication.delegate;
  appDelegate.window = self.window;

  NSDictionary *initialProps = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:@{}];
  [self.reactNativeFactory startReactNativeWithModuleName:@"testing"
                                                 inWindow:self.window
                                        initialProperties:initialProps
                                        connectionOptions:connectionOptions];
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  [RCTLinkingManager scene:scene openURLContexts:URLContexts];
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
  [RCTLinkingManager scene:scene continueUserActivity:userActivity];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
  // Bypass RCTBundleURLProvider's localhost fallback — iOS 26+ simulators resolve 127.0.0.1 more reliably.
  return [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                           packagerHost:RNFBTestingMetroHostPort()
                                         packagerScheme:settings.packagerScheme ?: @"http"
                                              enableDev:settings.enableDev
                                     enableMinification:settings.enableMinification
                                        inlineSourceMap:settings.inlineSourceMap
                                            modulesOnly:NO
                                              runModule:YES];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
