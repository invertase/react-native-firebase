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
 */

#import <XCTest/XCTest.h>

#import "RNFBMessagingSerializer.h"
#import "UserNotifications/UserNotifications.h"

@interface RNFBMessagingSerializerFacadeTests : XCTestCase
@end

@implementation RNFBMessagingSerializerFacadeTests

- (void)testAPNSTokenRoundTripViaFacade {
  NSData *data = [RNFBMessagingSerializer APNSTokenDataFromNSString:@"deadbeef"];
  XCTAssertEqualObjects(data, ([NSData dataWithBytes:(uint8_t[]){0xde, 0xad, 0xbe, 0xef}
                                              length:4]));
  XCTAssertEqualObjects([RNFBMessagingSerializer APNSTokenFromNSData:data], @"DEADBEEF");
  XCTAssertNil([RNFBMessagingSerializer APNSTokenDataFromNSString:@"xyz"]);
}

- (void)testRemoteMessageUserInfoToDictViaFacade {
  NSDictionary *message =
      [RNFBMessagingSerializer remoteMessageUserInfoToDict:@{@"message_id" : @"m1", @"k" : @"v"}];
  XCTAssertEqualObjects(message[@"messageId"], @"m1");
  XCTAssertEqualObjects(message[@"data"][@"k"], @"v");
}

- (void)testNotificationToDictUnwrapsUserInfo {
  UNNotification *notification =
      [[UNNotification alloc] initWithUserInfo:@{@"aps" : @{@"sound" : @"tone.aiff"}}];
  NSDictionary *message = [RNFBMessagingSerializer notificationToDict:notification];
  XCTAssertEqualObjects(message[@"notification"][@"ios"][@"sound"], @"tone.aiff");
}

@end
