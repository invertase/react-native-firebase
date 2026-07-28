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
#import "RNFBTestingCoverageProfile.h"
#import <Firebase.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTConstants.h>
#import <React/RCTDefines.h>

static NSString *const RNFBTestingMetroHost = @"127.0.0.1";
static const NSTimeInterval RNFBTestingMetroProbeTimeoutSec = 10.0;

static NSString *RNFBTestingMetroHostPort(void)
{
  return [NSString stringWithFormat:@"%@:%lu", RNFBTestingMetroHost, (unsigned long)RCT_METRO_PORT];
}

#if DEBUG
static void RNFBTestingConfigureMetroHost(void)
{
  [[RCTBundleURLProvider sharedSettings] setJsLocation:RNFBTestingMetroHostPort()];
}
#endif

static NSString *RNFBTestingDescribeApplicationState(UIApplicationState state)
{
  switch (state) {
    case UIApplicationStateActive:
      return @"active";
    case UIApplicationStateInactive:
      return @"inactive";
    case UIApplicationStateBackground:
      return @"background";
    default:
      return @"unknown";
  }
}

static NSString *RNFBTestingDescribeSceneActivationState(UISceneActivationState state)
{
  switch (state) {
    case UISceneActivationStateUnattached:
      return @"unattached";
    case UISceneActivationStateForegroundInactive:
      return @"foregroundInactive";
    case UISceneActivationStateForegroundActive:
      return @"foregroundActive";
    case UISceneActivationStateBackground:
      return @"background";
    default:
      return @"unknown";
  }
}

static void RNFBTestingLogLifecycle(NSString *event)
{
  UIApplication *app = UIApplication.sharedApplication;
  NSMutableString *sceneSummary = [NSMutableString string];
  for (UIScene *scene in app.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    UIWindowScene *windowScene = (UIWindowScene *)scene;
    [sceneSummary appendFormat:@" %@=%@",
                              scene.session.persistentIdentifier,
                              RNFBTestingDescribeSceneActivationState(windowScene.activationState)];
  }
  if (sceneSummary.length == 0) {
    [sceneSummary appendString:@" (no UIWindowScene)"];
  }
  NSLog(@"[rnfb-lifecycle] event=%@ UIApplication.state=%@ scenes:%@",
        event,
        RNFBTestingDescribeApplicationState(app.applicationState),
        sceneSummary);
}

static void RNFBTestingScheduleLifecycleProbes(void)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(30 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      RNFBTestingLogLifecycle(@"probe+30s");
    });
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(60 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      RNFBTestingLogLifecycle(@"probe+60s");
    });
  });
}

static void RNFBTestingRegisterLifecycleObservers(id observer)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSNotificationCenter *center = NSNotificationCenter.defaultCenter;
    NSArray<NSString *> *names = @[
      UIApplicationDidBecomeActiveNotification,
      UIApplicationWillResignActiveNotification,
      UIApplicationDidEnterBackgroundNotification,
      UIApplicationWillEnterForegroundNotification,
      UISceneDidActivateNotification,
      UISceneWillDeactivateNotification,
      UISceneDidEnterBackgroundNotification,
      UISceneWillEnterForegroundNotification,
    ];
    for (NSString *name in names) {
      [center addObserver:observer selector:@selector(rnfb_applicationLifecycleNotification:) name:name object:nil];
    }
  });
}

#if DEBUG
static void RNFBTestingLogPackagerProbe(NSString *context)
{
  NSString *hostPort = [[RCTBundleURLProvider sharedSettings] packagerServerHostPort] ?: @"(nil)";
  BOOL isRunning = [RCTBundleURLProvider isPackagerRunning:RNFBTestingMetroHostPort()];
  NSURL *bundleURL = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  NSLog(@"[rnfb-lifecycle] event=packager-probe context=%@ isPackagerRunning=%@ hostPort=%@ bundleURL=%@",
        context,
        isRunning ? @"YES" : @"NO",
        hostPort,
        bundleURL.absoluteString ?: @"(nil)");

  NSString *statusURLString =
      [NSString stringWithFormat:@"http://%@/status", RNFBTestingMetroHostPort()];
  NSURL *statusURL = [NSURL URLWithString:statusURLString];
  dispatch_semaphore_t sem = dispatch_semaphore_create(0);
  __block NSString *probeResult = @"pending";

  NSURLSessionConfiguration *config = [NSURLSessionConfiguration ephemeralSessionConfiguration];
  config.timeoutIntervalForRequest = RNFBTestingMetroProbeTimeoutSec;
  config.timeoutIntervalForResource = RNFBTestingMetroProbeTimeoutSec;
  NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
  NSURLSessionDataTask *task = [session dataTaskWithURL:statusURL
                                      completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                                        if (error) {
                                          probeResult =
                                              [NSString stringWithFormat:@"error domain=%@ code=%ld desc=%@",
                                                                         error.domain,
                                                                         (long)error.code,
                                                                         error.localizedDescription ?: @""];
                                        } else {
                                          NSHTTPURLResponse *http = (NSHTTPURLResponse *)response;
                                          NSString *body =
                                              data ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                                                   : @"";
                                          if (body.length > 120) {
                                            body = [[body substringToIndex:120] stringByAppendingString:@"..."];
                                          }
                                          probeResult = [NSString stringWithFormat:@"httpStatus=%ld body=%@",
                                                                                   (long)http.statusCode,
                                                                                   body ?: @""];
                                        }
                                        dispatch_semaphore_signal(sem);
                                      }];
  [task resume];

  long wait = dispatch_semaphore_wait(
      sem, dispatch_time(DISPATCH_TIME_NOW, (int64_t)((RNFBTestingMetroProbeTimeoutSec + 1) * NSEC_PER_SEC)));
  if (wait != 0) {
    probeResult =
        [NSString stringWithFormat:@"probe-timed-out-after-%.0fs", RNFBTestingMetroProbeTimeoutSec];
    [task cancel];
  }

  NSLog(@"[rnfb-lifecycle] event=packager-status-fetch context=%@ url=%@ result=%@",
        context,
        statusURLString,
        probeResult);
}

static void RNFBTestingRegisterJavaScriptLoadObservers(id observer)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSNotificationCenter *center = NSNotificationCenter.defaultCenter;
    [center addObserver:observer
               selector:@selector(rnfb_javascriptWillStartLoading:)
                   name:RCTJavaScriptWillStartLoadingNotification
                 object:nil];
    [center addObserver:observer
               selector:@selector(rnfb_javascriptDidFailToLoad:)
                   name:RCTJavaScriptDidFailToLoadNotification
                 object:nil];
  });
}
#endif

@implementation AppDelegate
- (void)rnfb_applicationLifecycleNotification:(NSNotification *)notification
{
  RNFBTestingLogLifecycle(notification.name);
}

#if DEBUG
- (void)rnfb_javascriptWillStartLoading:(NSNotification *)notification
{
  RNFBTestingLogLifecycle(@"RCTJavaScriptWillStartLoading");
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_UTILITY, 0), ^{
    RNFBTestingLogPackagerProbe(@"will-start-loading");
  });
}

- (void)rnfb_javascriptDidFailToLoad:(NSNotification *)notification
{
  NSError *error = notification.userInfo[@"error"];
  if ([error isKindOfClass:[NSError class]]) {
    NSLog(@"[rnfb-lifecycle] event=RCTJavaScriptDidFailToLoad error domain=%@ code=%ld desc=%@",
          error.domain,
          (long)error.code,
          error.localizedDescription ?: @"");
  } else {
    RNFBTestingLogLifecycle(@"RCTJavaScriptDidFailToLoad");
  }

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_UTILITY, 0), ^{
    RNFBTestingLogPackagerProbe(@"did-fail-to-load");
  });
}
#endif

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RNFBTestingRegisterLifecycleObservers(self);
#if DEBUG
  RNFBTestingConfigureMetroHost();
  RNFBTestingRegisterJavaScriptLoadObservers(self);
#endif
  RNFBTestingScheduleLifecycleProbes();
  RNFBTestingLogLifecycle(@"didFinishLaunching+before");

  RNFBTestingConfigureCoverageProfilePath();

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
  BOOL didFinish = [super application:application didFinishLaunchingWithOptions:launchOptions];
  RNFBTestingLogLifecycle(@"didFinishLaunching+after");
  return didFinish;
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
  RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
  // Bypass RCTBundleURLProvider's localhost fallback — iOS 26 simulators resolve 127.0.0.1 more reliably.
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
