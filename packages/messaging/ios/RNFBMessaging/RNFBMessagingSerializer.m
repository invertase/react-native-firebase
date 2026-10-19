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

#if __has_include(<RNFBMessaging/RNFBMessaging-Swift.h>)
#import <RNFBMessaging/RNFBMessaging-Swift.h>
#elif __has_include("RNFBMessaging-Swift.h")
#import "RNFBMessaging-Swift.h"
#elif __has_include("RNFBMessagingSerializerStorage-Swift.inc")
#import "RNFBMessagingSerializerStorage-Swift.inc"
#else
#error "RNFBMessagingSerializerStorage Swift interface not found"
#endif

@implementation RNFBMessagingSerializer

+ (nullable NSData *)APNSTokenDataFromNSString:(NSString *)token {
  return [RNFBMessagingSerializerStorage APNSTokenDataFromNSString:token];
}

+ (NSString *)APNSTokenFromNSData:(NSData *)tokenData {
  return [RNFBMessagingSerializerStorage APNSTokenFromNSData:tokenData];
}

+ (NSDictionary *)notificationToDict:(UNNotification *)notification {
  return [RNFBMessagingSerializerStorage
      remoteMessageUserInfoToDict:notification.request.content.userInfo];
}

+ (NSDictionary *)remoteMessageUserInfoToDict:(NSDictionary *)userInfo {
  return [RNFBMessagingSerializerStorage remoteMessageUserInfoToDict:userInfo];
}

@end
