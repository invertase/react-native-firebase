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

#import "FirebaseCore/FirebaseCore.h"
#import "RNFBHandleMapStorage-Swift.inc"

@interface RNFBAppModuleFirebaseFacadeTests : XCTestCase
@end

@implementation RNFBAppModuleFirebaseFacadeTests

- (void)tearDown {
  [FIRApp resetRegistryForTesting];
  [FIRConfiguration resetForTesting];
  [RNFBAppModuleFirebase resetRegisterLibraryOnceForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
  [super tearDown];
}

- (void)testFacadeOptionsFactoryCreatesFIROptions {
  id<RNFBFIROptionsCreating> factory = [RNFBAppModuleFirebase optionsFactory];
  id options = [factory createWithGoogleAppID:@"app-id" gcmSenderID:@"sender-id"];
  XCTAssertTrue([options isKindOfClass:NSClassFromString(@"RNFBFIROptionsConfiguringAdapter")]);
  FIROptions *firOptions = [options valueForKey:@"options"];

  XCTAssertEqualObjects(firOptions.googleAppID, @"app-id");
  XCTAssertEqualObjects(firOptions.GCMSenderID, @"sender-id");
}

- (void)testFacadeOptionsFactoryForwardsNilGoogleAppIDAndSenderID {
  id<RNFBFIROptionsCreating> factory = [RNFBAppModuleFirebase optionsFactory];
  id options = [factory createWithGoogleAppID:nil gcmSenderID:nil];
  XCTAssertTrue([options isKindOfClass:NSClassFromString(@"RNFBFIROptionsConfiguringAdapter")]);
  FIROptions *firOptions = [options valueForKey:@"options"];

  XCTAssertNil(firOptions.googleAppID);
  XCTAssertNil(firOptions.GCMSenderID);
}

- (void)testFacadeAllAppsIncludesConfiguredDefaultAndNamed {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  [FIRApp configureWithOptions:options];
  [FIRApp configureWithName:@"secondary" options:options];

  NSArray *apps = [RNFBAppModuleFirebase allApps];
  XCTAssertEqual(apps.count, 2);
}

- (void)testFacadeConfigureOrReuseDefaultReusesExisting {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  [FIRApp configureWithOptions:options];
  FIRApp *existing = [FIRApp defaultApp];

  RNFBAppInitializeNameResolution *names =
      [[RNFBAppInitializeNameResolution alloc] initWithAppName:@"[DEFAULT]"
                                                     jsAppName:@"[DEFAULT]"
                                                  isDefaultApp:YES];
  id result = [RNFBAppModuleFirebase configureOrReuseAppWithOptions:(id)options
                                                     nameResolution:names];

  XCTAssertEqual(result, existing);
}

- (void)testFacadeConfigureOrReuseDefaultConfiguresWhenMissing {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  RNFBAppInitializeNameResolution *names =
      [[RNFBAppInitializeNameResolution alloc] initWithAppName:nil
                                                     jsAppName:@"[DEFAULT]"
                                                  isDefaultApp:YES];

  id result = [RNFBAppModuleFirebase configureOrReuseAppWithOptions:(id)options
                                                     nameResolution:names];

  XCTAssertEqual(result, [FIRApp defaultApp]);
  XCTAssertEqualObjects(((FIRApp *)result).options.googleAppID, @"app-id");
}

- (void)testFacadeConfigureOrReuseNamed {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  RNFBAppInitializeNameResolution *names =
      [[RNFBAppInitializeNameResolution alloc] initWithAppName:@"secondary"
                                                     jsAppName:@"secondary"
                                                  isDefaultApp:NO];

  id result = [RNFBAppModuleFirebase configureOrReuseAppWithOptions:(id)options
                                                     nameResolution:names];

  XCTAssertEqual(result, [FIRApp appNamed:@"secondary"]);
}

- (void)testFacadeRegisterLibraryOnceRecordsNameAndVersion {
  [RNFBAppModuleFirebase registerLibraryOnceWithName:@"react-native-firebase" version:@"9.9.9"];
  [RNFBAppModuleFirebase registerLibraryOnceWithName:@"react-native-firebase" version:@"ignored"];

  XCTAssertEqualObjects([FIRApp lastRegisteredLibraryNameForTesting], @"react-native-firebase");
  XCTAssertEqualObjects([FIRApp lastRegisteredLibraryVersionForTesting], @"9.9.9");
}

- (void)testFacadeSetLoggerLevelAppliesDebug {
  [RNFBAppModuleFirebase setLoggerLevel:FIRLoggerLevelDebug];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelDebug);
}

- (void)testFacadeSetLoggerLevelPassesThroughUnknownRawValue {
  [RNFBAppModuleFirebase setLoggerLevel:99];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, (FIRLoggerLevel)99);
}

- (void)testFacadeSetAutomaticDataCollectionEnabled {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  [RNFBAppModuleFirebase setAutomaticDataCollectionEnabled:YES forAppName:@"secondary"];
  XCTAssertTrue(app.isDataCollectionDefaultEnabled);
}

- (void)testFacadeSetAutomaticDataCollectionEnabledMissingAppReturnsEarly {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  [RNFBAppModuleFirebase setAutomaticDataCollectionEnabled:YES forAppName:@"missing"];
  XCTAssertFalse(app.isDataCollectionDefaultEnabled);
}

- (void)testFacadeSetDataCollectionDefaultEnabled {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];

  [RNFBAppModuleFirebase setDataCollectionDefaultEnabled:YES forApp:app];
  XCTAssertTrue(app.isDataCollectionDefaultEnabled);
}

- (void)testFacadeSetDataCollectionDefaultEnabledNonFirebaseAppReturnsEarly {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  [RNFBAppModuleFirebase setDataCollectionDefaultEnabled:YES forApp:[NSObject new]];
  XCTAssertFalse(app.isDataCollectionDefaultEnabled);
}

- (void)testFacadeDeleteAppRemovesFromRegistry {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  XCTestExpectation *expectation = [self expectationWithDescription:@"delete"];
  [RNFBAppModuleFirebase deleteApp:app
                        completion:^(BOOL success) {
                          XCTAssertTrue(success);
                          [expectation fulfill];
                        }];
  [self waitForExpectationsWithTimeout:1 handler:nil];
  XCTAssertNil([FIRApp appNamed:@"secondary"]);
}

- (void)testFacadeDeleteAppNamedMissingResolvesNull {
  XCTestExpectation *expectation = [self expectationWithDescription:@"missing"];
  [RNFBAppModuleFirebase deleteAppNamed:@"does-not-exist"
      resolve:^(id result) {
        XCTAssertEqual(result, [NSNull null]);
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"should resolve");
      }];
  [self waitForExpectationsWithTimeout:1 handler:nil];
}

- (void)testFacadeDeleteAppNamedSuccessClearsDomain {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];
  [RNFBAppCustomAuthDomains setCustomDomain:@"auth.example.com" forAppName:@"secondary"];

  XCTestExpectation *expectation = [self expectationWithDescription:@"delete-named"];
  [RNFBAppModuleFirebase deleteAppNamed:@"secondary"
      resolve:^(id result) {
        XCTAssertEqual(result, [NSNull null]);
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"should resolve");
      }];
  [self waitForExpectationsWithTimeout:1 handler:nil];
  XCTAssertNil([FIRApp appNamed:@"secondary"]);
  XCTAssertNil([RNFBAppCustomAuthDomains getCustomDomain:@"secondary"]);
}

- (void)testFacadeAppForNameUsesDefaultDisplayName {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  [FIRApp configureWithOptions:options];

  id result = [RNFBAppModuleFirebase appForName:@"[DEFAULT]"];
  XCTAssertEqual(result, [FIRApp defaultApp]);
}

@end
