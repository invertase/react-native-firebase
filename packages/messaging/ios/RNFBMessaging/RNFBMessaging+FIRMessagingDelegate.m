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

#import <GoogleUtilities/GULAppDelegateSwizzler.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <objc/message.h>
#import <objc/runtime.h>

#import "RNFBMessaging+FIRMessagingDelegate.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingFIRMessagingDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingFIRMessagingDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingFIRMessagingDelegate alloc] init];
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingFIRMessagingDelegate *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingFIRMessagingDelegate *strongSelf = weakSelf;
    FIRMessaging *messaging = [FIRMessaging messaging];
    if (messaging.delegate != strongSelf) {
      strongSelf.originalDelegate = messaging.delegate;
      messaging.delegate = strongSelf;
    }
  });
}

#pragma mark -
#pragma mark FIRMessagingDelegate Methods

// JS -> `onTokenRefresh`
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
  if (fcmToken == nil) {  // Don't crash when the token is reset
    return;
  }
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_token_refresh"
                                             body:@{@"token" : fcmToken}];

  SEL messaging_didReceiveRegistrationTokenSelector =
      NSSelectorFromString(@"messaging:didReceiveRegistrationToken:");
  id<FIRMessagingDelegate> strongOriginalDelegate = self.originalDelegate;
  if ([strongOriginalDelegate respondsToSelector:messaging_didReceiveRegistrationTokenSelector]) {
    [strongOriginalDelegate messaging:messaging didReceiveRegistrationToken:fcmToken];
  }

  // Preserve the existing AppDelegate fallback for applications that implement the callback
  // without assigning themselves as FIRMessaging.delegate.
  id<UIApplicationDelegate> applicationDelegate =
      [GULAppDelegateSwizzler sharedApplication].delegate;
  if (applicationDelegate != strongOriginalDelegate &&
      [applicationDelegate respondsToSelector:messaging_didReceiveRegistrationTokenSelector]) {
    void (*usersDidReceiveRegistrationTokenIMP)(id, SEL, FIRMessaging *, NSString *) =
        (typeof(usersDidReceiveRegistrationTokenIMP))&objc_msgSend;
    usersDidReceiveRegistrationTokenIMP(
        applicationDelegate, messaging_didReceiveRegistrationTokenSelector, messaging, fcmToken);
  }
}

// JS -> `onRegistered`
// `installationId` is `nullable` in FIRMessaging.h, so only the JS event is skipped for nil; user
// delegates are still told, like any other registration callback.
- (void)messaging:(FIRMessaging *)messaging
    didReceiveRegistration:(nullable NSString *)installationId {
  if (installationId != nil) {
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_registered"
                                               body:@{@"installationId" : installationId}];
  } else {
    DLog(@"RNFBMessaging didReceiveRegistration - nil installationId, skipping JS event.");
  }

  SEL messaging_didReceiveRegistrationSelector =
      NSSelectorFromString(@"messaging:didReceiveRegistration:");
  id<FIRMessagingDelegate> strongOriginalDelegate = self.originalDelegate;
  if ([strongOriginalDelegate respondsToSelector:messaging_didReceiveRegistrationSelector]) {
    [strongOriginalDelegate messaging:messaging didReceiveRegistration:installationId];
  }

  id<UIApplicationDelegate> applicationDelegate =
      [GULAppDelegateSwizzler sharedApplication].delegate;
  if (applicationDelegate != strongOriginalDelegate &&
      [applicationDelegate respondsToSelector:messaging_didReceiveRegistrationSelector]) {
    void (*usersDidReceiveRegistrationIMP)(id, SEL, FIRMessaging *, NSString *) =
        (typeof(usersDidReceiveRegistrationIMP))&objc_msgSend;
    usersDidReceiveRegistrationIMP(applicationDelegate, messaging_didReceiveRegistrationSelector,
                                   messaging, installationId);
  }
}

// JS -> `onUnregistered`
- (void)messaging:(FIRMessaging *)messaging didUnregister:(NSString *)installationId {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_unregistered"
                                             body:@{@"installationId" : installationId}];

  SEL messaging_didUnregisterSelector = NSSelectorFromString(@"messaging:didUnregister:");
  id<FIRMessagingDelegate> strongOriginalDelegate = self.originalDelegate;
  if ([strongOriginalDelegate respondsToSelector:messaging_didUnregisterSelector]) {
    [strongOriginalDelegate messaging:messaging didUnregister:installationId];
  }

  id<UIApplicationDelegate> applicationDelegate =
      [GULAppDelegateSwizzler sharedApplication].delegate;
  if (applicationDelegate != strongOriginalDelegate &&
      [applicationDelegate respondsToSelector:messaging_didUnregisterSelector]) {
    void (*usersDidUnregisterIMP)(id, SEL, FIRMessaging *, NSString *) =
        (typeof(usersDidUnregisterIMP))&objc_msgSend;
    usersDidUnregisterIMP(applicationDelegate, messaging_didUnregisterSelector, messaging,
                          installationId);
  }
}

@end
