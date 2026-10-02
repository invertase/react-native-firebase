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
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBFirestoreDocumentModuleHelper.h"

@interface RNFBFirestoreDocumentModuleHelperHostStubTests : XCTestCase
@end

@implementation RNFBFirestoreDocumentModuleHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [RNFBFirestoreDocumentModuleHelper invalidate];
  FIRFirestore.testInstance = [[FIRFirestore alloc] init];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFirestoreDocumentModuleHelper invalidate];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [super tearDown];
}

- (void)testInvalidate_allowsReregister {
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:1
                                  snapshotListenOptions:@{}];
  [RNFBFirestoreDocumentModuleHelper invalidate];
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:1
                                  snapshotListenOptions:@{}];
  XCTAssertNotNil(FIRDocumentReference.lastSnapshotListener);
}

- (void)testDocumentOnSnapshot_duplicateListenerId_returnsEarly {
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:2
                                  snapshotListenOptions:@{}];
  FIRDocumentReference.lastSnapshotListener = nil;
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:2
                                  snapshotListenOptions:@{
                                    @"includeMetadataChanges" : @YES,
                                    @"source" : @"cache",
                                  }];
  XCTAssertNil(FIRDocumentReference.lastSnapshotListener);
}

- (void)testDocumentOnSnapshot_successAndErrorEvents {
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"db"
                                                   path:@"col/doc"
                                             listenerId:3
                                  snapshotListenOptions:@{
                                    @"includeMetadataChanges" : @YES,
                                    @"source" : @"cache",
                                  }];

  [FIRDocumentReference invokeLastSnapshotListenerWithSnapshot:[[FIRDocumentSnapshot alloc] init]
                                                         error:nil];
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventName, @"firestore_document_sync_event");
  XCTAssertNotNil(RNFBRCTEventEmitter.lastEventBody[@"body"][@"snapshot"]);
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventBody[@"body"][@"snapshot"][@"firestoreKey"],
                        @"app-db");

  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"db"
                                                   path:@"col/doc"
                                             listenerId:4
                                  snapshotListenOptions:nil];
  NSError *error = [NSError errorWithDomain:@"test"
                                       code:1
                                   userInfo:@{NSLocalizedDescriptionKey : @"boom"}];
  [FIRDocumentReference invokeLastSnapshotListenerWithSnapshot:nil error:error];
  XCTAssertNotNil(RNFBRCTEventEmitter.lastEventBody[@"body"][@"error"]);
}

- (void)testDocumentOffSnapshot_removesListener {
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:5
                                  snapshotListenOptions:@{}];
  [RNFBFirestoreDocumentModuleHelper documentOffSnapshot:@"app"
                                              databaseId:@"(default)"
                                              listenerId:5];
  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:@"app"
                                             databaseId:@"(default)"
                                                   path:@"col/doc"
                                             listenerId:5
                                  snapshotListenOptions:@{}];
  XCTAssertNotNil(FIRDocumentReference.lastSnapshotListener);
}

- (void)testDocumentGet_sourceBranchesAndError {
  __block id resolved = @"unset";
  [RNFBFirestoreDocumentModuleHelper documentGet:@"app"
      databaseId:@"db"
      path:@"col/doc"
      getOptions:@{@"source" : @"server"}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRDocumentReference.lastGetDocumentSource, FIRFirestoreSourceServer);
  XCTAssertEqualObjects(resolved[@"firestoreKey"], @"app-db");

  [RNFBFirestoreDocumentModuleHelper documentGet:@"app"
      databaseId:@"db"
      path:@"col/doc"
      getOptions:@{@"source" : @"cache"}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRDocumentReference.lastGetDocumentSource, FIRFirestoreSourceCache);

  [RNFBFirestoreDocumentModuleHelper documentGet:@"app"
      databaseId:@"db"
      path:@"col/doc"
      getOptions:@{@"source" : @"other"}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRDocumentReference.lastGetDocumentSource, FIRFirestoreSourceDefault);

  [RNFBFirestoreDocumentModuleHelper documentGet:@"app"
      databaseId:@"db"
      path:@"col/doc"
      getOptions:@{}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRDocumentReference.lastGetDocumentSource, FIRFirestoreSourceDefault);

  FIRDocumentReference.getDocumentError =
      [NSError errorWithDomain:@"test"
                          code:2
                      userInfo:@{NSLocalizedDescriptionKey : @"get failed"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreDocumentModuleHelper documentGet:@"app"
      databaseId:@"db"
      path:@"col/doc"
      getOptions:@{}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

- (void)testDocumentDelete_successAndError {
  __block id resolved = @"unset";
  [RNFBFirestoreDocumentModuleHelper documentDelete:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertNil(resolved);
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteMode, @"delete");

  FIRDocumentReference.writeError = [NSError errorWithDomain:@"test"
                                                        code:3
                                                    userInfo:@{NSLocalizedDescriptionKey : @"del"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreDocumentModuleHelper documentDelete:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

- (void)testDocumentSet_mergeMergeFieldsAndPlain {
  __block id resolved = @"unset";
  [RNFBFirestoreDocumentModuleHelper documentSet:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"a" : @1}
      options:@{@"merge" : @YES}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertNil(resolved);
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteMode, @"set-merge");

  [RNFBFirestoreDocumentModuleHelper documentSet:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"a" : @1}
      options:@{@"mergeFields" : @[ @"a" ]}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteMode, @"set-mergeFields");
  XCTAssertEqualObjects(FIRDocumentReference.lastMergeFields, @[ @"a" ]);

  [RNFBFirestoreDocumentModuleHelper documentSet:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"a" : @1}
      options:@{}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteMode, @"set");

  FIRDocumentReference.writeError = [NSError errorWithDomain:@"test"
                                                        code:4
                                                    userInfo:@{NSLocalizedDescriptionKey : @"set"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreDocumentModuleHelper documentSet:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"a" : @1}
      options:@{}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

- (void)testDocumentUpdate_successAndError {
  __block id resolved = @"unset";
  [RNFBFirestoreDocumentModuleHelper documentUpdate:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"b" : @2}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertNil(resolved);
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteMode, @"update");
  XCTAssertEqualObjects(FIRDocumentReference.lastWriteData[@"b"], @2);

  FIRDocumentReference.writeError = [NSError errorWithDomain:@"test"
                                                        code:5
                                                    userInfo:@{NSLocalizedDescriptionKey : @"upd"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreDocumentModuleHelper documentUpdate:@"app"
      databaseId:@"(default)"
      path:@"col/doc"
      data:@{@"b" : @2}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

- (void)testDocumentBatch_allWriteTypesAndCommitError {
  __block id resolved = @"unset";
  [RNFBFirestoreDocumentModuleHelper documentBatch:@"app"
      databaseId:@"(default)"
      writes:@[
        @{@"type" : @"DELETE", @"path" : @"col/a", @"data" : @{}},
        @{
          @"type" : @"SET",
          @"path" : @"col/b",
          @"data" : @{@"x" : @1},
          @"options" : @{@"merge" : @YES}
        },
        @{
          @"type" : @"SET",
          @"path" : @"col/c",
          @"data" : @{@"x" : @1},
          @"options" : @{@"mergeFields" : @[ @"x" ]}
        },
        @{@"type" : @"SET", @"path" : @"col/d", @"data" : @{@"x" : @1}, @"options" : @{}},
        @{@"type" : @"UPDATE", @"path" : @"col/e", @"data" : @{@"y" : @2}},
      ]
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertNil(resolved);
  XCTAssertEqual(FIRWriteBatch.recordedOperations.count, 5u);
  XCTAssertEqualObjects(FIRWriteBatch.recordedOperations[0][@"type"], @"DELETE");
  XCTAssertEqualObjects(FIRWriteBatch.recordedOperations[1][@"type"], @"SET-merge");
  XCTAssertEqualObjects(FIRWriteBatch.recordedOperations[2][@"type"], @"SET-mergeFields");
  XCTAssertEqualObjects(FIRWriteBatch.recordedOperations[3][@"type"], @"SET");
  XCTAssertEqualObjects(FIRWriteBatch.recordedOperations[4][@"type"], @"UPDATE");

  FIRWriteBatch.commitError = [NSError errorWithDomain:@"test"
                                                  code:6
                                              userInfo:@{NSLocalizedDescriptionKey : @"batch"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreDocumentModuleHelper documentBatch:@"app"
      databaseId:@"(default)"
      writes:@[ @{@"type" : @"DELETE", @"path" : @"col/a", @"data" : @{}} ]
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

@end
