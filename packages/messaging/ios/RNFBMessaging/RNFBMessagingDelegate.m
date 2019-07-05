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
#import <UserNotifications/UserNotifications.h>

#import "RNFBMessagingDelegate.h"

@implementation RNFBMessagingDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  static RNFBMessagingDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingDelegate alloc] init];
    sharedInstance.pendingPromiseReject = nil;
    sharedInstance.pendingPromiseResolve = nil;
    [FIRMessaging messaging].delegate = sharedInstance;
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
    [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(sendDataMessageFailure:) name:FIRMessagingSendErrorNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(sendDataMessageSuccess:) name:FIRMessagingSendSuccessNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(didDeleteMessagesOnServer) name:FIRMessagingMessagesDeletedNotification object:nil];
  });
  return sharedInstance;
}


#pragma mark -
#pragma mark UNUserNotificationCenter Methods

- (void)sendDataMessageFailure:(NSNotification *)notification {
  NSDictionary *userInfo = notification.userInfo;
  NSError *error = (NSError *) userInfo[@"error"];
  NSString *messageID = (NSString *) userInfo[@"messageID"];
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_send_error" body:@{
      @"messageId": messageID,
      @"error": @{
          @"code": @"unknown",
          @"message": error.localizedDescription
      }
  }];
}

- (void)sendDataMessageSuccess:(NSNotification *)notification {
  NSDictionary *userInfo = notification.userInfo;
  NSString *messageID = (NSString *) userInfo[@"messageID"];
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_sent" body:@{
      @"messageId": messageID
  }];
}

- (void)didDeleteMessagesOnServer {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_deleted" body:@{}];
}


#pragma mark -
#pragma mark FIRMessagingDelegate Methods

// Listen for FCM tokens
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_token_refresh" body:@{
      @"token": fcmToken
  }];
}

// ----------------------
//      DATA Message
// --------------------\/

//  |-> ---------------------
//      App in Foreground
//   ------------------------
- (void)applicationReceivedRemoteMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
  // TODO send message event
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{}];
}

// Receive data messages on iOS 10+ directly from FCM (bypassing APNs) when the app is in the foreground.
// To enable direct data messages, you can set [Messaging messaging].shouldEstablishDirectChannel to YES.
- (void)messaging:(nonnull FIRMessaging *)messaging didReceiveMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
  // TODO send message event
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{}];
}


@end
