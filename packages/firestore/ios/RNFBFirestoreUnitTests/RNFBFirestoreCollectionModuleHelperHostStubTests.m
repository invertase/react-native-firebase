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
#import "RNFBFirestore/RNFBFirestorePipelineCallHandlerHostStub.h"
#import "RNFBFirestoreCollectionModuleHelper.h"

@interface RNFBFirestoreCollectionModuleHelperHostStubTests : XCTestCase
@end

@implementation RNFBFirestoreCollectionModuleHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [RNFBFirestorePipelineCallHandler resetTestState];
  [RNFBFirestoreCollectionModuleHelper invalidate];
  FIRFirestore.testInstance = [[FIRFirestore alloc] init];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFirestoreCollectionModuleHelper invalidate];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [RNFBFirestorePipelineCallHandler resetTestState];
  [super tearDown];
}

- (void)testInvalidate_clearsListeners {
  FIRFirestore.namedQueryResult = [[FIRQuery alloc] init];
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                  queryName:@"q1"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:1
                                      snapshotListenOptions:@{}];
  [RNFBFirestoreCollectionModuleHelper invalidate];
  // Re-registering the same id after invalidate must succeed (not early-return).
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                  queryName:@"q1"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:1
                                      snapshotListenOptions:@{}];
  XCTAssertEqualObjects(FIRFirestore.lastNamedQueryName, @"q1");
}

- (void)testNamedQueryOnSnapshot_nilQuery_sendsErrorEvent {
  FIRFirestore.namedQueryResult = nil;
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:@"app"
                                                 databaseId:@"db"
                                                  queryName:@"missing"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:11
                                      snapshotListenOptions:@{}];
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventName, @"firestore_collection_sync_event");
  NSDictionary *body = RNFBRCTEventEmitter.lastEventBody;
  XCTAssertEqualObjects(body[@"listenerId"], @11);
  XCTAssertNotNil(body[@"body"][@"error"]);
}

- (void)testNamedQueryOnSnapshot_duplicateListenerId_returnsEarly {
  FIRFirestore.namedQueryResult = [[FIRQuery alloc] init];
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                  queryName:@"first"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:2
                                      snapshotListenOptions:@{}];
  FIRFirestore.lastNamedQueryName = nil;
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                  queryName:@"second"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:2
                                      snapshotListenOptions:@{}];
  XCTAssertNil(FIRFirestore.lastNamedQueryName);
}

- (void)testCollectionOnSnapshot_successAndErrorEvents {
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:3
                                      snapshotListenOptions:@{
                                        @"includeMetadataChanges" : @YES,
                                        @"source" : @"cache",
                                      }];

  [FIRQuery invokeLastSnapshotListenerWithSnapshot:[[FIRQuerySnapshot alloc] init] error:nil];
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventName, @"firestore_collection_sync_event");
  XCTAssertNotNil(RNFBRCTEventEmitter.lastEventBody[@"body"][@"snapshot"]);
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventBody[@"body"][@"snapshot"][@"source"],
                        @"onSnapshot");

  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:4
                                      snapshotListenOptions:@{}];
  NSError *error = [NSError errorWithDomain:@"test"
                                       code:1
                                   userInfo:@{NSLocalizedDescriptionKey : @"boom"}];
  [FIRQuery invokeLastSnapshotListenerWithSnapshot:nil error:error];
  XCTAssertNotNil(RNFBRCTEventEmitter.lastEventBody[@"body"][@"error"]);
}

- (void)testCollectionOffSnapshot_removesListener {
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:5
                                      snapshotListenOptions:@{}];
  [RNFBFirestoreCollectionModuleHelper collectionOffSnapshot:@"app"
                                                  databaseId:@"(default)"
                                                  listenerId:5];
  // Same id can be registered again after off.
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:5
                                      snapshotListenOptions:@{}];
  XCTAssertNotNil(FIRQuery.lastSnapshotListener);
}

- (void)testCollectionOnSnapshot_duplicateListenerId_returnsEarly {
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:6
                                      snapshotListenOptions:@{}];
  FIRQuery.lastSnapshotListener = nil;
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:@"app"
                                                 databaseId:@"(default)"
                                                       path:@"col-other"
                                                       type:@"collection"
                                                    filters:@[]
                                                     orders:@[]
                                                    options:@{}
                                                 listenerId:6
                                      snapshotListenOptions:@{}];
  XCTAssertNil(FIRQuery.lastSnapshotListener);
}

- (void)testNamedQueryGet_nilQuery_rejects {
  FIRFirestore.namedQueryResult = nil;
  __block NSString *rejectCode = nil;
  __block BOOL resolved = NO;
  [RNFBFirestoreCollectionModuleHelper namedQueryGet:@"app"
      databaseId:@"(default)"
      queryName:@"gone"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
      getOptions:@{}
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

- (void)testNamedQueryGet_success_resolvesSerializedSnapshot {
  FIRFirestore.namedQueryResult = [[FIRQuery alloc] init];
  __block id resolved = @"unset";
  [RNFBFirestoreCollectionModuleHelper namedQueryGet:@"app"
      databaseId:@"db"
      queryName:@"named"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
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
  XCTAssertEqual(FIRQuery.lastGetDocumentsSource, FIRFirestoreSourceServer);
  XCTAssertEqualObjects(resolved[@"source"], @"get");
  XCTAssertEqualObjects(resolved[@"databaseId"], @"db");
}

- (void)testCollectionGet_sourceBranches {
  __block id resolved = @"unset";
  [RNFBFirestoreCollectionModuleHelper collectionGet:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
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
  XCTAssertEqual(FIRQuery.lastGetDocumentsSource, FIRFirestoreSourceCache);
  XCTAssertEqualObjects(resolved[@"source"], @"get");

  [RNFBFirestoreCollectionModuleHelper collectionGet:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
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
  XCTAssertEqual(FIRQuery.lastGetDocumentsSource, FIRFirestoreSourceDefault);

  [RNFBFirestoreCollectionModuleHelper collectionGet:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
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
  XCTAssertEqual(FIRQuery.lastGetDocumentsSource, FIRFirestoreSourceDefault);
}

- (void)testCollectionGet_error_rejects {
  FIRQuery.getDocumentsError =
      [NSError errorWithDomain:@"test"
                          code:2
                      userInfo:@{NSLocalizedDescriptionKey : @"get failed"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreCollectionModuleHelper collectionGet:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
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

- (void)testCollectionCount_successAndError {
  FIRAggregateQuerySnapshot *snapshot = [[FIRAggregateQuerySnapshot alloc] init];
  snapshot.count = @7;
  FIRAggregateQuery.aggregationSnapshot = snapshot;

  __block id resolved = @"unset";
  [RNFBFirestoreCollectionModuleHelper collectionCount:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
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
  XCTAssertEqualObjects(resolved[@"count"], @7);

  FIRAggregateQuery.aggregationSnapshot = nil;
  FIRAggregateQuery.aggregationError =
      [NSError errorWithDomain:@"test"
                          code:3
                      userInfo:@{NSLocalizedDescriptionKey : @"count failed"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreCollectionModuleHelper collectionCount:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
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

- (void)testAggregateQuery_countSumAvgAndInvalidType {
  FIRAggregateQuerySnapshot *snapshot = [[FIRAggregateQuerySnapshot alloc] init];
  snapshot.count = @3;
  snapshot.sumValue = @10;
  snapshot.averageValue = @2.5;
  FIRAggregateQuery.aggregationSnapshot = snapshot;

  __block id resolved = @"unset";
  [RNFBFirestoreCollectionModuleHelper aggregateQuery:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
      aggregateQueries:@[
        @{@"aggregateType" : @"count", @"field" : @"", @"key" : @"c"},
        @{@"aggregateType" : @"sum", @"field" : @"amount", @"key" : @"s"},
        @{@"aggregateType" : @"avg", @"field" : @"amount", @"key" : @"a"},
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
  XCTAssertEqualObjects(resolved[@"c"], @3);
  XCTAssertEqualObjects(resolved[@"s"], @10);
  XCTAssertEqualObjects(resolved[@"a"], @2.5);

  snapshot.averageValue = nil;
  FIRAggregateQuery.aggregationSnapshot = snapshot;
  [RNFBFirestoreCollectionModuleHelper aggregateQuery:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
      aggregateQueries:@[ @{@"aggregateType" : @"avg", @"field" : @"amount", @"key" : @"a"} ]
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqualObjects(resolved[@"a"], [NSNull null]);

  __block NSString *rejectMessage = nil;
  [RNFBFirestoreCollectionModuleHelper aggregateQuery:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
      aggregateQueries:@[ @{@"aggregateType" : @"nope", @"field" : @"x", @"key" : @"k"} ]
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];
  XCTAssertTrue([rejectMessage containsString:@"Invalid Aggregate Type"]);
}

- (void)testAggregateQuery_aggregationError_rejects {
  FIRAggregateQuery.aggregationError =
      [NSError errorWithDomain:@"test"
                          code:4
                      userInfo:@{NSLocalizedDescriptionKey : @"agg failed"}];
  __block NSString *rejectCode = nil;
  [RNFBFirestoreCollectionModuleHelper aggregateQuery:@"app"
      databaseId:@"(default)"
      path:@"col"
      type:@"collection"
      filters:@[]
      orders:@[]
      options:@{}
      aggregateQueries:@[ @{@"aggregateType" : @"count", @"field" : @"", @"key" : @"c"} ]
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

- (void)testPipelineExecute_successNativeErrorCodeMessageAndEmpty {
  RNFBFirestorePipelineCallHandler.completionResult = @{@"rows" : @[]};
  __block id resolved = @"unset";
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:@"app"
      databaseId:@"(default)"
      pipeline:@{@"stages" : @[]}
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
  XCTAssertEqualObjects(resolved[@"rows"], @[]);
  XCTAssertEqualObjects(RNFBFirestorePipelineCallHandler.lastPipeline[@"stages"], @[]);

  NSError *native = [NSError errorWithDomain:@"native"
                                        code:9
                                    userInfo:@{NSLocalizedDescriptionKey : @"n"}];
  RNFBFirestorePipelineCallHandler.completionResult = nil;
  RNFBFirestorePipelineCallHandler.completionError = @{@"nativeError" : native};
  __block NSString *rejectCode = nil;
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:@"app"
      databaseId:@"(default)"
      pipeline:@{}
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

  RNFBFirestorePipelineCallHandler.completionError =
      @{@"code" : @"firestore/invalid-argument", @"message" : @"bad pipeline"};
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:@"app"
      databaseId:@"(default)"
      pipeline:@{}
      options:@{}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        XCTAssertEqualObjects(message, @"bad pipeline");
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/invalid-argument");

  RNFBFirestorePipelineCallHandler.completionError = @{};
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:@"app"
      databaseId:@"(default)"
      pipeline:@{}
      options:@{}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        XCTAssertTrue([message containsString:@"Failed to execute pipeline"]);
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");

  RNFBFirestorePipelineCallHandler.completionError = nil;
  RNFBFirestorePipelineCallHandler.completionResult = nil;
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:@"app"
      databaseId:@"(default)"
      pipeline:@{}
      options:@{}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        XCTAssertTrue([message containsString:@"empty pipeline response"]);
      }];
  XCTAssertEqualObjects(rejectCode, @"firestore/unknown");
}

@end
