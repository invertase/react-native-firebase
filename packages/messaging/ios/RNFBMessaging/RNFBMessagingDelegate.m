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
#import "RNFBMessagingSerializer.h"


@implementation RNFBMessagingDelegate

+ (instancetype)sharedInstance {
  static RNFBMessagingDelegate *sharedInstance;
    if (!sharedInstance) {
        sharedInstance = [[RNFBMessagingDelegate alloc] init];
        dispatch_async(dispatch_get_main_queue(),^{
           [FIRMessaging messaging].delegate = sharedInstance;
           [FIRMessaging messaging].shouldEstablishDirectChannel = YES;
             
           UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
           center.delegate = sharedInstance;

           // JS -> `onSendError`
           [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(sendDataMessageFailure:) name:FIRMessagingSendErrorNotification object:nil];
           // JS -> `onMessageSent`
           [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(sendDataMessageSuccess:) name:FIRMessagingSendSuccessNotification object:nil];
           // JS -> `onDeletedMessages`
           [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(didDeleteMessagesOnServer) name:FIRMessagingMessagesDeletedNotification object:nil];
           // JS -> app launched via notification `applicationDidLaunchWithNotification`
           [[NSNotificationCenter defaultCenter] addObserver:sharedInstance selector:@selector(applicationDidLaunchWithNotification:) name:@"UIApplicationDidFinishLaunchingNotification" object:nil];
        });
    }
    
  return sharedInstance;
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
    // todo fully parse notification
    [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{
        @"notification": @{
                @"title": notification.request.content.title,
        }
    }];
  completionHandler(UNNotificationPresentationOptionNone);
}

// Called when the user presses a notification and causes the app to launch
- (void)applicationDidLaunchWithNotification:(nonnull NSNotification *)notification {
    if (notification.userInfo[@"UIApplicationLaunchOptionsRemoteNotificationKey"]) {
      NSDictionary *remoteNotification = notification.userInfo[@"UIApplicationLaunchOptionsRemoteNotificationKey"];

        
        // if alert data = user pressed & it launched the app
        // if no alert = data only when terminated
        
      if (remoteNotification[@"gcm.message_id"]) {
          os_log(OS_LOG_DEFAULT, "RNFB: messaging:applicationDidLaunchWithNotification: %{public}@", remoteNotification[@"gcm.message_id"]);
          [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_received" body:@{
              @"notification": @{
                      @"title": @"fooooooooo",
              }
          }];
          
            // TODO
          // check its an FCM message
          // call onNotificationOpenedApp & set initialNotification
        NSLog(@"GOOOOO");
      }
    }
}

// Called when notification is pressed by the user
// - In background (notification, notification + data)
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    // TODO
    // check its an FCM message
    // call onNotificationOpenedApp & set initialNotification
    NSLog(@"didReceiveNotificationResponse called");
  os_log(OS_LOG_DEFAULT, "RNFB: messaging:didReceiveNotificationResponse: %{public}@", response.actionIdentifier);
    completionHandler();
}

@end
