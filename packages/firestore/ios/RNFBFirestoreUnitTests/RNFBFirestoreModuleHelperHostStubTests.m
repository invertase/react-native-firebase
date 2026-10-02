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
#import "RNFBApp/RNFBPreferences.h"
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBFirestoreModuleHelper.h"

@interface RNFBFirestoreModuleHelperHostStubTests : XCTestCase
@end

@implementation RNFBFirestoreModuleHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBPreferences resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [RNFBFirestoreModuleHelper invalidate];
  FIRFirestore.testInstance = [[FIRFirestore alloc] init];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFirestoreModuleHelper invalidate];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBPreferences resetTestState];
  [RNFBRCTEventEmitter resetTestState];
  [super tearDown];
}

- (void)testSetLogLevel_debugUsesFIRLoggerLevelDebug {
  [RNFBFirestoreModuleHelper setLogLevel:@"debug"];
  XCTAssertEqual(FIRConfiguration.lastLoggerLevel, FIRLoggerLevelDebug);
}

- (void)testSetLogLevel_otherUsesFIRLoggerLevelMin {
  [RNFBFirestoreModuleHelper setLogLevel:@"silent"];
  XCTAssertEqual(FIRConfiguration.lastLoggerLevel, FIRLoggerLevelMin);
}

- (void)testPersistenceCacheIndexManager_nilManager_rejects {
  FIRFirestore *firestore = [[FIRFirestore alloc] init];
  firestore.persistentCacheIndexManager = nil;
  FIRFirestore.testInstance = firestore;

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBFirestoreModuleHelper persistenceCacheIndexManager:@"app"
      databaseId:@"(default)"
      requestType:0
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
  XCTAssertEqualObjects(rejectCode, @"firestore/index-manager-null");
  XCTAssertTrue([rejectMessage containsString:@"PersistentCacheIndexManager"]);
}

- (void)testPersistenceCacheIndexManager_enableIndexAutoCreation {
  FIRFirestore *firestore = [[FIRFirestore alloc] init];
  firestore.persistentCacheIndexManager = [[FIRPersistentCacheIndexManager alloc] init];
  FIRFirestore.testInstance = firestore;

  __block id resolved = @"unset";
  [RNFBFirestoreModuleHelper persistenceCacheIndexManager:@"app"
      databaseId:@"(default)"
      requestType:0
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
  XCTAssertEqual(FIRPersistentCacheIndexManager.lastRequestType, 0);
}

- (void)testSettings_writesPreferenceKeys {
  __block id resolved = @"unset";
  [RNFBFirestoreModuleHelper settings:@"my-app"
      databaseId:@"db1"
      settings:@{
        @"cacheSizeBytes" : @1048576,
        @"host" : @"localhost",
        @"persistence" : @YES,
        @"ssl" : @NO,
        @"serverTimestampBehavior" : @"estimate",
      }
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
  NSDictionary *store = [RNFBPreferences shared].store;
  XCTAssertEqualObjects(store[@"firebase_firestore_cache_size_my-app-db1"], @1048576);
  XCTAssertEqualObjects(store[@"firebase_firestore_host_my-app-db1"], @"localhost");
  XCTAssertEqualObjects(store[@"firebase_firestore_persistence_my-app-db1"], @YES);
  XCTAssertEqualObjects(store[@"firebase_firestore_ssl_my-app-db1"], @NO);
  XCTAssertEqualObjects(store[@"firebase_firestore_server_timestamp_behavior_my-app-db1"],
                        @"estimate");
}

- (void)testNetworkPersistenceTerminateAndLoadBundle_resolve {
  __block NSInteger resolves = 0;
  RCTPromiseResolveBlock resolve = ^(id result) {
    (void)result;
    resolves += 1;
  };
  RCTPromiseRejectBlock reject = ^(NSString *code, NSString *message, NSError *error) {
    (void)code;
    (void)message;
    (void)error;
    XCTFail(@"unexpected reject");
  };

  [RNFBFirestoreModuleHelper disableNetwork:@"app"
                                 databaseId:@"(default)"
                                    resolve:resolve
                                     reject:reject];
  [RNFBFirestoreModuleHelper enableNetwork:@"app"
                                databaseId:@"(default)"
                                   resolve:resolve
                                    reject:reject];
  [RNFBFirestoreModuleHelper clearPersistence:@"app"
                                   databaseId:@"(default)"
                                      resolve:resolve
                                       reject:reject];
  [RNFBFirestoreModuleHelper waitForPendingWrites:@"app"
                                       databaseId:@"(default)"
                                          resolve:resolve
                                           reject:reject];
  [RNFBFirestoreModuleHelper terminate:@"app"
                            databaseId:@"(default)"
                               resolve:resolve
                                reject:reject];
  [RNFBFirestoreModuleHelper loadBundle:@"app"
                             databaseId:@"(default)"
                                 bundle:@"{}"
                                resolve:^(id result) {
                                  XCTAssertEqualObjects(result[@"taskState"], @"Success");
                                  resolves += 1;
                                }
                                 reject:reject];
  XCTAssertEqual(resolves, 6);
}

- (void)testUseEmulator_setsHostPortAndDisablesSslOnce {
  [RNFBFirestoreModuleHelper useEmulator:@"app" databaseId:@"db1" host:@"127.0.0.1" port:8080];
  XCTAssertEqualObjects(FIRFirestore.lastEmulatorHost, @"127.0.0.1");
  XCTAssertEqual(FIRFirestore.lastEmulatorPort, 8080);
  XCTAssertFalse(FIRFirestore.testInstance.settings.sslEnabled);

  FIRFirestore.lastEmulatorHost = nil;
  [RNFBFirestoreModuleHelper useEmulator:@"app" databaseId:@"db1" host:@"10.0.0.1" port:9090];
  XCTAssertNil(FIRFirestore.lastEmulatorHost);
}

- (void)testPersistenceCacheIndexManager_disableAndDelete {
  FIRFirestore *firestore = [[FIRFirestore alloc] init];
  firestore.persistentCacheIndexManager = [[FIRPersistentCacheIndexManager alloc] init];
  FIRFirestore.testInstance = firestore;

  __block id resolved = @"unset";
  [RNFBFirestoreModuleHelper persistenceCacheIndexManager:@"app"
      databaseId:@"(default)"
      requestType:1
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
  XCTAssertEqual(FIRPersistentCacheIndexManager.lastRequestType, 1);

  [RNFBFirestoreModuleHelper persistenceCacheIndexManager:@"app"
      databaseId:@"(default)"
      requestType:2
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqual(FIRPersistentCacheIndexManager.lastRequestType, 2);
}

- (void)testSnapshotsInSync_addRemoveAndDuplicate {
  [RNFBFirestoreModuleHelper addSnapshotsInSync:@"app" databaseId:@"(default)" listenerId:9];
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventName, @"firestore_snapshots_in_sync_event");
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventBody[@"listenerId"], @9);

  RNFBRCTEventEmitter.lastEventName = nil;
  [RNFBFirestoreModuleHelper addSnapshotsInSync:@"app" databaseId:@"(default)" listenerId:9];
  XCTAssertNil(RNFBRCTEventEmitter.lastEventName);

  [RNFBFirestoreModuleHelper removeSnapshotsInSync:@"app" databaseId:@"(default)" listenerId:9];
  [RNFBFirestoreModuleHelper addSnapshotsInSync:@"app" databaseId:@"(default)" listenerId:9];
  XCTAssertEqualObjects(RNFBRCTEventEmitter.lastEventName, @"firestore_snapshots_in_sync_event");
}

- (void)testSetLogLevel_errorUsesFIRLoggerLevelDebug {
  [RNFBFirestoreModuleHelper setLogLevel:@"error"];
  XCTAssertEqual(FIRConfiguration.lastLoggerLevel, FIRLoggerLevelDebug);
}

- (void)testNetworkPersistenceTerminateAndLoadBundle_rejectOnError {
  FIRFirestore.operationError = [NSError errorWithDomain:@"test"
                                                    code:1
                                                userInfo:@{NSLocalizedDescriptionKey : @"op"}];
  __block NSInteger rejects = 0;
  RCTPromiseResolveBlock resolve = ^(id result) {
    (void)result;
    XCTFail(@"unexpected resolve");
  };
  RCTPromiseRejectBlock reject = ^(NSString *code, NSString *message, NSError *error) {
    (void)code;
    (void)message;
    (void)error;
    rejects += 1;
  };

  [RNFBFirestoreModuleHelper disableNetwork:@"app"
                                 databaseId:@"(default)"
                                    resolve:resolve
                                     reject:reject];
  [RNFBFirestoreModuleHelper enableNetwork:@"app"
                                databaseId:@"(default)"
                                   resolve:resolve
                                    reject:reject];
  [RNFBFirestoreModuleHelper clearPersistence:@"app"
                                   databaseId:@"(default)"
                                      resolve:resolve
                                       reject:reject];
  [RNFBFirestoreModuleHelper waitForPendingWrites:@"app"
                                       databaseId:@"(default)"
                                          resolve:resolve
                                           reject:reject];
  [RNFBFirestoreModuleHelper terminate:@"app"
                            databaseId:@"(default)"
                               resolve:resolve
                                reject:reject];
  XCTAssertEqual(rejects, 5);

  FIRFirestore.operationError = nil;
  FIRFirestore.loadBundleError = [NSError errorWithDomain:@"test"
                                                     code:2
                                                 userInfo:@{NSLocalizedDescriptionKey : @"bundle"}];
  [RNFBFirestoreModuleHelper loadBundle:@"app"
                             databaseId:@"(default)"
                                 bundle:@"{}"
                                resolve:resolve
                                 reject:reject];
  XCTAssertEqual(rejects, 6);
}

- (void)testLoadBundle_mapsErrorAndInProgressTaskStates {
  FIRFirestore.loadBundleState = FIRLoadBundleTaskStateError;
  __block id resolved = @"unset";
  [RNFBFirestoreModuleHelper loadBundle:@"app"
      databaseId:@"(default)"
      bundle:@"{}"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqualObjects(resolved[@"taskState"], @"Error");

  FIRFirestore.loadBundleState = FIRLoadBundleTaskStateInProgress;
  [RNFBFirestoreModuleHelper loadBundle:@"app"
      databaseId:@"(default)"
      bundle:@"{}"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  XCTAssertEqualObjects(resolved[@"taskState"], @"Running");
}

- (void)testTerminate_clearsEmulatorConfigAfterSuccess {
  [RNFBFirestoreModuleHelper useEmulator:@"app"
                              databaseId:@"(default)"
                                    host:@"127.0.0.1"
                                    port:8080];
  __block id resolved = @"unset";
  [RNFBFirestoreModuleHelper terminate:@"app"
      databaseId:@"(default)"
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

  FIRFirestore.lastEmulatorHost = nil;
  [RNFBFirestoreModuleHelper useEmulator:@"app" databaseId:@"(default)" host:@"10.0.0.2" port:9099];
  XCTAssertEqualObjects(FIRFirestore.lastEmulatorHost, @"10.0.0.2");
  XCTAssertEqual(FIRFirestore.lastEmulatorPort, 9099);
}

@end
