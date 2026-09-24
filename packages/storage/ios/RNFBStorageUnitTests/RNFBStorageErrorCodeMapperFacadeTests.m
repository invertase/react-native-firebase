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

@interface RNFBStorageErrorCodeMapperFacadeTests : XCTestCase
@end

@implementation RNFBStorageErrorCodeMapperFacadeTests

- (NSError *)errorWithCode:(NSInteger)code description:(NSString *)description {
  return [NSError errorWithDomain:@"FIRStorageErrorDomain"
                             code:code
                         userInfo:@{NSLocalizedDescriptionKey : description}];
}

- (void)testObjCSelectorNilAndKnownCodes {
  NSArray *nilPair = [RNFBStorageErrorCodeMapper codeAndMessageForError:nil];
  XCTAssertEqualObjects(nilPair[0], @"unknown");
  XCTAssertEqualObjects(nilPair[1], @"An unknown error has occurred.");

  // FIRStorageErrorCodeObjectNotFound
  NSArray *notFound = [RNFBStorageErrorCodeMapper codeAndMessageForError:[self errorWithCode:-13010
                                                                                 description:@"x"]];
  XCTAssertEqualObjects(notFound[0], @"object-not-found");
  XCTAssertEqualObjects(notFound[1], @"No object exists at the desired reference.");

  // FIRStorageErrorCodeCancelled
  NSArray *cancelled = [RNFBStorageErrorCodeMapper
      codeAndMessageForError:[self errorWithCode:-13040 description:@"x"]];
  XCTAssertEqualObjects(cancelled[0], @"cancelled");
  XCTAssertEqualObjects(cancelled[1], @"User cancelled the operation.");
}

- (void)testObjCSelectorUnknownPermissionAndResponseBody {
  // Permission-denied underlying → invalid-device-file-path
  NSError *underlying = [NSError
      errorWithDomain:NSPOSIXErrorDomain
                 code:1
             userInfo:@{
               NSLocalizedDescriptionKey : @"The operation couldn’t be completed. Permission denied"
             }];
  NSError *permissionError = [NSError errorWithDomain:@"FIRStorageErrorDomain"
                                                 code:-13000
                                             userInfo:@{NSUnderlyingErrorKey : underlying}];
  NSArray *permissionPair = [RNFBStorageErrorCodeMapper codeAndMessageForError:permissionError];
  XCTAssertEqualObjects(permissionPair[0], @"invalid-device-file-path");
  XCTAssertEqualObjects(permissionPair[1],
                        @"The specified device file path is invalid or is restricted.");

  // ResponseBody → formatted unknown message
  NSError *bodyError = [NSError errorWithDomain:@"FIRStorageErrorDomain"
                                           code:-13000
                                       userInfo:@{@"ResponseBody" : @"backend detail"}];
  NSArray *bodyPair = [RNFBStorageErrorCodeMapper codeAndMessageForError:bodyError];
  XCTAssertEqualObjects(bodyPair[0], @"unknown");
  XCTAssertEqualObjects(bodyPair[1],
                        @"An unknown error has occurred. (underlying reason 'backend detail')");
}

- (void)testObjCSelectorDefaultKeepsLocalizedDescription {
  // FIRStorageErrorCodeInvalidArgument
  NSArray *pair = [RNFBStorageErrorCodeMapper
      codeAndMessageForError:[self errorWithCode:-13050 description:@"keep me"]];
  XCTAssertEqualObjects(pair[0], @"unknown");
  XCTAssertEqualObjects(pair[1], @"keep me");
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue([RNFBStorageErrorCodeMapper respondsToSelector:@selector(codeAndMessageForError:)]);
  NSMethodSignature *signature =
      [RNFBStorageErrorCodeMapper methodSignatureForSelector:@selector(codeAndMessageForError:)];
  XCTAssertEqual(strcmp(signature.methodReturnType, @encode(id)), 0);
}

@end
