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

#import <os/log.h>

#import <RNFBApp/RNFBRCTEventEmitter.h>

#import "RNFBMessagingSerializer.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"

@implementation RNFBMessagingUNUserNotificationCenter

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingUNUserNotificationCenter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingUNUserNotificationCenter alloc] init];
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

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:[RNFBMessagingSerializer notificationToDict:notification]];
  completionHandler(UNNotificationPresentationOptionNone);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  os_log(OS_LOG_DEFAULT, "RNFB: messaging:didReceiveNotificationResponse: %{public}@", response.actionIdentifier);
  NSDictionary *remoteNotification = response.notification.request.content.userInfo;
  if (remoteNotification[@"gcm.message_id"]) {
    // TODO call onNotificationOpenedApp & set initialNotification
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_opened_app" body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:remoteNotification]];
  }

  completionHandler();
}


@end
