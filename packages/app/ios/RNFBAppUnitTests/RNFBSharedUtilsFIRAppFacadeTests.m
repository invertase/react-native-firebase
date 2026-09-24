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

#import "RNFBAppModule.h"
#import "RNFBHandleMapStorage-Swift.inc"
#import "RNFBRCTEventEmitter.h"
#import "RNFBSharedUtils.h"

@interface RNFBAppModule (Testing)
+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName;
+ (void)resetCustomDomainsForTesting;
@end

@interface RNFBSharedUtilsFIRAppFacadeTests : XCTestCase
@end

@implementation RNFBSharedUtilsFIRAppFacadeTests

- (FIROptions *)fullyPopulatedOptions {
  FIROptions *options = [[FIROptions alloc] init];
  options.APIKey = @"api-key";
  options.googleAppID = @"app-id";
  options.projectID = @"project-id";
  options.databaseURL = @"https://example.firebaseio.com";
  options.storageBucket = @"example.appspot.com";
  options.GCMSenderID = @"sender-id";
  options.clientID = @"client-id";
  return options;
}

- (void)tearDown {
  [RNFBAppModule resetCustomDomainsForTesting];
  RNFBRCTEventEmitter *emitter = [RNFBRCTEventEmitter shared];
  // Rebuild a core whose bridge/emit closures capture *shared*, not a disposable
  // template (stealing template.core leaves dangling weakSelf → permanent queue-only).
  __weak RNFBRCTEventEmitter *weakEmitter = emitter;
  RNFBRCTEventEmitterCore *restoredCore = [[RNFBRCTEventEmitterCore alloc]
      initWithIsBridgePresent:^BOOL {
        return weakEmitter.bridge != nil;
      }
      emitHandler:^(NSString *eventName, id body) {
        __strong RNFBRCTEventEmitter *strongEmitter = weakEmitter;
        NSString *prefixedEventName = [@"rnfb_" stringByAppendingString:eventName];
        [strongEmitter.bridge
            enqueueJSCall:@"RCTDeviceEventEmitter"
                   method:@"emit"
                     args:body ? @[ prefixedEventName, body ] : @[ prefixedEventName ]
               completion:NULL];
      }];
  [emitter setValue:restoredCore forKey:@"core"];
  [emitter invalidate];
  emitter.bridge = nil;
  [super tearDown];
}

- (void)testFacadeDefaultNameMappingAndOptions {
  FIRApp *app = [[FIRApp alloc] initWithName:DEFAULT_APP_NAME options:[self fullyPopulatedOptions]];
  [app setDataCollectionDefaultEnabled:YES];

  NSDictionary *result = [RNFBSharedUtils firAppToDictionary:app];
  NSDictionary *appConfig = result[@"appConfig"];
  NSDictionary *options = result[@"options"];

  XCTAssertEqualObjects(appConfig[@"name"], DEFAULT_APP_DISPLAY_NAME);
  XCTAssertEqualObjects(appConfig[@"automaticDataCollectionEnabled"], @YES);
  XCTAssertEqualObjects(options[@"apiKey"], @"api-key");
  XCTAssertEqualObjects(options[@"appId"], @"app-id");
  XCTAssertEqualObjects(options[@"projectId"], @"project-id");
  XCTAssertEqualObjects(options[@"databaseURL"], @"https://example.firebaseio.com");
  XCTAssertEqualObjects(options[@"storageBucket"], @"example.appspot.com");
  XCTAssertEqualObjects(options[@"messagingSenderId"], @"sender-id");
  XCTAssertEqualObjects(options[@"clientId"], @"client-id");
  XCTAssertNil(options[@"authDomain"]);
}

- (void)testFacadeAuthDomainPresentAndAbsent {
  FIRApp *app = [[FIRApp alloc] initWithName:@"secondary" options:[self fullyPopulatedOptions]];

  NSDictionary *withoutDomain = [RNFBSharedUtils firAppToDictionary:app];
  XCTAssertNil(withoutDomain[@"options"][@"authDomain"]);

  [RNFBAppModule setCustomDomainForTesting:@"custom.example.com" forAppName:@"secondary"];
  NSDictionary *withDomain = [RNFBSharedUtils firAppToDictionary:app];
  XCTAssertEqualObjects(withDomain[@"options"][@"authDomain"], @"custom.example.com");
}

- (void)testFacadeAuthDomainUsesMappedDefaultName {
  FIRApp *app = [[FIRApp alloc] initWithName:DEFAULT_APP_NAME options:[self fullyPopulatedOptions]];
  [RNFBAppModule setCustomDomainForTesting:@"default-domain.example.com"
                                forAppName:DEFAULT_APP_DISPLAY_NAME];

  NSDictionary *result = [RNFBSharedUtils firAppToDictionary:app];
  XCTAssertEqualObjects(result[@"options"][@"authDomain"], @"default-domain.example.com");
}

- (void)testFacadeSendJSEventInjectsAppNameAndForwards {
  FIRApp *app = [[FIRApp alloc] initWithName:DEFAULT_APP_NAME options:[self fullyPopulatedOptions]];
  RNFBRCTEventEmitter *emitter = [RNFBRCTEventEmitter shared];
  [emitter invalidate];

  __block NSString *capturedName = nil;
  __block NSDictionary *capturedBody = nil;
  RNFBRCTEventEmitterCore *recordingCore = [[RNFBRCTEventEmitterCore alloc]
      initWithIsBridgePresent:^BOOL {
        return YES;
      }
      emitHandler:^(NSString *eventName, id body) {
        capturedName = [eventName copy];
        capturedBody = body;
      }];
  [emitter setValue:recordingCore forKey:@"core"];
  [emitter notifyJsReady:YES];
  [emitter addListener:@"facade_event"];

  [RNFBSharedUtils sendJSEventForApp:app name:@"facade_event" body:@{@"foo" : @"bar"}];

  XCTAssertEqualObjects(capturedName, @"facade_event");
  XCTAssertEqualObjects(capturedBody[@"foo"], @"bar");
  XCTAssertEqualObjects(capturedBody[@"appName"], DEFAULT_APP_DISPLAY_NAME);
}

- (void)testFacadePublicSelectorsUnchanged {
  XCTAssertTrue([RNFBSharedUtils respondsToSelector:@selector(firAppToDictionary:)]);
  XCTAssertTrue([RNFBSharedUtils respondsToSelector:@selector(sendJSEventForApp:name:body:)]);
}

@end
