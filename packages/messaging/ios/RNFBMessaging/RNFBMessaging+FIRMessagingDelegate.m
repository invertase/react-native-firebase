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
    [FIRMessaging messaging].delegate = strongSelf;
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
  });
}


#pragma mark -
#pragma mark FIRMessagingDelegate Methods

// ----------------------
//     TOKEN Message
// --------------------\/


// JS -> `onTokenRefresh`
- (void)messaging:(FIRMessaging *)messaging didReceiveRegistrationToken:(NSString *)fcmToken {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_token_refresh" body:@{
      @"token": fcmToken
  }];
}

// ----------------------
//      DATA Message
// --------------------\/

// JS -> `onMessage`
// Receive data messages on iOS 10+ directly from FCM (bypassing APNs) when the app is in the foreground.
// To enable direct data messages, you can set [Messaging messaging].shouldEstablishDirectChannel to YES.
- (void)messaging:(nonnull FIRMessaging *)messaging didReceiveMessage:(nonnull FIRMessagingRemoteMessage *)remoteMessage {
  os_log(OS_LOG_DEFAULT, "RNFB: messaging:didReceiveMessage: %{public}@", remoteMessage.messageID);
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:[RNFBMessagingSerializer remoteMessageToDict:remoteMessage]];
}

@end
