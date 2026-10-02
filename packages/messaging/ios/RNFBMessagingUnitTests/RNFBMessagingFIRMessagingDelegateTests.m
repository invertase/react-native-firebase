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
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import "RNFBMessaging+FIRMessagingDelegate.h"

/// Original `FIRMessaging.delegate` that implements the installation-id callbacks.
@interface FakeInstallationIdDelegate : NSObject <FIRMessagingDelegate>
@property(nonatomic, strong) NSMutableArray<NSString *> *calls;
@end

@implementation FakeInstallationIdDelegate
- (instancetype)init {
  self = [super init];
  _calls = [NSMutableArray array];
  return self;
}
- (void)messaging:(FIRMessaging *)messaging
    didReceiveRegistration:(nullable NSString *)installationId {
  [self.calls addObject:[@"registered:" stringByAppendingString:installationId ?: @"nil"]];
}
- (void)messaging:(FIRMessaging *)messaging didUnregister:(NSString *)installationId {
  [self.calls addObject:[@"unregistered:" stringByAppendingString:installationId]];
}
@end

/// Application delegate that implements the same callbacks (the AppDelegate fallback path).
@interface FakeInstallationIdAppDelegate : NSObject <UIApplicationDelegate>
@property(nonatomic, strong) NSMutableArray<NSString *> *calls;
@end

@implementation FakeInstallationIdAppDelegate
- (instancetype)init {
  self = [super init];
  _calls = [NSMutableArray array];
  return self;
}
- (void)messaging:(FIRMessaging *)messaging
    didReceiveRegistration:(nullable NSString *)installationId {
  [self.calls addObject:[@"registered:" stringByAppendingString:installationId ?: @"nil"]];
}
- (void)messaging:(FIRMessaging *)messaging didUnregister:(NSString *)installationId {
  [self.calls addObject:[@"unregistered:" stringByAppendingString:installationId]];
}
@end

/// Delegate / app delegate that does not implement either callback.
@interface FakeSilentDelegate : NSObject <FIRMessagingDelegate, UIApplicationDelegate>
@end

@implementation FakeSilentDelegate
@end

@interface RNFBMessagingFIRMessagingDelegateTests : XCTestCase
@property(nonatomic, strong) RNFBMessagingFIRMessagingDelegate *delegate;
@end

@implementation RNFBMessagingFIRMessagingDelegateTests

- (void)setUp {
  [super setUp];
  self.delegate = [[RNFBMessagingFIRMessagingDelegate alloc] init];
  [[RNFBRCTEventEmitter shared] resetForTesting];
  [UIApplication sharedApplication].delegate = nil;
}

- (void)tearDown {
  [UIApplication sharedApplication].delegate = nil;
  [[RNFBRCTEventEmitter shared] resetForTesting];
  [super tearDown];
}

- (NSArray<NSDictionary *> *)sentEvents {
  return [RNFBRCTEventEmitter shared].sentEventsForTesting;
}

#pragma mark - didReceiveRegistration

- (void)testDidReceiveRegistration_emitsRegisteredEvent {
  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-1"];

  XCTAssertEqual([self sentEvents].count, 1);
  XCTAssertEqualObjects([self sentEvents][0][@"name"], @"messaging_registered");
  XCTAssertEqualObjects([self sentEvents][0][@"body"], @{@"installationId" : @"fid-1"});
}

- (void)testDidReceiveRegistration_nilInstallationId_skipsEventButStillForwards {
  FakeInstallationIdDelegate *original = [[FakeInstallationIdDelegate alloc] init];
  FakeInstallationIdAppDelegate *appDelegate = [[FakeInstallationIdAppDelegate alloc] init];
  self.delegate.originalDelegate = original;
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:nil];

  XCTAssertEqual([self sentEvents].count, 0);
  XCTAssertEqualObjects(original.calls, (@[ @"registered:nil" ]));
  XCTAssertEqualObjects(appDelegate.calls, (@[ @"registered:nil" ]));
}

- (void)testDidReceiveRegistration_forwardsToOriginalDelegate {
  FakeInstallationIdDelegate *original = [[FakeInstallationIdDelegate alloc] init];
  self.delegate.originalDelegate = original;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-2"];

  XCTAssertEqualObjects(original.calls, (@[ @"registered:fid-2" ]));
}

- (void)testDidReceiveRegistration_originalDelegateWithoutCallback_isSkipped {
  FakeSilentDelegate *original = [[FakeSilentDelegate alloc] init];
  self.delegate.originalDelegate = original;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-3"];

  XCTAssertEqual([self sentEvents].count, 1);
}

- (void)testDidReceiveRegistration_forwardsToDistinctApplicationDelegate {
  FakeInstallationIdDelegate *original = [[FakeInstallationIdDelegate alloc] init];
  FakeInstallationIdAppDelegate *appDelegate = [[FakeInstallationIdAppDelegate alloc] init];
  self.delegate.originalDelegate = original;
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-4"];

  XCTAssertEqualObjects(original.calls, (@[ @"registered:fid-4" ]));
  XCTAssertEqualObjects(appDelegate.calls, (@[ @"registered:fid-4" ]));
}

- (void)testDidReceiveRegistration_applicationDelegateIsOriginalDelegate_notCalledTwice {
  FakeInstallationIdAppDelegate *appDelegate = [[FakeInstallationIdAppDelegate alloc] init];
  self.delegate.originalDelegate = (id<FIRMessagingDelegate>)appDelegate;
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-5"];

  XCTAssertEqualObjects(appDelegate.calls, (@[ @"registered:fid-5" ]));
}

- (void)testDidReceiveRegistration_applicationDelegateWithoutCallback_isSkipped {
  FakeSilentDelegate *appDelegate = [[FakeSilentDelegate alloc] init];
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didReceiveRegistration:@"fid-6"];

  XCTAssertEqual([self sentEvents].count, 1);
}

#pragma mark - didUnregister

- (void)testDidUnregister_emitsUnregisteredEvent {
  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-7"];

  XCTAssertEqual([self sentEvents].count, 1);
  XCTAssertEqualObjects([self sentEvents][0][@"name"], @"messaging_unregistered");
  XCTAssertEqualObjects([self sentEvents][0][@"body"], @{@"installationId" : @"fid-7"});
}

- (void)testDidUnregister_forwardsToOriginalDelegate {
  FakeInstallationIdDelegate *original = [[FakeInstallationIdDelegate alloc] init];
  self.delegate.originalDelegate = original;

  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-8"];

  XCTAssertEqualObjects(original.calls, (@[ @"unregistered:fid-8" ]));
}

- (void)testDidUnregister_originalDelegateWithoutCallback_isSkipped {
  FakeSilentDelegate *original = [[FakeSilentDelegate alloc] init];
  self.delegate.originalDelegate = original;

  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-9"];

  XCTAssertEqual([self sentEvents].count, 1);
}

- (void)testDidUnregister_forwardsToDistinctApplicationDelegate {
  FakeInstallationIdDelegate *original = [[FakeInstallationIdDelegate alloc] init];
  FakeInstallationIdAppDelegate *appDelegate = [[FakeInstallationIdAppDelegate alloc] init];
  self.delegate.originalDelegate = original;
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-10"];

  XCTAssertEqualObjects(original.calls, (@[ @"unregistered:fid-10" ]));
  XCTAssertEqualObjects(appDelegate.calls, (@[ @"unregistered:fid-10" ]));
}

- (void)testDidUnregister_applicationDelegateIsOriginalDelegate_notCalledTwice {
  FakeInstallationIdAppDelegate *appDelegate = [[FakeInstallationIdAppDelegate alloc] init];
  self.delegate.originalDelegate = (id<FIRMessagingDelegate>)appDelegate;
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-11"];

  XCTAssertEqualObjects(appDelegate.calls, (@[ @"unregistered:fid-11" ]));
}

- (void)testDidUnregister_applicationDelegateWithoutCallback_isSkipped {
  FakeSilentDelegate *appDelegate = [[FakeSilentDelegate alloc] init];
  [UIApplication sharedApplication].delegate = appDelegate;

  [self.delegate messaging:[FIRMessaging messaging] didUnregister:@"fid-12"];

  XCTAssertEqual([self sentEvents].count, 1);
}

@end
