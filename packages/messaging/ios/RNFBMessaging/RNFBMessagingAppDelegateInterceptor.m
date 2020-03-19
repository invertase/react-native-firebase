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
#import <React/RCTConvert.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <GoogleUtilities/GULAppDelegateSwizzler.h>

#import "RNFBMessagingAppDelegateInterceptor.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingAppDelegateInterceptor

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  static RNFBMessagingAppDelegateInterceptor *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingAppDelegateInterceptor alloc] init];
    dispatch_async(dispatch_get_main_queue(), ^{
      [GULAppDelegateSwizzler registerAppDelegateInterceptor:sharedInstance];
      [GULAppDelegateSwizzler proxyOriginalDelegateIncludingAPNSMethods];
        
      NSString *kGULDidReceiveRemoteNotificationWithCompletionSEL =
          @"application:didReceiveRemoteNotification:fetchCompletionHandler:";
        
      SEL didReceiveRemoteNotificationWithCompletionSEL =
          NSSelectorFromString(kGULDidReceiveRemoteNotificationWithCompletionSEL);
      SEL didReceiveRemoteNotificationWithCompletionDonorSEL =
          @selector(application:donor_didReceiveRemoteNotification:fetchCompletionHandler:);
        
      if ([[GULAppDelegateSwizzler sharedApplication].delegate respondsToSelector:didReceiveRemoteNotificationWithCompletionSEL]) {
          // noop - user has own implementation & Firebase Swizzler already handles it
      } else {
          // Swizzle our own implementation of application:didReceiveRemoteNotification:fetchCompletionHandler:
          Method donorMethod = class_getInstanceMethod(object_getClass(sharedInstance), didReceiveRemoteNotificationWithCompletionDonorSEL);
          class_addMethod(object_getClass([GULAppDelegateSwizzler sharedApplication].delegate), didReceiveRemoteNotificationWithCompletionSEL, method_getImplementation(donorMethod), method_getTypeEncoding(donorMethod));
      }
    });
  });

  return sharedInstance;
}

+ (void)load {
    [RNFBMessagingAppDelegateInterceptor sharedInstance];
}

// used to temporarily store a promise instance to resolve calls to `registerForRemoteNotifications`
- (void)setPromiseResolve:(RCTPromiseResolveBlock)resolve andPromiseReject:(RCTPromiseRejectBlock)reject {
  _registerPromiseResolver = resolve;
  _registerPromiseRejecter = reject;
}

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

// Forward Firebase swizzle calls onto our own internal donor method
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
    [self application:application donor_didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Called when data-only notification is received
// - In background (only works with content-available)
// - In foreground (only works with content-available)
- (void)application:(UIApplication *)application donor_didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
  // Message ID available = FCM message. Could be a APN message which would be ignored.
  if (userInfo[@"gcm.message_id"]) {
    // Calls onMessage event
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:[RNFBMessagingSerializer remoteMessageAppDataToDict:userInfo withMessageId:nil]];
  }

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(20 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    completionHandler(UIBackgroundFetchResultNewData);
  });
}

@end
