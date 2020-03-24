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
#import <Firebase/Firebase.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>

#import "RNFBMessagingSerializer.h"
#import "RNFBMessaging+AppDelegate.h"
#import "RNFBMessaging+NSNotificationCenter.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"
#import "RNFBMessaging+FIRMessagingDelegate.h"

@implementation RNFBMessagingNSNotificationCenter

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBMessagingNSNotificationCenter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingNSNotificationCenter alloc] init];
  });
  return sharedInstance;
}

- (void)observe {
  static dispatch_once_t once;
  __weak RNFBMessagingNSNotificationCenter *weakSelf = self;
  dispatch_once(&once, ^{
    RNFBMessagingNSNotificationCenter *strongSelf = weakSelf;

    // Application
    // JS -> app launched via notification `applicationDidLaunchWithNotification`
    [[NSNotificationCenter defaultCenter] addObserver:strongSelf selector:@selector(application_onDidFinishLaunchingNotification:) name:UIApplicationDidFinishLaunchingNotification object:nil];


    // Firebase Messaging
    // JS -> `onSendError`
    [[NSNotificationCenter defaultCenter] addObserver:strongSelf selector:@selector(messaging_onSendErrorNotification:) name:FIRMessagingSendErrorNotification object:nil];

    // Firebase Messaging
    // JS -> `onMessageSent`
    [[NSNotificationCenter defaultCenter] addObserver:strongSelf selector:@selector(messaging_onSendSuccessNotification:) name:FIRMessagingSendSuccessNotification object:nil];

    // Firebase Messaging
    // JS -> `onDeletedMessages`
    [[NSNotificationCenter defaultCenter] addObserver:strongSelf selector:@selector(messaging_onDeletedMessagesNotification) name:FIRMessagingMessagesDeletedNotification object:nil];

  });
}

// start observing immediately on class load - specifically for UIApplicationDidFinishLaunchingNotification
+ (void)load {
  [[self sharedInstance] observe];
}

#pragma mark -
#pragma mark Firebase Messaging Notifications


// Firebase Messaging
// JS -> `onSendError`
- (void)messaging_onSendErrorNotification:(NSNotification *)notification {
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

// Firebase Messaging
// JS -> `onMessageSent`
- (void)messaging_onSendSuccessNotification:(NSNotification *)notification {
  NSDictionary *userInfo = notification.userInfo;
  NSString *messageID = (NSString *) userInfo[@"messageID"];
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_sent" body:@{
      @"messageId": messageID
  }];
}

// Firebase Messaging
// JS -> `onDeletedMessages`
- (void)messaging_onDeletedMessagesNotification {
  [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_deleted" body:@{}];
}

#pragma mark -
#pragma mark Application Notifications

- (void)application_onDidFinishLaunchingNotification:(nonnull NSNotification *)notification {
  // setup our delegates & swizzling after app finishes launching
  // these methods are idempotent so can safely be called multiple times
  [[RNFBMessagingAppDelegate sharedInstance] observe];
  [[RNFBMessagingUNUserNotificationCenter sharedInstance] observe];
  [[RNFBMessagingFIRMessagingDelegate sharedInstance] observe];

  if (notification.userInfo[UIApplicationLaunchOptionsRemoteNotificationKey]) {
    NSDictionary *remoteNotification = notification.userInfo[UIApplicationLaunchOptionsRemoteNotificationKey];
    if (remoteNotification[@"gcm.message_id"]) {
      os_log(OS_LOG_DEFAULT, "RNFB: messaging:application_onDidFinishLaunchingNotification: %{public}@", remoteNotification[@"gcm.message_id"]);
      // TODO call onNotificationOpenedApp & set initialNotification
      [[RNFBRCTEventEmitter shared] sendEventWithName:@"messaging_message_opened_app" body:[RNFBMessagingSerializer remoteMessageUserInfoToDict:remoteNotification]];
    }
  }
}

@end
