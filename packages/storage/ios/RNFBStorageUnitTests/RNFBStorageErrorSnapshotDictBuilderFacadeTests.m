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

@interface RNFBStorageErrorSnapshotDictBuilderFacadeTests : XCTestCase
@end

@implementation RNFBStorageErrorSnapshotDictBuilderFacadeTests

- (NSError *)errorWithCode:(NSInteger)code description:(NSString *)description {
  return [NSError errorWithDomain:@"FIRStorageErrorDomain"
                             code:code
                         userInfo:@{NSLocalizedDescriptionKey : description}];
}

- (void)testFullBuilderSetsCodeMessageAndNativeErrorMessage {
  NSMutableDictionary *snapshot = [@{@"status" : @"error"} mutableCopy];
  // FIRStorageErrorCodeObjectNotFound
  NSError *error = [self errorWithCode:-13010 description:@"native detail"];

  NSDictionary *result = [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDict:error
                                                                    taskSnapshotDict:snapshot];

  XCTAssertTrue(result == snapshot, @"must mutate in place and return same dict");
  NSDictionary *errorDict = snapshot[@"error"];
  XCTAssertEqualObjects(errorDict[@"code"], @"object-not-found");
  XCTAssertEqualObjects(errorDict[@"message"], @"No object exists at the desired reference.");
  XCTAssertEqualObjects(errorDict[@"nativeErrorMessage"], @"native detail");
  XCTAssertEqual(errorDict.count, 3u);
}

- (void)testFromCodeAndMessageSetsCodeAndMessageOnly {
  NSMutableDictionary *snapshot = [@{@"status" : @"error"} mutableCopy];
  NSArray *pair = @[ @"unauthorized", @"User is not authorized to perform the desired action." ];

  NSDictionary *result =
      [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDictFromCodeAndMessage:pair
                                                                   taskSnapshotDict:snapshot];

  XCTAssertTrue(result == snapshot, @"must mutate in place and return same dict");
  NSDictionary *errorDict = snapshot[@"error"];
  XCTAssertEqualObjects(errorDict[@"code"], @"unauthorized");
  XCTAssertEqualObjects(errorDict[@"message"],
                        @"User is not authorized to perform the desired action.");
  XCTAssertNil(errorDict[@"nativeErrorMessage"]);
  XCTAssertEqual(errorDict.count, 2u);
}

- (void)testNilSnapshotDictReturnsNil {
  NSError *error = [self errorWithCode:-13040 description:@"cancelled native"];
  NSDictionary *fullNil = [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDict:error
                                                                     taskSnapshotDict:nil];
  XCTAssertNil(fullNil);

  NSArray *pair = @[ @"cancelled", @"User cancelled the operation." ];
  NSDictionary *codeNil =
      [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDictFromCodeAndMessage:pair
                                                                   taskSnapshotDict:nil];
  XCTAssertNil(codeNil);
}

- (void)testFullBuilderNilErrorUsesNullNativeMessage {
  NSMutableDictionary *snapshot = [NSMutableDictionary dictionary];
  NSDictionary *result = [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDict:nil
                                                                    taskSnapshotDict:snapshot];
  XCTAssertTrue(result == snapshot);
  NSDictionary *errorDict = snapshot[@"error"];
  XCTAssertEqualObjects(errorDict[@"code"], @"unknown");
  XCTAssertEqualObjects(errorDict[@"message"], @"An unknown error has occurred.");
  XCTAssertEqualObjects(errorDict[@"nativeErrorMessage"], [NSNull null]);
}

- (void)testEmptySnapshotDictMutatedInPlace {
  NSMutableDictionary *empty = [NSMutableDictionary dictionary];
  NSError *error = [self errorWithCode:-13040 description:@"cancelled native"];

  NSDictionary *fullResult = [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDict:error
                                                                        taskSnapshotDict:empty];
  XCTAssertTrue(fullResult == empty);
  XCTAssertEqualObjects(empty[@"error"][@"code"], @"cancelled");
  XCTAssertEqualObjects(empty[@"error"][@"nativeErrorMessage"], @"cancelled native");

  NSMutableDictionary *empty2 = [NSMutableDictionary dictionary];
  NSArray *pair = @[ @"unknown", @"An unknown error has occurred." ];
  NSDictionary *codeResult =
      [RNFBStorageErrorSnapshotDictBuilder buildErrorSnapshotDictFromCodeAndMessage:pair
                                                                   taskSnapshotDict:empty2];
  XCTAssertTrue(codeResult == empty2);
  XCTAssertEqualObjects(empty2[@"error"][@"code"], @"unknown");
  XCTAssertNil(empty2[@"error"][@"nativeErrorMessage"]);
}

- (void)testFacadePublicSelectorsUnchanged {
  SEL fullSel = @selector(buildErrorSnapshotDict:taskSnapshotDict:);
  SEL fromCodeSel = @selector(buildErrorSnapshotDictFromCodeAndMessage:taskSnapshotDict:);

  XCTAssertTrue([RNFBStorageErrorSnapshotDictBuilder respondsToSelector:fullSel]);
  XCTAssertTrue([RNFBStorageErrorSnapshotDictBuilder respondsToSelector:fromCodeSel]);

  NSMethodSignature *fullSig =
      [RNFBStorageErrorSnapshotDictBuilder methodSignatureForSelector:fullSel];
  XCTAssertEqual(strcmp(fullSig.methodReturnType, @encode(id)), 0);

  NSMethodSignature *codeSig =
      [RNFBStorageErrorSnapshotDictBuilder methodSignatureForSelector:fromCodeSel];
  XCTAssertEqual(strcmp(codeSig.methodReturnType, @encode(id)), 0);
}

@end
