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
#import <GoogleUtilities/GULAppDelegateSwizzler.h>
#import <objc/runtime.h>

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTConvert.h>

#import "RNFBMessaging+AppDelegate.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingAppDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingAppDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingAppDelegate alloc] init];
    sharedInstance.conditionBackgroundMessageHandlerSet = [[NSCondition alloc] init];
    sharedInstance.backgroundMessageHandlerSet = NO;
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
    if ([[GULAppDelegateSwizzler sharedApplication].delegate
            respondsToSelector:didReceiveRemoteNotificationWithCompletionSEL]) {
      // noop - user has own implementation of this method in their AppDelegate, this
      // means GULAppDelegateSwizzler will have already replaced it with a donor method
    } else {
      // add our own donor implementation of
      // application:didReceiveRemoteNotification:fetchCompletionHandler:
      Method donorMethod = class_getInstanceMethod(object_getClass(strongSelf),
                                                   didReceiveRemoteNotificationWithCompletionSEL);
      class_addMethod(object_getClass([GULAppDelegateSwizzler sharedApplication].delegate),
                      didReceiveRemoteNotificationWithCompletionSEL,
                      method_getImplementation(donorMethod), method_getTypeEncoding(donorMethod));
    }
  });
}

// used to signal that a javascript handler for background messages is set
- (void)signalBackgroundMessageHandlerSet {
  RNFBMessagingAppDelegate *sharedInstance = [RNFBMessagingAppDelegate sharedInstance];
  [sharedInstance.conditionBackgroundMessageHandlerSet lock];
  DLog(@"signalBackgroundMessageHandlerSet sharedInstance.backgroundMessageHandlerSet was %@",
       sharedInstance.backgroundMessageHandlerSet ? @"YES" : @"NO");
  sharedInstance.backgroundMessageHandlerSet = YES;
  [sharedInstance.conditionBackgroundMessageHandlerSet broadcast];
  [sharedInstance.conditionBackgroundMessageHandlerSet unlock];
}

// used to temporarily store a promise instance to resolve calls to `registerForRemoteNotifications`
- (void)setPromiseResolve:(RCTPromiseResolveBlock)resolve
         andPromiseReject:(RCTPromiseRejectBlock)reject {
  _registerPromiseResolver = resolve;
  _registerPromiseRejecter = reject;
}

#pragma mark -
#pragma mark AppDelegate Methods

// called when `registerForRemoteNotifications` completes successfully
- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
#ifdef DEBUG
  [[FIRMessaging messaging] setAPNSToken:deviceToken type:FIRMessagingAPNSTokenTypeSandbox];
#else
  [[FIRMessaging messaging] setAPNSToken:deviceToken type:FIRMessagingAPNSTokenTypeProd];
#endif

  if (_registerPromiseResolver != nil) {
    _registerPromiseResolver(@(
        [RCTConvert BOOL:@([UIApplication sharedApplication].isRegisteredForRemoteNotifications)]));
    _registerPromiseResolver = nil;
    _registerPromiseRejecter = nil;
  }
}

// called when `registerForRemoteNotifications` fails to complete
- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  if (_registerPromiseRejecter != nil) {
    [RNFBSharedUtils rejectPromiseWithNSError:_registerPromiseRejecter error:error];
    _registerPromiseResolver = nil;
    _registerPromiseRejecter = nil;
  }
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
#if __has_include(<FirebaseAuth/FirebaseAuth.h>)
  if ([[FIRAuth auth] canHandleNotification:userInfo]) {
    DLog(@"didReceiveRemoteNotification Firebase Auth handeled the notification");
    completionHandler(UIBackgroundFetchResultNoData);
    return;
  }

  // If the notification is a probe notification, always call the completion
  // handler with UIBackgroundFetchResultNoData.
  //
  // This fixes a race condition between `FIRAuth/didReceiveRemoteNotification` and this
  // module causing detox to hang when `FIRAuth/didReceiveRemoteNotification` is called first.
  // see
  // https://stackoverflow.com/questions/72044950/detox-tests-hang-with-pending-items-on-dispatch-queue/72989494
  NSDictionary *data = userInfo[@"com.google.firebase.auth"];
  if ([data isKindOfClass:[NSString class]]) {
    // Deserialize in case the data is a JSON string.
    NSData *JSONData = [((NSString *)data) dataUsingEncoding:NSUTF8StringEncoding];
    data = [NSJSONSerialization JSONObjectWithData:JSONData options:0 error:NULL];
  }
  if ([data isKindOfClass:[NSDictionary class]] && data[@"warning"]) {
    completionHandler(UIBackgroundFetchResultNoData);
    return;
  }
#endif

  [[NSNotificationCenter defaultCenter]
      postNotificationName:@"RNFBMessagingDidReceiveRemoteNotification"
                    object:userInfo];

  if (userInfo[@"gcm.message_id"]) {
    DLog(@"didReceiveRemoteNotification gcm.message_id was present %@", userInfo);

    if ([UIApplication sharedApplication].applicationState == UIApplicationStateBackground) {
      // If app is in background state, register background task to guarantee async queues aren't
      // frozen.
      UIBackgroundTaskIdentifier __block backgroundTaskId =
          [application beginBackgroundTaskWithExpirationHandler:^{
            if (backgroundTaskId != UIBackgroundTaskInvalid) {
              [application endBackgroundTask:backgroundTaskId];
              backgroundTaskId = UIBackgroundTaskInvalid;
            }
          }];
      // TODO add support in a later version for calling completion handler directly from JS when
      // user JS code complete
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(25 * NSEC_PER_SEC)),
                     dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
                       completionHandler(UIBackgroundFetchResultNewData);

                       // Stop background task after the longest timeout, async queue is okay to
                       // freeze again after handling period
                       if (backgroundTaskId != UIBackgroundTaskInvalid) {
                         [application endBackgroundTask:backgroundTaskId];
                         backgroundTaskId = UIBackgroundTaskInvalid;
                       }
                     });

      RNFBMessagingAppDelegate *sharedInstance = [RNFBMessagingAppDelegate sharedInstance];
      [sharedInstance.conditionBackgroundMessageHandlerSet lock];
      @try {
        DLog(@"didReceiveRemoteNotification sharedInstance.backgroundMessageHandlerSet = %@",
             sharedInstance.backgroundMessageHandlerSet ? @"YES" : @"NO");
        if (sharedInstance.backgroundMessageHandlerSet) {
          // Normal path, backgroundMessageHandlerSet has already been set, queue the notification
          // for immediate delivery
          dispatch_async(dispatch_get_main_queue(), ^{
            [[RNFBRCTEventEmitter shared]
                sendEventWithName:@"messaging_message_received_background"
                             body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:userInfo]];
          });
          DLog(@"didReceiveRemoteNotification without waiting for backgroundMessageHandlerSet to "
               @"be set");
        } else {
          // This spin needs to be on a background/concurrent queue to await the setup of
          // backgroundMessageHandlerSet and not block the main thread
          dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            // Reaquire the lock in this new closure
            [sharedInstance.conditionBackgroundMessageHandlerSet lock];
            @try {
              // Spin/wait until backgroundMessageHandlerSet
              // NB it is possible while this closure was being scheduled that
              // backgroundMessageHandlerSet is already set and this loop is skipped
              while (!sharedInstance.backgroundMessageHandlerSet) {
                DLog(@"didReceiveRemoteNotification waiting for "
                     @"sharedInstance.backgroundMessageHandlerSet %@",
                     sharedInstance.backgroundMessageHandlerSet ? @"YES" : @"NO");
                if (![sharedInstance.conditionBackgroundMessageHandlerSet
                        waitUntilDate:[NSDate dateWithTimeIntervalSinceNow:25]]) {
                  // If after 25 seconds the client hasn't called backgroundMessageHandlerSet, give
                  // up on this notification
                  ELog(@"didReceiveRemoteNotification timed out waiting for "
                       @"sharedInstance.backgroundMessageHandlerSet");
                  return;
                }
              }
              dispatch_async(dispatch_get_main_queue(), ^{
                [[RNFBRCTEventEmitter shared]
                    sendEventWithName:@"messaging_message_received_background"
                                 body:[RNFBMessagingSerializer
                                          remoteMessageUserInfoToDict:userInfo]];
              });
              DLog(@"didReceiveRemoteNotification after waiting for backgroundMessageHandlerSet");
            } @finally {
              [sharedInstance.conditionBackgroundMessageHandlerSet unlock];
            }
          });
        }
      } @finally {
        [sharedInstance.conditionBackgroundMessageHandlerSet unlock];
      }
    } else {
      DLog(@"didReceiveRemoteNotification while app was in foreground");
      [[RNFBRCTEventEmitter shared]
          sendEventWithName:@"messaging_message_received"
                       body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:userInfo]];
      completionHandler(UIBackgroundFetchResultNoData);
    }
  }
}

@end
