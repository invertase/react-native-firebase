//
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

@implementation RNFBMessagingSerializer

- (NSDictionary *)remoteMessageToDict:(FIRMessagingRemoteMessage *)remoteMessage {
  NSMutableDictionary *data = [[NSMutableDictionary alloc] init];
  NSMutableDictionary *message = [[NSMutableDictionary alloc] init];

  message[KEY_MESSAGE_ID] = remoteMessage.messageID;

  NSDictionary *appData = remoteMessage.appData;
  for (id key in appData) {
    if ([key isEqualToString:KEY_COLLAPSE_KEY]) {
      message[@"collapseKey"] = appData[KEY_COLLAPSE_KEY];
    } else if ([key isEqualToString:KEY_COLLAPSE_KEY]) {
      message[@"collapseKey"] = appData[KEY_COLLAPSE_KEY];
    } else if ([key isEqualToString:@"from"]) {
      message[@"from"] = appData[key];
    } else if ([key isEqualToString:@"notification"]) {
// Ignore for messages
    } else {
// Assume custom data key
      data[key] = appData[key];
    }
  }
  message[@"data"] = data;

  return message;
}

@end