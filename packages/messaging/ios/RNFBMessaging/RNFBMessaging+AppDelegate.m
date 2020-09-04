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

#import <objc/runtime.h>
#import <Firebase/Firebase.h>
#import <GoogleUtilities/GULAppDelegateSwizzler.h>

#import <React/RCTConvert.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>

#import "RNFBMessagingSerializer.h"
#import "RNFBMessaging+AppDelegate.h"

@implementation RNFBMessagingAppDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingAppDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingAppDelegate alloc] init];
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingAppDelegate *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingAppDelegate *strongSelf = weakSelf;

    [GULAppDelegateSwizzler registerAppDelegateInterceptor:strongSelf];
    [GULAppDelegateSwizzler proxyOriginalDelegateIncludingAPNSMethods];

    SEL didReceiveRemoteNotificationWithCompletionSEL =
        NSSelectorFromString(@"application:didReceiveRemoteNotification:fetchCompletionHandler:");
    if ([[GULAppDelegateSwizzler sharedApplication].delegate respondsToSelector:didReceiveRemoteNotificationWithCompletionSEL]) {
      // noop - user has own implementation of this method in their AppDelegate, this
      // means GULAppDelegateSwizzler will have already replaced it with a donor method
    } else {
      // add our own donor implementation of application:didReceiveRemoteNotification:fetchCompletionHandler:
      Method donorMethod = class_getInstanceMethod(
          object_getClass(strongSelf), didReceiveRemoteNotificationWithCompletionSEL
      );
      class_addMethod(
          object_getClass([GULAppDelegateSwizzler sharedApplication].delegate),
          didReceiveRemoteNotificationWithCompletionSEL,
          method_getImplementation(donorMethod),
          method_getTypeEncoding(donorMethod)
      );
    }
  });
}

// used to temporarily store a promise instance to resolve calls to `registerForRemoteNotifications`
- (void)setPromiseResolve:(RCTPromiseResolveBlock)resolve andPromiseReject:(RCTPromiseRejectBlock)reject {
  _registerPromiseResolver = resolve;
  _registerPromiseRejecter = reject;
}

#pragma mark -
#pragma mark AppDelegate Methods

// called when `registerForRemoteNotifications` completes successfully
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
#ifdef DEBUG
  [[FIRMessaging messaging] setAPNSToken:deviceToken type:FIRMessagingAPNSTokenTypeSandbox];
#else
  [[FIRMessaging messaging] setAPNSToken:deviceToken type:FIRMessagingAPNSTokenTypeProd];
#endif

  if (_registerPromiseResolver != nil) {
    _registerPromiseResolver(@([RCTConvert BOOL:@([UIApplication sharedApplication].isRegisteredForRemoteNotifications)]));
    _registerPromiseResolver = nil;
    _registerPromiseRejecter = nil;
  }
}

// called when `registerForRemoteNotifications` fails to complete
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  if (_registerPromiseRejecter != nil) {
    [RNFBSharedUtils rejectPromiseWithNSError:_registerPromiseRejecter error:error];
    _registerPromiseResolver = nil;
    _registerPromiseRejecter = nil;
  }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
  #if __has_include(<FirebaseAuth/FirebaseAuth.h>)
  if ([[FIRAuth auth] canHandleNotification:userInfo]) {
    completionHandler(UIBackgroundFetchResultNoData);
    return;
  }
  #endif
  
  [[NSNotificationCenter defaultCenter] postNotificationName:@"RNFBMessagingDidReceiveRemoteNotification" object:userInfo];
    
  if (userInfo[@"gcm.message_id"]) {
    if ([UIApplication sharedApplication].applicationState == UIApplicationStateBackground) {
      // If app is in background state, register background task to guarantee async queues aren't frozen.
      UIBackgroundTaskIdentifier __block backgroundTaskId = [application beginBackgroundTaskWithExpirationHandler:^{
            if (backgroundTaskId != UIBackgroundTaskInvalid) {
                [application endBackgroundTask:backgroundTaskId];
                backgroundTaskId = UIBackgroundTaskInvalid;
            }
      }];
      // TODO add support in a later version for calling completion handler directly from JS when user JS code complete
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t) (25 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        completionHandler(UIBackgroundFetchResultNewData);

        // Stop background task after the longest timeout, async queue is okay to freeze again after handling period
        if (backgroundTaskId != UIBackgroundTaskInvalid) {
            [application endBackgroundTask:backgroundTaskId];
            backgroundTaskId = UIBackgroundTaskInvalid;
        }
      });

      // TODO investigate later - RN bridge gets invalidated at start when in background and a new bridge created - losing all events
      // TODO   so we just delay sending the event for a few seconds as a workaround
      // TODO   most likely Remote Debugging causing bridge to be invalidated
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t) (8 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received_background" body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:userInfo]];
      });
    } else {
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:userInfo]];
      completionHandler(UIBackgroundFetchResultNoData);
    }
  }
}

@end
