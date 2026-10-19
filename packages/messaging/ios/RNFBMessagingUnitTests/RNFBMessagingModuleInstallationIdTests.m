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
#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import "RNFBMessagingHelper.h"

@interface RNFBMessagingModuleInstallationIdTests : XCTestCase
@property(nonatomic, strong) NSMutableArray *resolved;
@property(nonatomic, strong) NSMutableArray<NSString *> *rejectedCodes;
@property(nonatomic, strong) NSMutableArray<NSError *> *rejectedErrors;
@end

@implementation RNFBMessagingModuleInstallationIdTests

- (void)setUp {
  [super setUp];
  self.resolved = [NSMutableArray array];
  self.rejectedCodes = [NSMutableArray array];
  self.rejectedErrors = [NSMutableArray array];
  [[FIRMessaging messaging] resetForTesting];
  [[UIApplication sharedApplication] resetForTesting];
}

- (void)tearDown {
  [[FIRMessaging messaging] resetForTesting];
  [[UIApplication sharedApplication] resetForTesting];
  [super tearDown];
}

- (RCTPromiseResolveBlock)resolver {
  return ^(id result) {
    [self.resolved addObject:result ?: [NSNull null]];
  };
}

- (RCTPromiseRejectBlock)rejecter {
  return ^(NSString *code, NSString *message, NSError *error) {
    [self.rejectedCodes addObject:code ?: @"(nil)"];
    if (error != nil) {
      [self.rejectedErrors addObject:error];
    }
  };
}

#pragma mark - register

- (void)testRegister_success_resolvesNull {
  [RNFBMessagingHelper registerWithResolve:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 1);
  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 0);
  XCTAssertEqualObjects(self.resolved, (@[ [NSNull null] ]));
  XCTAssertEqual(self.rejectedErrors.count, 0);
}

- (void)testRegister_failure_rejectsWithNativeError {
  NSError *error = [NSError errorWithDomain:@"com.google.fcm" code:42 userInfo:nil];
  [FIRMessaging messaging].completionErrorForTesting = error;

  [RNFBMessagingHelper registerWithResolve:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 1);
  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqual(self.rejectedErrors.count, 1);
  XCTAssertEqual(self.rejectedErrors[0], error);
}

#pragma mark - unregister

- (void)testUnregister_success_resolvesNull {
  [RNFBMessagingHelper unregisterWithResolve:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 1);
  XCTAssertEqual([FIRMessaging messaging].registerCallCountForTesting, 0);
  XCTAssertEqualObjects(self.resolved, (@[ [NSNull null] ]));
  XCTAssertEqual(self.rejectedErrors.count, 0);
}

- (void)testUnregister_failure_rejectsWithNativeError {
  NSError *error = [NSError errorWithDomain:@"com.google.fcm" code:43 userInfo:nil];
  [FIRMessaging messaging].completionErrorForTesting = error;

  [RNFBMessagingHelper unregisterWithResolve:[self resolver] reject:[self rejecter]];

  XCTAssertEqual([FIRMessaging messaging].unregisterCallCountForTesting, 1);
  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqual(self.rejectedErrors.count, 1);
  XCTAssertEqual(self.rejectedErrors[0], error);
}

#pragma mark - constants

- (void)testConstants_installationIdDisabled_byDefault {
  XCTAssertEqual([RNFBMessagingHelper isInstallationIdEnabled], NO);
}

- (void)testConstants_installationIdEnabled_whenSdkFlagOn {
  [FIRMessaging messaging].installationIdEnabledForTesting = YES;

  XCTAssertEqual([RNFBMessagingHelper isInstallationIdEnabled], YES);
}

- (void)testIsRegisteredForRemoteNotifications_reflectsUIApplicationFlag {
  [UIApplication sharedApplication].registeredForRemoteNotifications = YES;

  XCTAssertTrue([RNFBMessagingHelper isRegisteredForRemoteNotifications]);
}

#pragma mark - getToken / getAPNSToken / unregister (main-queue UIApplication hops)

- (void)testGetToken_rejectsUnregistered_whenNotRegistered {
  [RNFBMessagingHelper getTokenWithSenderId:@"sender"
                                    resolve:[self resolver]
                                     reject:[self rejecter]];

  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqualObjects(self.rejectedCodes, (@[ @"unregistered" ]));
}

- (void)testGetToken_doesNotRejectUnregistered_whenRegistered {
  [UIApplication sharedApplication].registeredForRemoteNotifications = YES;
  NSError *fcmError = [NSError errorWithDomain:@"com.google.fcm" code:99 userInfo:nil];
  [FIRMessaging messaging].completionErrorForTesting = fcmError;
  FIRMessaging.retrieveFCMTokenError = fcmError;
  FIRMessaging.retrieveFCMTokenResult = nil;

  [RNFBMessagingHelper getTokenWithSenderId:@"sender"
                                    resolve:[self resolver]
                                     reject:[self rejecter]];

  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqual(self.rejectedCodes.count, 1);
  XCTAssertNotEqualObjects(self.rejectedCodes.firstObject, @"unregistered");
  XCTAssertEqualObjects(self.rejectedCodes.firstObject, @"unknown");
  XCTAssertEqual(self.rejectedErrors.count, 1);
  XCTAssertEqual(self.rejectedErrors[0], fcmError);
}

- (void)testGetAPNSToken_rejectsUnregistered_whenNotRegistered {
  [FIRMessaging messaging].APNSToken = nil;

  [RNFBMessagingHelper getAPNSToken:[self resolver] reject:[self rejecter]];

  XCTAssertEqual(self.resolved.count, 0);
  XCTAssertEqualObjects(self.rejectedCodes, (@[ @"unregistered" ]));
}

- (void)testUnregisterForRemoteNotificationsOnMain_callsUIKit {
  [UIApplication sharedApplication].registeredForRemoteNotifications = YES;

  [RNFBMessagingHelper unregisterForRemoteNotificationsOnMain];

  XCTAssertEqual(
      [UIApplication sharedApplication].unregisterForRemoteNotificationsCallCountForTesting, 1);
  XCTAssertFalse([UIApplication sharedApplication].isRegisteredForRemoteNotifications);
}

- (void)testIsApplicationInBackground_trueWhenBackground {
  [UIApplication sharedApplication].applicationState = UIApplicationStateBackground;

  XCTAssertTrue([RNFBMessagingHelper isApplicationInBackground]);
}

- (void)testIsApplicationInBackground_falseWhenActive {
  [UIApplication sharedApplication].applicationState = UIApplicationStateActive;

  XCTAssertFalse([RNFBMessagingHelper isApplicationInBackground]);
}

@end
