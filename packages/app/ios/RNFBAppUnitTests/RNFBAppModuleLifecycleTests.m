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

#import <React/RCTBridge.h>
#import "FirebaseCore/FirebaseCore.h"
#import "RNFBAppModule.h"
#import "RNFBAppModuleImplementation.h"
#import "RNFBHandleMapStorage-Swift.inc"
#import "RNFBJSON.h"
#import "RNFBRCTEventEmitter.h"

@interface RNFBAppModuleLifecycleTests : XCTestCase
@property(nonatomic, strong) RNFBAppModule *module;
@end

@implementation RNFBAppModuleLifecycleTests

- (void)setUp {
  [super setUp];
  self.module = [[RNFBAppModule alloc] init];
  [[RNFBRCTEventEmitter shared] invalidate];
  [RNFBRCTEventEmitter shared].bridge = nil;
  [FIRApp resetRegistryForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
  [FIRConfiguration resetForTesting];
}

- (void)tearDown {
  [[RNFBRCTEventEmitter shared] invalidate];
  [RNFBRCTEventEmitter shared].bridge = nil;
  self.module = nil;
  [FIRApp resetRegistryForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
  [FIRConfiguration resetForTesting];
  [super tearDown];
}

- (void)testSetBridgePathOnSharedEmitter {
  RCTBridge *bridge = [[RCTBridge alloc] init];
  RNFBAppModuleSetBridge(bridge);
  XCTAssertEqual([RNFBRCTEventEmitter shared].bridge, bridge);
}

- (void)testBridgeGetterReturnsSharedEmitterBridge {
  RCTBridge *bridge = [[RCTBridge alloc] init];
  [RNFBRCTEventEmitter shared].bridge = bridge;
  XCTAssertEqual(RNFBAppModuleBridge(), bridge);
}

- (void)testInvalidateForwardsToSharedEmitter {
  RNFBRCTEventEmitter *emitter = [RNFBRCTEventEmitter shared];
  [emitter sendEventWithName:@"evt" body:@{@"a" : @1}];
  [emitter addListener:@"evt"];
  [emitter notifyJsReady:YES];

  RNFBAppModuleInvalidate();

  NSDictionary *dict = [emitter getListenersDictionary];
  XCTAssertEqualObjects(dict[@"listeners"], @0);
  XCTAssertEqualObjects(dict[@"queued"], @0);
}

- (void)testCompleteInitializeAppSetsDomainDataCollectionAndResolves {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  __block NSDictionary *resolved = nil;
  RNFBAppModuleCompleteInitializeApp(app, @"auth.example.com", @"secondary",
                                     @{@"automaticDataCollectionEnabled" : @YES}, ^(id result) {
                                       resolved = result;
                                     });

  XCTAssertEqualObjects([RNFBAppCustomAuthDomains getCustomDomain:@"secondary"],
                        @"auth.example.com");
  XCTAssertTrue(app.isDataCollectionDefaultEnabled);
  XCTAssertEqualObjects(resolved[@"appConfig"][@"name"], @"secondary");
  XCTAssertEqualObjects(resolved[@"options"][@"authDomain"], @"auth.example.com");
}

- (FIRApp *)registeredAppNamed:(NSString *)name dataCollection:(BOOL)enabled {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:name options:options];
  app.dataCollectionDefaultEnabled = enabled;
  [FIRApp registerAppForTesting:app];
  return app;
}

- (void)testCompleteInitializeAppReadsTheBooleanValueNotThePointer {
  FIRApp *app = [self registeredAppNamed:@"secondary" dataCollection:YES];

  RNFBAppModuleCompleteInitializeApp(app, nil, @"secondary",
                                     @{@"automaticDataCollectionEnabled" : @NO},
                                     ^(id result){
                                     });

  XCTAssertFalse(app.isDataCollectionDefaultEnabled);
}

- (void)testCompleteInitializeAppTreatsMissingOrNonNumericValueAsDisabled {
  FIRApp *missing = [self registeredAppNamed:@"missing" dataCollection:YES];
  FIRApp *null = [self registeredAppNamed:@"null" dataCollection:YES];

  RNFBAppModuleCompleteInitializeApp(missing, nil, @"missing", @{},
                                     ^(id result){
                                     });
  RNFBAppModuleCompleteInitializeApp(null, nil, @"null",
                                     @{@"automaticDataCollectionEnabled" : [NSNull null]},
                                     ^(id result){
                                     });

  XCTAssertFalse(missing.isDataCollectionDefaultEnabled);
  XCTAssertFalse(null.isDataCollectionDefaultEnabled);
}

- (void)testCompleteInitializeAppMapsNumericBooleansByTheirValue {
  FIRApp *one = [self registeredAppNamed:@"one" dataCollection:NO];
  FIRApp *zero = [self registeredAppNamed:@"zero" dataCollection:YES];

  RNFBAppModuleCompleteInitializeApp(one, nil, @"one", @{@"automaticDataCollectionEnabled" : @1},
                                     ^(id result){
                                     });
  RNFBAppModuleCompleteInitializeApp(zero, nil, @"zero", @{@"automaticDataCollectionEnabled" : @0},
                                     ^(id result){
                                     });

  XCTAssertTrue(one.isDataCollectionDefaultEnabled);
  XCTAssertFalse(zero.isDataCollectionDefaultEnabled);
}

- (void)testCompleteInitializeAppWithNilConfigDisablesDataCollection {
  FIRApp *app = [self registeredAppNamed:@"nilconfig" dataCollection:YES];

  RNFBAppModuleCompleteInitializeApp(app, nil, @"nilconfig", nil,
                                     ^(id result){
                                     });

  XCTAssertFalse(app.isDataCollectionDefaultEnabled);
}

- (void)testInitializeAppliesTheConfiguredAppLogLevel {
  [self withJSONObject:@{@"app_log_level" : @"debug"}
               perform:^{
                 RNFBAppModuleInitialize();
               }];

  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelDebug);
}

- (void)testInitializeLeavesTheLogLevelAloneWithoutAConfiguredAppLogLevel {
  [[FIRConfiguration sharedInstance] setLoggerLevel:FIRLoggerLevelNotice];

  [self withJSONObject:@{@"other_key" : @"debug"}
               perform:^{
                 RNFBAppModuleInitialize();
               }];

  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelNotice);
}

/** Swaps the shared firebase.json for the duration of `block`, like the shared-utils tests. */
- (void)withJSONObject:(NSDictionary *)object perform:(void (^)(void))block {
  RNFBJSON *shared = [RNFBJSON shared];
  id previous = [shared valueForKey:@"implementation"];
  [shared setValue:[[RNFBJSONImplementation alloc] initWithJSONObject:object]
            forKey:@"implementation"];
  @try {
    block();
  } @finally {
    [shared setValue:previous forKey:@"implementation"];
  }
}

- (void)testCompleteInitializeAppWithoutAnAppStillStoresDomainAndResolvesEmptySections {
  __block NSDictionary *resolved = nil;

  RNFBAppModuleCompleteInitializeApp(nil, @"auth.example.com", @"secondary",
                                     @{@"automaticDataCollectionEnabled" : @YES}, ^(id result) {
                                       resolved = result;
                                     });

  XCTAssertEqualObjects([RNFBAppCustomAuthDomains getCustomDomain:@"secondary"],
                        @"auth.example.com");
  XCTAssertEqualObjects(resolved, (@{
                          @"options" : @{},
                          @"appConfig" : @{@"automaticDataCollectionEnabled" : @NO},
                        }));
}

@end
