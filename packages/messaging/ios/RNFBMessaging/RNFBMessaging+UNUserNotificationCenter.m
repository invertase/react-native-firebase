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

#import "RNFBMessagingSerializer.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"

@implementation RNFBMessagingUNUserNotificationCenter

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingUNUserNotificationCenter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingUNUserNotificationCenter alloc] init];
    sharedInstance.initialNotification = nil;
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingUNUserNotificationCenter *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingUNUserNotificationCenter *strongSelf = weakSelf;
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
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

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  if (notification.request.content.userInfo[@"gcm.message_id"]) {
    NSDictionary *notificationDict = [RNFBMessagingSerializer notificationToDict:notification];

    // Don't send an event if contentAvailable is true - application:didReceiveRemoteNotification will send the event
    // for us, we don't want to duplicate them
    if (!notificationDict[@"contentAvailable"]) {
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:notificationDict];
    }

    // TODO in a later version allow customising completion options in JS code
    completionHandler(UNNotificationPresentationOptionNone);
  }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  NSDictionary *remoteNotification = response.notification.request.content.userInfo;
  if (remoteNotification[@"gcm.message_id"]) {
    NSDictionary *notificationDict = [RNFBMessagingSerializer remoteMessageUserInfoToDict:remoteNotification];
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_notification_opened" body:notificationDict];
    _initialNotification = notificationDict;
    completionHandler();
  }
}

@end
