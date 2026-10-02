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
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreTransactionAttempt.h"
#import "RNFBFirestoreTransactionModuleHelper.h"

@interface RNFBFirestoreTransactionModuleHelperHostStubTests : XCTestCase
@end

@implementation RNFBFirestoreTransactionModuleHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBFirestoreTransactionModuleHelper invalidate];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFirestoreTransactionModuleHelper invalidate];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [super tearDown];
}

- (void)testTransactionGetDocument_missingTransaction_rejectsInternalError {
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:42
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, RNFBFirestoreTransactionRejectCodeInternalError);
  XCTAssertEqualObjects(rejectMessage, RNFBFirestoreTransactionMissingIdMessage);
}

- (void)testTransactionDisposeAndApplyBuffer_missingAttempt_noCrash {
  [RNFBFirestoreTransactionModuleHelper transactionDispose:@"app"
                                                databaseId:@"(default)"
                                             transactionId:99];
  [RNFBFirestoreTransactionModuleHelper
      transactionApplyBuffer:@"app"
                  databaseId:@"(default)"
               transactionId:99
               commandBuffer:@[ @{@"type" : @"DELETE", @"path" : @"a/b"} ]];
  XCTAssertTrue(YES);
}

- (void)testTransactionBegin_withAndWithoutMaxAttempts_completes {
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:7
                                             maxAttempts:0];
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:8
                                             maxAttempts:5];
  // Host stub completes transactions without invoking the update block.
  XCTAssertTrue(YES);
}

@end
