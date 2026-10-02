/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import <Firebase/Firebase.h>
#import <React/RCTBridgeModule.h>
#import <XCTest/XCTest.h>

#import "RNFBMessagingModule.h"

// `register` / `unregister` come from the codegen'd NativeRNFBTurboMessagingSpec protocol, which
// the host stub does not redeclare.
@interface RNFBMessagingModule (InstallationIdTesting)
- (void)register:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (void)unregister:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;
- (NSDictionary *)messagingConstantsDictionary;
@end

@interface RNFBMessagingModuleInstallationIdTests : XCTestCase
@property(nonatomic, strong) RNFBMessagingModule *module;
@property(nonatomic, strong) NSMutableArray *resolved;
@property(nonatomic, strong) NSMutableArray<NSError *> *rejectedErrors;
@end

@implementation RNFBMessagingModuleInstallationIdTests

- (void)setUp {
  [super setUp];
  self.module = [[RNFBMessagingModule alloc] init];
  self.resolved = [NSMutableArray array];
  self.rejectedErrors = [NSMutableArray array];
  [[FIRMessaging messaging] resetForTesting];
}

- (void)tearDown {
  [[FIRMessaging messaging] resetForTesting];
  [super tearDown];
}

- (RCTPromiseResolveBlock)resolver {
  return ^(id result) {
    [self.resolved addObject:result ?: [NSNull null]];
  };
}

- (RCTPromiseRejectBlock)rejecter {
  return ^(NSString *code, NSString *message, NSError *error) {
    [self.rejectedErrors addObject:error];
  };
}

#pragma mark - register

- (void)testRegister_success_resolvesNull {
  [self.module register:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 1);
  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 0);
  XCTAssertEqualObjects(self.resolved, (@[ [NSNull null] ]));
  XCTAssertEqual(self.rejectedErrors.count, 0);
}

- (void)testRegister_failure_rejectsWithNativeError {
  NSError *error = [NSError errorWithDomain:@"com.google.fcm" code:42 userInfo:nil];
  [FIRMessaging messaging].completionErrorForTesting = error;

  [self.module register:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 1);
  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqual(self.rejectedErrors.count, 1);
  XCTAssertEqual(self.rejectedErrors[0], error);
}

#pragma mark - unregister

- (void)testUnregister_success_resolvesNull {
  [self.module unregister:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 1);
  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 0);
  XCTAssertEqualObjects(self.resolved, (@[ [NSNull null] ]));
  XCTAssertEqual(self.rejectedErrors.count, 0);
}

- (void)testUnregister_failure_rejectsWithNativeError {
  NSError *error = [NSError errorWithDomain:@"com.google.fcm" code:43 userInfo:nil];
  [FIRMessaging messaging].completionErrorForTesting = error;

  [self.module unregister:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 1);
  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqual(self.rejectedErrors.count, 1);
  XCTAssertEqual(self.rejectedErrors[0], error);
}

#pragma mark - constants

- (void)testConstants_installationIdDisabled_byDefault {
  XCTAssertEqualObjects([self.module messagingConstantsDictionary][@"isInstallationIdEnabled"],
                        @NO);
}

- (void)testConstants_installationIdEnabled_whenSdkFlagOn {
  [FIRMessaging messaging].installationIdEnabledForTesting = YES;

  XCTAssertEqualObjects([self.module messagingConstantsDictionary][@"isInstallationIdEnabled"],
                        @YES);
}

@end
