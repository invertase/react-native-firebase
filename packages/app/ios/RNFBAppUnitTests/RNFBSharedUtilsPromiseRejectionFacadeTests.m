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

#import "RNFBHandleMapStorage-Swift.inc"
#import "RNFBSharedUtils.h"

@interface RNFBSharedUtilsPromiseRejectionFacadeTests : XCTestCase
@end

@implementation RNFBSharedUtilsPromiseRejectionFacadeTests

- (void)testFacadeExceptionPath {
  NSException *exception = [NSException exceptionWithName:@"FacadeException"
                                                   reason:@"facade boom"
                                                 userInfo:nil];

  __block NSString *capturedCode = nil;
  __block NSString *capturedMessage = nil;
  __block NSError *capturedError = nil;

  [RNFBSharedUtils
      rejectPromiseWithExceptionDict:^(NSString *code, NSString *message, NSError *error) {
        capturedCode = code;
        capturedMessage = message;
        capturedError = error;
      }
                           exception:exception];

  XCTAssertEqualObjects(capturedCode, @"FacadeException");
  XCTAssertEqualObjects(capturedMessage, @"facade boom");
  XCTAssertEqualObjects(capturedError.domain, @"RNFBErrorDomain");
  XCTAssertEqual(capturedError.code, 666);
  XCTAssertEqualObjects(capturedError.userInfo[@"fatal"], @YES);
  XCTAssertEqualObjects(capturedError.userInfo[@"code"], @"unknown");
  XCTAssertEqualObjects(capturedError.userInfo[@"message"], @"facade boom");
  XCTAssertEqualObjects(capturedError.userInfo[@"nativeErrorCode"], @"FacadeException");
  XCTAssertEqualObjects(capturedError.userInfo[@"nativeErrorMessage"], @"facade boom");
}

- (void)testFacadeNSErrorPath {
  NSError *source = [NSError errorWithDomain:@"SourceDomain"
                                        code:7
                                    userInfo:@{NSLocalizedDescriptionKey : @"ns fail"}];

  __block NSString *capturedCode = nil;
  __block NSString *capturedMessage = nil;
  __block NSError *capturedError = nil;

  [RNFBSharedUtils
      rejectPromiseWithNSError:^(NSString *code, NSString *message, NSError *error) {
        capturedCode = code;
        capturedMessage = message;
        capturedError = error;
      }
                         error:source];

  XCTAssertEqualObjects(capturedCode, @"unknown");
  XCTAssertEqualObjects(capturedMessage, @"ns fail");
  XCTAssertEqualObjects(capturedError.domain, @"RNFBErrorDomain");
  XCTAssertEqual(capturedError.code, 666);
  XCTAssertEqualObjects(capturedError.userInfo[@"fatal"], @NO);
  XCTAssertEqualObjects(capturedError.userInfo[@"nativeErrorCode"], @7);
  XCTAssertEqualObjects(capturedError.userInfo[@"nativeErrorMessage"], @"ns fail");
}

- (void)testFacadeUserInfoPath {
  NSMutableDictionary *userInfo = [@{
    @"code" : @"storage/unknown",
    @"message" : @"user info reject",
  } mutableCopy];

  __block NSString *capturedCode = nil;
  __block NSString *capturedMessage = nil;
  __block NSError *capturedError = nil;

  [RNFBSharedUtils
      rejectPromiseWithUserInfo:^(NSString *code, NSString *message, NSError *error) {
        capturedCode = code;
        capturedMessage = message;
        capturedError = error;
      }
                       userInfo:userInfo];

  XCTAssertEqualObjects(capturedCode, @"storage/unknown");
  XCTAssertEqualObjects(capturedMessage, @"user info reject");
  XCTAssertEqualObjects(capturedError.domain, @"RNFBErrorDomain");
  XCTAssertEqual(capturedError.code, 666);
  XCTAssertEqualObjects(capturedError.userInfo[@"code"], @"storage/unknown");
  XCTAssertEqualObjects(capturedError.userInfo[@"message"], @"user info reject");
}

@end
