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

#import <Firebase/Firebase.h>
#import "RNFBMessagingHelper.h"

@interface RNFBMessagingHelperHostStubTests : XCTestCase
@end

@implementation RNFBMessagingHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRMessaging resetTestState];
}

- (void)tearDown {
  [FIRMessaging resetTestState];
  [super tearDown];
}

- (void)testIsAutoInitEnabled_forwardsStubValue {
  [FIRMessaging messaging].autoInitEnabled = YES;
  XCTAssertTrue([RNFBMessagingHelper isAutoInitEnabled]);
}

- (void)testSetAutoInitEnabled_updatesMessagingAndResolves {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBMessagingHelper setAutoInitEnabled:YES
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertTrue([FIRMessaging messaging].autoInitEnabled);
}

- (void)testGetToken_forwardsSenderIdAndResolvesToken {
  FIRMessaging.retrieveFCMTokenResult = @"token-abc";
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBMessagingHelper getTokenWithSenderId:@"sender-1"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, @"token-abc");
  XCTAssertEqualObjects(FIRMessaging.lastRetrieveSenderID, @"sender-1");
}

- (void)testGetToken_error_rejects {
  FIRMessaging.retrieveFCMTokenError =
      [NSError errorWithDomain:@"test" code:1 userInfo:@{NSLocalizedDescriptionKey : @"nope"}];
  FIRMessaging.retrieveFCMTokenResult = nil;

  __block NSString *rejectMessage = nil;
  [RNFBMessagingHelper getTokenWithSenderId:@"sender-err"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectMessage, @"nope");
}

- (void)testDeleteToken_forwardsSenderIdAndResolves {
  __block id resolved = @"unset";
  [RNFBMessagingHelper deleteTokenWithSenderId:@"sender-del"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertEqualObjects(FIRMessaging.lastDeleteSenderID, @"sender-del");
}

- (void)testDeleteToken_error_rejects {
  FIRMessaging.deleteFCMTokenError =
      [NSError errorWithDomain:@"test" code:3 userInfo:@{NSLocalizedDescriptionKey : @"del-fail"}];
  __block NSString *rejectMessage = nil;
  [RNFBMessagingHelper deleteTokenWithSenderId:@"sender-del-err"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];
  XCTAssertEqualObjects(rejectMessage, @"del-fail");
}

- (void)testGetAPNSToken_whenPresent_resolvesHexString {
  const unsigned char bytes[] = {0xAB, 0xCD};
  [FIRMessaging messaging].APNSToken = [NSData dataWithBytes:bytes length:sizeof(bytes)];

  __block id resolved = @"unset";
  [RNFBMessagingHelper
      getAPNSToken:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, @"ABCD");
}

- (void)testGetAPNSToken_whenAbsent_resolvesNullOnMacHost {
  // macOS HostStub skips the UIKit unregistered gate; nil APNSToken resolves null.
  __block id resolved = @"unset";
  [RNFBMessagingHelper
      getAPNSToken:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
}

- (void)testSetAPNSToken_prod_forwardsParsedDataAndType {
  __block id resolved = @"unset";
  [RNFBMessagingHelper setAPNSToken:@"aabb"
      type:@"prod"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertEqual(FIRMessaging.lastSetAPNSTokenType, FIRMessagingAPNSTokenTypeProd);
  const unsigned char expected[] = {0xAA, 0xBB};
  XCTAssertEqualObjects(FIRMessaging.lastSetAPNSTokenData, [NSData dataWithBytes:expected
                                                                          length:sizeof(expected)]);
}

- (void)testSetAPNSToken_sandbox_setsSandboxType {
  [RNFBMessagingHelper setAPNSToken:@"ccdd"
      type:@"sandbox"
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRMessaging.lastSetAPNSTokenType, FIRMessagingAPNSTokenTypeSandbox);
}

- (void)testSetAPNSToken_invalidHex_rejects {
  __block NSString *rejectCode = nil;
  [RNFBMessagingHelper setAPNSToken:@"odd"
      type:@"sandbox"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];

  XCTAssertEqualObjects(rejectCode, @"invalid-apns-token");
}

- (void)testSubscribeAndUnsubscribe_forwardTopics {
  __block NSUInteger resolves = 0;
  [RNFBMessagingHelper subscribeToTopic:@"news"
      resolve:^(id result) {
        (void)result;
        resolves += 1;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  [RNFBMessagingHelper unsubscribeFromTopic:@"news"
      resolve:^(id result) {
        (void)result;
        resolves += 1;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqual(resolves, 2u);
  XCTAssertEqualObjects(FIRMessaging.lastSubscribeTopic, @"news");
  XCTAssertEqualObjects(FIRMessaging.lastUnsubscribeTopic, @"news");
  XCTAssertEqual(FIRMessaging.subscribeCallCount, 1u);
  XCTAssertEqual(FIRMessaging.unsubscribeCallCount, 1u);
}

- (void)testSubscribe_error_rejects {
  FIRMessaging.topicOperationError =
      [NSError errorWithDomain:@"test" code:2 userInfo:@{NSLocalizedDescriptionKey : @"sub-fail"}];
  __block NSString *rejectMessage = nil;
  [RNFBMessagingHelper subscribeToTopic:@"bad"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];
  XCTAssertEqualObjects(rejectMessage, @"sub-fail");
}

- (void)testUnsubscribe_error_rejects {
  FIRMessaging.topicOperationError =
      [NSError errorWithDomain:@"test"
                          code:4
                      userInfo:@{NSLocalizedDescriptionKey : @"unsub-fail"}];
  __block NSString *rejectMessage = nil;
  [RNFBMessagingHelper unsubscribeFromTopic:@"bad"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];
  XCTAssertEqualObjects(rejectMessage, @"unsub-fail");
}

@end
