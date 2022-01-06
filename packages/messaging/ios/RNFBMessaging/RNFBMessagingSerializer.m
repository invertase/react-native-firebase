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

#import "RNFBMessagingSerializer.h"
#import <React/RCTConvert.h>

@implementation RNFBMessagingSerializer

+ (NSString *)APNSTokenFromNSData:(NSData *)tokenData {
  const char *data = [tokenData bytes];

  NSMutableString *token = [NSMutableString string];
  for (NSInteger i = 0; i < tokenData.length; i++) {
    [token appendFormat:@"%02.2hhX", data[i]];
  }

  return [token copy];
}

+ (NSDictionary *)notificationToDict:(UNNotification *)notification {
  return [self remoteMessageUserInfoToDict:notification.request.content.userInfo];
}

+ (NSDictionary *)remoteMessageUserInfoToDict:(NSDictionary *)userInfo {
  NSMutableDictionary *message = [[NSMutableDictionary alloc] init];
  NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
  NSMutableDictionary *notification = [[NSMutableDictionary alloc] init];
  NSMutableDictionary *notificationIOS = [[NSMutableDictionary alloc] init];

  // message.data
  for (id key in userInfo) {
    // message.messageId
    if ([key isEqualToString:@"gcm.message_id"] || [key isEqualToString:@"google.message_id"] ||
        [key isEqualToString:@"message_id"]) {
      message[@"messageId"] = userInfo[key];
      continue;
    }

    // message.messageType
    if ([key isEqualToString:@"message_type"]) {
      message[@"messageType"] = userInfo[key];
      continue;
    }

    // message.collapseKey
    if ([key isEqualToString:@"collapse_key"]) {
      message[@"collapseKey"] = userInfo[key];
      continue;
    }

    // message.from
    if ([key isEqualToString:@"from"] || [key isEqualToString:@"google.c.sender.id"]) {
      message[@"from"] = userInfo[key];
      continue;
    }

    // message.sentTime
    if ([key isEqualToString:@"google.c.a.ts"]) {
      message[@"sentTime"] = userInfo[key];
      continue;
    }

    // message.to
    if ([key isEqualToString:@"to"] || [key isEqualToString:@"google.to"]) {
      message[@"to"] = userInfo[key];
      continue;
    }

    // build data dict from remaining keys but skip keys that shouldn't be included in data
    if ([key isEqualToString:@"aps"] || [key hasPrefix:@"gcm."] || [key hasPrefix:@"google."]) {
      continue;
    }
    data[key] = userInfo[key];
  }
  message[@"data"] = data;

  if (userInfo[@"aps"] != nil) {
    NSDictionary *apsDict = userInfo[@"aps"];
    // message.category
    if (apsDict[@"category"] != nil) {
      message[@"category"] = apsDict[@"category"];
    }

    // message.threadId
    if (apsDict[@"thread-id"] != nil) {
      message[@"threadId"] = apsDict[@"thread-id"];
    }

    // message.contentAvailable
    if (apsDict[@"content-available"] != nil) {
      message[@"contentAvailable"] = @([RCTConvert BOOL:apsDict[@"content-available"]]);
    }

    // message.mutableContent
    if (apsDict[@"mutable-content"] != nil && [apsDict[@"mutable-content"] intValue] == 1) {
      message[@"mutableContent"] = @([RCTConvert BOOL:apsDict[@"mutable-content"]]);
    }

    // iOS only
    // message.notification.ios.badge
    if (apsDict[@"badge"] != nil) {
      notificationIOS[@"badge"] = apsDict[@"badge"];
    }

    // message.notification.*
    if (apsDict[@"alert"] != nil) {
      // can be a string or dictionary
      if ([apsDict[@"alert"] isKindOfClass:[NSString class]]) {
        // message.notification.title
        notification[@"title"] = apsDict[@"alert"];
      } else if ([apsDict[@"alert"] isKindOfClass:[NSDictionary class]]) {
        NSDictionary *apsAlertDict = apsDict[@"alert"];

        // message.notification.title
        if (apsAlertDict[@"title"] != nil) {
          notification[@"title"] = apsAlertDict[@"title"];
        }

        // message.notification.titleLocKey
        if (apsAlertDict[@"title-loc-key"] != nil) {
          notification[@"titleLocKey"] = apsAlertDict[@"title-loc-key"];
        }

        // message.notification.titleLocArgs
        if (apsAlertDict[@"title-loc-args"] != nil) {
          notification[@"titleLocArgs"] = apsAlertDict[@"title-loc-args"];
        }

        // message.notification.body
        if (apsAlertDict[@"body"] != nil) {
          notification[@"body"] = apsAlertDict[@"body"];
        }

        // message.notification.bodyLocKey
        if (apsAlertDict[@"loc-key"] != nil) {
          notification[@"bodyLocKey"] = apsAlertDict[@"loc-key"];
        }

        // message.notification.bodyLocArgs
        if (apsAlertDict[@"loc-args"] != nil) {
          notification[@"bodyLocArgs"] = apsAlertDict[@"loc-args"];
        }

        // iOS only
        // message.notification.ios.subtitle
        if (apsAlertDict[@"subtitle"] != nil) {
          notificationIOS[@"subtitle"] = apsAlertDict[@"subtitle"];
        }

        // iOS only
        // message.notification.ios.subtitleLocKey
        if (apsAlertDict[@"subtitle-loc-key"] != nil) {
          notificationIOS[@"subtitleLocKey"] = apsAlertDict[@"subtitle-loc-key"];
        }

        // iOS only
        // message.notification.ios.subtitleLocArgs
        if (apsAlertDict[@"subtitle-loc-args"] != nil) {
          notificationIOS[@"subtitleLocArgs"] = apsAlertDict[@"subtitle-loc-args"];
        }
      }
    }

    // message.notification.ios.sound
    if (apsDict[@"sound"] != nil) {
      if ([apsDict[@"sound"] isKindOfClass:[NSString class]]) {
        // message.notification.ios.sound
        notification[@"sound"] = apsDict[@"sound"];
      } else if ([apsDict[@"sound"] isKindOfClass:[NSDictionary class]]) {
        NSDictionary *apsSoundDict = apsDict[@"sound"];
        NSMutableDictionary *notificationIOSSound = [[NSMutableDictionary alloc] init];

        // message.notification.ios.sound.name String
        if (apsSoundDict[@"name"] != nil) {
          notificationIOSSound[@"name"] = apsSoundDict[@"name"];
        }

        // message.notification.ios.sound.critical Boolean
        if (apsSoundDict[@"critical"] != nil) {
          notificationIOSSound[@"critical"] = @([RCTConvert BOOL:apsSoundDict[@"critical"]]);
        }

        // message.notification.ios.sound.volume Number
        if (apsSoundDict[@"volume"] != nil) {
          notificationIOSSound[@"volume"] = apsSoundDict[@"volume"];
        }

        // message.notification.ios.sound
        notificationIOS[@"sound"] = notificationIOSSound;
      }
    }
  }
  if ([notificationIOS count] > 0) {
    notification[@"ios"] = notificationIOS;
  }
  if ([notification count] > 0) {
    message[@"notification"] = notification;
  }

  return message;
}

@end
