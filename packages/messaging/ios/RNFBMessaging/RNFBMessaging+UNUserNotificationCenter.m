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

#import <RNFBApp/RNFBRCTEventEmitter.h>

#import "RNFBJSON.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingUNUserNotificationCenter
struct {
  unsigned int willPresentNotification : 1;
  unsigned int didReceiveNotificationResponse : 1;
  unsigned int openSettingsForNotification : 1;
} originalDelegateRespondsTo;

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingUNUserNotificationCenter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingUNUserNotificationCenter alloc] init];
    sharedInstance.initialNotification = nil;
    sharedInstance.didOpenSettingsForNotification = NO;
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingUNUserNotificationCenter *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingUNUserNotificationCenter *strongSelf = weakSelf;
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    if (center.delegate != nil) {
      _originalDelegate = center.delegate;
      originalDelegateRespondsTo.openSettingsForNotification = (unsigned int)[_originalDelegate
          respondsToSelector:@selector(userNotificationCenter:openSettingsForNotification:)];
      originalDelegateRespondsTo.willPresentNotification = (unsigned int)[_originalDelegate
          respondsToSelector:@selector(userNotificationCenter:
                                      willPresentNotification:withCompletionHandler:)];
      originalDelegateRespondsTo.didReceiveNotificationResponse = (unsigned int)[_originalDelegate
          respondsToSelector:@selector(userNotificationCenter:
                                 didReceiveNotificationResponse:withCompletionHandler:)];
    }
    center.delegate = strongSelf;
  });
}

- (nullable NSDictionary *)getInitialNotification {
  if (_initialNotification != nil) {
    NSDictionary *initialNotificationCopy = [_initialNotification copy];
    _initialNotification = nil;
    return initialNotificationCopy;
  }

  return nil;
}

- (NSNumber *)getDidOpenSettingsForNotification {
  if (_didOpenSettingsForNotification != NO) {
    _didOpenSettingsForNotification = NO;
    return @YES;
  }

  return @NO;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:
             (void (^)(UNNotificationPresentationOptions options))completionHandler {
  NSArray *presentationOptionsConfig =
      [[RNFBJSON shared] getArrayValue:@"messaging_ios_foreground_presentation_options"
                          defaultValue:@[]];

  UNNotificationPresentationOptions presentationOptions = UNNotificationPresentationOptionNone;

  BOOL badge = [presentationOptionsConfig containsObject:@"badge"];
  BOOL sound = [presentationOptionsConfig containsObject:@"sound"];
  BOOL alert = [presentationOptionsConfig containsObject:@"alert"];
  BOOL list = [presentationOptionsConfig containsObject:@"list"];
  BOOL banner = [presentationOptionsConfig containsObject:@"banner"];

  if (badge) {
    presentationOptions |= UNNotificationPresentationOptionBadge;
  }

  if (sound) {
    presentationOptions |= UNNotificationPresentationOptionSound;
  }

  // if list or banner is true, ignore `alert` property
  if (banner || list) {
    if (banner) {
      presentationOptions |= UNNotificationPresentationOptionBanner;
    }

    if (list) {
      presentationOptions |= UNNotificationPresentationOptionList;
    }
  } else if (alert) {
    presentationOptions |= UNNotificationPresentationOptionAlert;
  }

  if (notification.request.content.userInfo[@"gcm.message_id"]) {
    NSDictionary *notificationDict = [RNFBMessagingSerializer notificationToDict:notification];

    // Don't send an event if contentAvailable is true -
    // application:didReceiveRemoteNotification will send the event for us, we
    // don't want to duplicate them
    if (!notificationDict[@"contentAvailable"]) {
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received"
                                                 body:notificationDict];
    }
  }

  // completionHandler must be invoked exactly once. If the original delegate
  // implements willPresentNotification, defer to it entirely - it owns the
  // completionHandler contract (and may call it asynchronously). Only fall
  // back to our own presentationOptions when there is no original delegate
  // to hand off to.
  //
  // _originalDelegate is weak, so it is captured into a strong local first -
  // otherwise it could be deallocated between the nil-check and the message
  // send (turning the send into a no-op) and completionHandler would never
  // be called at all.
  id<UNUserNotificationCenterDelegate> strongOriginalDelegate = _originalDelegate;
  if (strongOriginalDelegate != nil && originalDelegateRespondsTo.willPresentNotification) {
    [strongOriginalDelegate userNotificationCenter:center
                           willPresentNotification:notification
                             withCompletionHandler:completionHandler];
  } else {
    completionHandler(presentationOptions);
  }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler {
  if ([[response actionIdentifier] isEqualToString:UNNotificationDefaultActionIdentifier]) {
    NSDictionary *remoteNotification = response.notification.request.content.userInfo;
    if (remoteNotification[@"gcm.message_id"]) {
      NSDictionary *notificationDict =
          [RNFBMessagingSerializer remoteMessageUserInfoToDict:remoteNotification];
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_notification_opened"
                                                 body:notificationDict];
      _initialNotification = notificationDict;
    }
  }

  if (_originalDelegate != nil && originalDelegateRespondsTo.didReceiveNotificationResponse) {
    [_originalDelegate userNotificationCenter:center
               didReceiveNotificationResponse:response
                        withCompletionHandler:completionHandler];
  } else {
    completionHandler();
  }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    openSettingsForNotification:(nullable UNNotification *)notification {
  if (_originalDelegate != nil && originalDelegateRespondsTo.openSettingsForNotification) {
    [_originalDelegate userNotificationCenter:center openSettingsForNotification:notification];
  } else {
    NSDictionary *notificationDict = [RNFBMessagingSerializer notificationToDict:notification];
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_settings_for_notification_opened"
                                               body:notificationDict];

    _didOpenSettingsForNotification = YES;
  }
}

@end
