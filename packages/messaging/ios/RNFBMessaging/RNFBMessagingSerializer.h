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

#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>
#import <Firebase/Firebase.h>


static NSString *const KEY_COLLAPSE_KEY_SRC = @"collapse_key";
static NSString *const KEY_MESSAGE_TYPE_SRC = @"message_type";
static NSString *const KEY_TTL_SRC = @"google.ttl";
static NSString *const KEY_SENT_TIME_SRC = @"google.c.a.ts";
static NSString *const KEY_MESSAGE_ID_SRC = @"gcm.message_id";

static NSString *const KEY_COLLAPSE_KEY = @"collapseKey";
static NSString *const KEY_MESSAGE_ID = @"messageId";
static NSString *const KEY_MESSAGE_TYPE = @"messageType";
static NSString *const KEY_FROM = @"from";
static NSString *const KEY_SENT_TIME = @"sentTime";
static NSString *const KEY_TO = @"to";
static NSString *const KEY_TTL = @"ttl";

static NSString *const KEY_ERROR = @"error";

@interface RNFBMessagingSerializer : NSObject

- (NSDictionary *)remoteMessageToDict:(FIRMessagingRemoteMessage *)remoteMessage;

@end
