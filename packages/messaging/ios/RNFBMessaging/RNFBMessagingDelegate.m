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

#import "RNFBMessagingDelegate.h"
#import "RCTUtils.h"

//#if defined(__IPHONE_10_0) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_10_0
//@import UserNotifications;
//#endif

@implementation RNFBMessagingDelegate

+ (instancetype)shared {
  static dispatch_once_t once;
  static RNFBMessagingDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingDelegate alloc] init];
    sharedInstance.pendingPromiseReject = nil;
    sharedInstance.pendingPromiseResolve = nil;
    [FIRMessaging messaging].delegate = sharedInstance;
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
//    if (@available(iOS 10.0, *)) {
//      [UNUserNotificationCenter currentNotificationCenter].delegate = sharedInstance;
//    }
  });
  return sharedInstance;
}


#pragma mark -
#pragma mark AppDelegate Methods


- (void)didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
 // TODO send message received event
}


- (void)didRegisterUserNotificationSettings:(nonnull UIUserNotificationSettings *)notificationSettings {
  // TODO resolve/reject any pending promise on shared instance
  [[UIApplication sharedApplication] registerForRemoteNotifications];

}

#pragma mark -
#pragma mark FIRMessagingDelegate Methods

/**
 private static final String EVENT_MESSAGE_SENT = "messaging_message_sent";
  private static final String EVENT_MESSAGES_DELETED = "messaging_message_deleted";
  private static final String EVENT_MESSAGE_RECEIVED = "messaging_message_received";
  private static final String EVENT_MESSAGE_SEND_ERROR = "messaging_message_send_error";
  private static final String EVENT_NEW_TOKEN = "messaging_token_refresh";
 */

// Listen for FCM tokens
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_token_refresh" body:@{
      @"token": fcmToken
  }];
}

// Listen for data messages in the foreground
- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{
//      @"token": fcmToken
  }];
//  NSDictionary *message = [self parseFIRMessagingRemoteMessage:remoteMessage];
//  [self sendJSEvent:self name:MESSAGING_MESSAGE_RECEIVED body:message];
}

// Receive data messages on iOS 10+ directly from FCM (bypassing APNs) when the app is in the foreground.
// To enable direct data messages, you can set [Messaging messaging].shouldEstablishDirectChannel to YES.
- (void)messaging:(nonnull FIRMessaging *)messaging
didReceiveMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
//  NSDictionary *message = [self parseFIRMessagingRemoteMessage:remoteMessage];
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{
//      @"token": fcmToken
  }];
}


@end
