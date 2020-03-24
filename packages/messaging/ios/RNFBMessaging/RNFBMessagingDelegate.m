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
#import <UserNotifications/UserNotifications.h>

#import "RNFBMessagingDelegate.h"
#import "RNFBMessagingAppDelegateInterceptor.h"
#import "RNFBMessagingSerializer.h"


@implementation RNFBMessagingDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingDelegate alloc] init];
  });
  return sharedInstance;
}

- (id)init {
  self = [super init];
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  // JS -> `onSendError`
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(sendDataMessageFailure:) name:FIRMessagingSendErrorNotification object:nil];
  // JS -> `onMessageSent`
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(sendDataMessageSuccess:) name:FIRMessagingSendSuccessNotification object:nil];
  // JS -> `onDeletedMessages`
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didDeleteMessagesOnServer) name:FIRMessagingMessagesDeletedNotification object:nil];
  // JS -> app launched via notification `applicationDidLaunchWithNotification`
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidLaunchWithNotification:) name:@"UIApplicationDidFinishLaunchingNotification" object:nil];
  return self;
}

- (void)setMessagingDelegate {
  static dispatch_once_t once;
  __weak RNFBMessagingDelegate *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingDelegate *strongSelf = weakSelf;
    [FIRMessaging messaging].delegate = strongSelf;
    [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
  });
}

+ (void)load {
  [RNFBMessagingDelegate sharedInstance];
}

#pragma mark -
#pragma mark UNUserNotificationCenter Methods

// JS -> `onSendError`
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

// JS -> `onMessageSent`
- (void)sendDataMessageSuccess:(NSNotification *)notification {
  NSDictionary *userInfo = notification.userInfo;
  NSString *messageID = (NSString *) userInfo[@"messageID"];
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_sent" body:@{
      @"messageId": messageID
  }];
}

// JS -> `onDeletedMessages`
- (void)didDeleteMessagesOnServer {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_deleted" body:@{}];
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

// Called when notification is delivered but app is in the foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:[RNFBMessagingSerializer notificationToDict:notification]];
  completionHandler(UNNotificationPresentationOptionNone);
}

// Called when the user presses a notification and causes the app to launch
- (void)applicationDidLaunchWithNotification:(nonnull NSNotification *)notification {
  // setup our delegates & swizzling after app finishes launching
  [self setMessagingDelegate];
  [[RNFBMessagingAppDelegateInterceptor sharedInstance] proxyAppDelegate];

  if (notification.userInfo[@"UIApplicationLaunchOptionsRemoteNotificationKey"]) {
    NSDictionary *remoteNotification = notification.userInfo[@"UIApplicationLaunchOptionsRemoteNotificationKey"];
    if (remoteNotification[@"gcm.message_id"]) {
      os_log(OS_LOG_DEFAULT, "RNFB: messaging:applicationDidLaunchWithNotification: %{public}@", remoteNotification[@"gcm.message_id"]);
      // TODO call onNotificationOpenedApp & set initialNotification
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_opened_app" body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:remoteNotification]];
    }
  }
}

// Called when notification is pressed by the user
// - In background (notification, notification + data)
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
