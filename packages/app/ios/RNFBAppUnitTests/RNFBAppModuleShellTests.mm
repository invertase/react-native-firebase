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
#import "RNFBAppTurboModules.h"
#import "RNFBHandleMapStorage-Swift.inc"
#import "RNFBRCTEventEmitter.h"

/**
 * Exercises the shipped `RNFBAppModule.mm` TurboModule shell (compiled into this target
 * against the host TurboModule stubs). The shell only forwards to the C implementation
 * functions, so each test asserts the observable result of the forward.
 */
@interface RNFBAppModule (ShellTesting)
- (void)setBridge:(RCTBridge *)bridge;
- (RCTBridge *)bridge;
- (void)invalidate;
- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants>)constantsToExport;
- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants>)getConstants;
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params;
+ (BOOL)requiresMainQueueSetup;
+ (NSString *)moduleName;
- (void)initializeApp:(NSDictionary *)options
            appConfig:(NSDictionary *)appConfig
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;
- (void)setAutomaticDataCollectionEnabled:(NSString *)appName enabled:(BOOL)enabled;
- (void)deleteApp:(NSString *)appName
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;
- (void)eventsNotifyReady:(BOOL)ready;
- (void)eventsGetListeners:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)eventsPing:(NSString *)eventName
         eventBody:(NSDictionary *)eventBody
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;
- (void)eventsAddListener:(NSString *)eventName;
- (void)eventsRemoveListener:(NSString *)eventName all:(BOOL)all;
- (void)addListener:(NSString *)eventName;
- (void)removeListeners:(double)count;
- (void)metaGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)jsonGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)preferencesSetBool:(NSString *)key
                     value:(BOOL)value
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;
- (void)preferencesSetString:(NSString *)key
                       value:(NSString *)value
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject;
- (void)preferencesGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)preferencesClearAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
@end

@interface RNFBAppModuleShellTests : XCTestCase
@property(nonatomic, strong) RNFBAppModule *module;
@end

@implementation RNFBAppModuleShellTests

- (void)setUp {
  [super setUp];
  [FIRApp resetRegistryForTesting];
  [FIRConfiguration resetForTesting];
  [RNFBAppModuleFirebase resetRegisterLibraryOnceForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
  [[RNFBRCTEventEmitter shared] invalidate];
  [RNFBRCTEventEmitter shared].bridge = nil;
  self.module = [[RNFBAppModule alloc] init];
}

- (void)tearDown {
  self.module = nil;
  [[RNFBRCTEventEmitter shared] invalidate];
  [RNFBRCTEventEmitter shared].bridge = nil;
  [FIRApp resetRegistryForTesting];
  [FIRConfiguration resetForTesting];
  [RNFBAppModuleFirebase resetRegisterLibraryOnceForTesting];
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
  [super tearDown];
}

- (NSDictionary *)initializeOptionsWithAppID:(NSString *)appID {
  return @{
    @"appId" : appID,
    @"messagingSenderId" : @"sender-id",
    @"apiKey" : @"api-key",
    @"projectId" : @"project-id",
    @"authDomain" : @"auth.example.com",
  };
}

#pragma mark - Module setup

- (void)testInitRegistersLibraryOnce {
  XCTAssertEqualObjects([FIRApp lastRegisteredLibraryNameForTesting], @"react-native-firebase");
  XCTAssertEqualObjects([FIRApp lastRegisteredLibraryVersionForTesting], @"unit-test");
}

- (void)testExportedModuleNameAndMainQueueSetup {
  XCTAssertEqualObjects([RNFBAppModule moduleName], @"NativeRNFBTurboApp");
  XCTAssertFalse([RNFBAppModule requiresMainQueueSetup]);
}

- (void)testGetTurboModuleCreatesTheAppSpecModule {
  facebook::react::ObjCTurboModule::InitParams params;
  auto turboModule = [self.module getTurboModule:params];

  XCTAssertTrue(turboModule != nullptr);
  XCTAssertTrue(std::dynamic_pointer_cast<facebook::react::NativeRNFBTurboAppSpecJSI>(
                    turboModule) != nullptr);
}

- (void)testSetBridgeAndBridgeGetterUseTheSharedEmitter {
  RCTBridge *bridge = [[RCTBridge alloc] init];

  [self.module setBridge:bridge];

  XCTAssertEqual([RNFBRCTEventEmitter shared].bridge, bridge);
  XCTAssertEqual([self.module bridge], bridge);
}

- (void)testInvalidateClearsSharedEmitterListeners {
  RNFBRCTEventEmitter *emitter = [RNFBRCTEventEmitter shared];
  [emitter addListener:@"evt"];

  [self.module invalidate];

  XCTAssertEqualObjects([emitter getListenersDictionary][@"listeners"], @0);
}

- (void)testConstantsToExportAndGetConstantsListConfiguredApps {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  [FIRApp registerAppForTesting:[[FIRApp alloc] initWithName:@"secondary" options:options]];

  auto exported = [self.module constantsToExport];
  auto fetched = [self.module getConstants];

  for (NSDictionary *constants in @[ exported.dictionary, fetched.dictionary ]) {
    NSArray *apps = constants[@"NATIVE_FIREBASE_APPS"];
    XCTAssertEqual(apps.count, 1);
    XCTAssertEqualObjects(apps[0][@"appConfig"][@"name"], @"secondary");
    XCTAssertNotNil(constants[@"FIREBASE_RAW_JSON"]);
  }
}

#pragma mark - Firebase app methods

- (void)testInitializeAppConfiguresNamedAppAndResolves {
  __block NSDictionary *resolved = nil;

  [self.module initializeApp:[self initializeOptionsWithAppID:@"app-id"]
      appConfig:@{@"name" : @"secondary", @"automaticDataCollectionEnabled" : @YES}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];

  XCTAssertEqualObjects(resolved[@"appConfig"][@"name"], @"secondary");
  XCTAssertEqualObjects(resolved[@"appConfig"][@"automaticDataCollectionEnabled"], @YES);
  XCTAssertEqualObjects(resolved[@"options"][@"appId"], @"app-id");
  XCTAssertEqualObjects([RNFBAppModule getCustomDomain:@"secondary"], @"auth.example.com");
  XCTAssertNotNil([FIRApp appNamed:@"secondary"]);
}

- (void)testInitializeAppRejectsWhenFirebaseRaises {
  NSDictionary *options = [self initializeOptionsWithAppID:@"app-id"];
  NSDictionary *appConfig = @{@"name" : @"secondary"};
  [self.module initializeApp:options
      appConfig:appConfig
      resolve:^(id result) {
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"first initialize must not reject: %@", message);
      }];

  __block NSString *rejectedCode = nil;
  __block NSString *rejectedMessage = nil;
  __block BOOL resolved = NO;
  [self.module initializeApp:options
      appConfig:appConfig
      resolve:^(id result) {
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        rejectedCode = code;
        rejectedMessage = message;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectedCode, NSInternalInconsistencyException);
  XCTAssertTrue([rejectedMessage containsString:@"already been configured"], @"%@",
                rejectedMessage);
}

- (void)testSetAutomaticDataCollectionEnabledForwardsToTheNamedApp {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:options];
  [FIRApp registerAppForTesting:app];

  [self.module setAutomaticDataCollectionEnabled:@"secondary" enabled:YES];

  XCTAssertTrue(app.isDataCollectionDefaultEnabled);
}

- (void)testDeleteAppForwardsAndResolvesNull {
  FIROptions *options = [[FIROptions alloc] initWithGoogleAppID:@"app-id" GCMSenderID:@"sender"];
  [FIRApp registerAppForTesting:[[FIRApp alloc] initWithName:@"secondary" options:options]];
  __block id resolved = @"unset";

  [self.module deleteApp:@"secondary"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertNil([FIRApp appNamed:@"secondary"]);
}

- (void)testSetLogLevelForwardsToTheMapper {
  [self.module setLogLevel:@"warn"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelWarning);
}

#pragma mark - Event methods

- (void)testEventsForwardToTheSharedEmitter {
  RNFBRCTEventEmitter *emitter = [RNFBRCTEventEmitter shared];

  [self.module eventsAddListener:@"evt"];
  [self.module eventsAddListener:@"evt"];
  XCTAssertEqualObjects([emitter getListenersDictionary][@"listeners"], @2);

  [self.module eventsRemoveListener:@"evt" all:NO];
  XCTAssertEqualObjects([emitter getListenersDictionary][@"listeners"], @1);
  [self.module eventsRemoveListener:@"evt" all:YES];
  XCTAssertEqualObjects([emitter getListenersDictionary][@"listeners"], @0);

  __block NSDictionary *listeners = nil;
  [self.module
      eventsGetListeners:^(id result) {
        listeners = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];
  XCTAssertEqualObjects(listeners[@"listeners"], @0);

  __block id pinged = nil;
  [self.module eventsPing:@"evt"
      eventBody:@{@"a" : @1}
      resolve:^(id result) {
        pinged = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];
  XCTAssertEqualObjects(pinged, @{@"a" : @1});
  XCTAssertEqualObjects([emitter getListenersDictionary][@"queued"], @1);

  [self.module eventsNotifyReady:YES];
  XCTAssertEqualObjects([emitter getListenersDictionary][@"queued"], @0);
}

- (void)testBuiltInEmitterCallsAreNoOps {
  [self.module addListener:@"evt"];
  [self.module removeListeners:1];

  XCTAssertEqualObjects([[RNFBRCTEventEmitter shared] getListenersDictionary][@"listeners"], @0);
}

#pragma mark - Meta, JSON and preferences

- (void)testMetaAndJSONGetAllResolveDictionaries {
  __block id meta = nil;
  __block id json = nil;

  [self.module
      metaGetAll:^(id result) {
        meta = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];
  [self.module
      jsonGetAll:^(id result) {
        json = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];

  XCTAssertTrue([meta isKindOfClass:[NSDictionary class]]);
  XCTAssertTrue([json isKindOfClass:[NSDictionary class]]);
}

- (void)testPreferencesRoundTripThroughTheShell {
  RCTPromiseRejectBlock failOnReject = ^(NSString *code, NSString *message, NSError *error) {
    XCTFail(@"unexpected reject %@", message);
  };
  __block id setBoolResult = nil;
  __block id setStringResult = nil;
  __block NSDictionary *all = nil;
  __block id clearResult = nil;
  __block NSDictionary *afterClear = nil;

  [self.module preferencesSetBool:@"shell_bool"
                            value:YES
                          resolve:^(id result) {
                            setBoolResult = result;
                          }
                           reject:failOnReject];
  [self.module preferencesSetString:@"shell_string"
                              value:@"shell-value"
                            resolve:^(id result) {
                              setStringResult = result;
                            }
                             reject:failOnReject];
  [self.module
      preferencesGetAll:^(id result) {
        all = result;
      }
                 reject:failOnReject];
  [self.module
      preferencesClearAll:^(id result) {
        clearResult = result;
      }
                   reject:failOnReject];
  [self.module
      preferencesGetAll:^(id result) {
        afterClear = result;
      }
                 reject:failOnReject];

  XCTAssertEqualObjects(setBoolResult, [NSNull null]);
  XCTAssertEqualObjects(setStringResult, [NSNull null]);
  XCTAssertEqualObjects(all[@"shell_bool"], @YES);
  XCTAssertEqualObjects(all[@"shell_string"], @"shell-value");
  XCTAssertEqualObjects(clearResult, [NSNull null]);
  XCTAssertNil(afterClear[@"shell_bool"]);
  XCTAssertNil(afterClear[@"shell_string"]);
}

@end
