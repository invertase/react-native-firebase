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
}

- (void)tearDown {
  [[RNFBRCTEventEmitter shared] invalidate];
  [RNFBRCTEventEmitter shared].bridge = nil;
  self.module = nil;
  [FIRApp resetRegistryForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
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

@end
