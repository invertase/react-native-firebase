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
 *
 */

// Host-side doubles for the React Native / Firebase / UIKit types that
// RNFBMessagingModule.mm and RNFBMessaging+FIRMessagingDelegate.m link against. The matching
// headers live in Stubs/ (IosTest-AD-1: macOS host, no React / Firebase in the unit graph).

#import <GoogleUtilities/GULAppDelegateSwizzler.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTConvert.h>
#import <UIKit/UIKit.h>

#import "RNFBMessaging+AppDelegate.h"
#import "RNFBMessaging+NSNotificationCenter.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"
#import "RNFBMessagingSerializer.h"
#import "RNFBMessagingTurboModules.h"

#pragma mark - Firebase

@implementation FIRMessaging

+ (instancetype)messaging {
  static FIRMessaging *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[FIRMessaging alloc] init];
  });
  return shared;
}

- (BOOL)isInstallationIdEnabled {
  return self.installationIdEnabledForTesting;
}

- (void)setAPNSToken:(NSData *)apnsToken type:(FIRMessagingAPNSTokenType)type {
  self.APNSToken = apnsToken;
}

- (void)registerWithCompletion:(void (^)(NSError *_Nullable))completion {
  self.registerCallCountForTesting += 1;
  completion(self.completionErrorForTesting);
}

- (void)unregisterWithCompletion:(void (^)(NSError *_Nullable))completion {
  self.unregisterCallCountForTesting += 1;
  completion(self.completionErrorForTesting);
}

- (void)retrieveFCMTokenForSenderID:(NSString *)senderID
                         completion:(void (^)(NSString *_Nullable, NSError *_Nullable))completion {
  completion(nil, self.completionErrorForTesting);
}

- (void)deleteFCMTokenForSenderID:(NSString *)senderID
                       completion:(void (^)(NSError *_Nullable))completion {
  completion(self.completionErrorForTesting);
}

- (void)subscribeToTopic:(NSString *)topic completion:(void (^)(NSError *_Nullable))completion {
  completion(self.completionErrorForTesting);
}

- (void)unsubscribeFromTopic:(NSString *)topic completion:(void (^)(NSError *_Nullable))completion {
  completion(self.completionErrorForTesting);
}

- (void)resetForTesting {
  self.delegate = nil;
  self.installationIdEnabledForTesting = NO;
  self.completionErrorForTesting = nil;
  self.registerCallCountForTesting = 0;
  self.unregisterCallCountForTesting = 0;
}

@end

#pragma mark - GoogleUtilities / UIKit

@implementation GULAppDelegateSwizzler
+ (UIApplication *)sharedApplication {
  return [UIApplication sharedApplication];
}
@end

@implementation UIApplication

+ (UIApplication *)sharedApplication {
  static UIApplication *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[UIApplication alloc] init];
  });
  return shared;
}

- (UIApplicationState)applicationState {
  return UIApplicationStateActive;
}

- (BOOL)isRegisteredForRemoteNotifications {
  return NO;
}

- (void)registerForRemoteNotifications {
}

- (void)unregisterForRemoteNotifications {
}

- (void)endBackgroundTask:(UIBackgroundTaskIdentifier)identifier {
}

@end

#pragma mark - React

@implementation RCTConvert
+ (BOOL)BOOL:(id)json {
  return [json boolValue];
}
@end

@implementation _RCTTypedModuleConstants
+ (instancetype)newWithUnsafeDictionary:(NSDictionary *)dictionary {
  return (_RCTTypedModuleConstants *)(id)dictionary;
}
@end

#pragma mark - RNFBApp

@implementation RNFBRCTEventEmitter

+ (RNFBRCTEventEmitter *)shared {
  static RNFBRCTEventEmitter *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBRCTEventEmitter alloc] init];
    shared->_sentEventsForTesting = [NSMutableArray array];
  });
  return shared;
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
  [self.sentEventsForTesting addObject:@{@"name" : eventName, @"body" : body}];
}

- (void)resetForTesting {
  [self.sentEventsForTesting removeAllObjects];
}

@end

@implementation RNFBSharedUtils

+ (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject
                             exception:(NSException *)exception {
  reject(exception.name, exception.reason, nil);
}

+ (void)rejectPromiseWithNSError:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  reject(@"native-error", error.localizedDescription, error);
}

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo {
  reject(userInfo[@"code"], userInfo[@"message"], nil);
}

@end

#pragma mark - RNFBMessaging collaborators (not under test)

@implementation RNFBMessagingAppDelegate

+ (instancetype)sharedInstance {
  static RNFBMessagingAppDelegate *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBMessagingAppDelegate alloc] init];
  });
  return shared;
}

- (void)observe {
}

- (void)signalBackgroundMessageHandlerSet {
}

- (NSUInteger)beginRegisterPromiseResolve:(RCTPromiseResolveBlock)resolve
                         andPromiseReject:(RCTPromiseRejectBlock)reject {
  return 0;
}

- (BOOL)claimPendingRegisterPromiseGeneration:(NSUInteger)generation
                                      resolve:(RCTPromiseResolveBlock _Nullable *_Nonnull)outResolve
                                       reject:(RCTPromiseRejectBlock _Nullable *_Nonnull)outReject {
  return NO;
}

- (BOOL)claimPendingRegisterPromiseResolve:(RCTPromiseResolveBlock _Nullable *_Nonnull)outResolve
                                    reject:(RCTPromiseRejectBlock _Nullable *_Nonnull)outReject {
  return NO;
}

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
}

- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
}

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
}

@end

@implementation RNFBMessagingUNUserNotificationCenter

+ (instancetype)sharedInstance {
  static RNFBMessagingUNUserNotificationCenter *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBMessagingUNUserNotificationCenter alloc] init];
  });
  return shared;
}

- (void)observe {
}

- (nullable NSDictionary *)getInitialNotification {
  return nil;
}

- (NSNumber *)getDidOpenSettingsForNotification {
  return @NO;
}

@end

@implementation RNFBMessagingNSNotificationCenter

+ (instancetype)sharedInstance {
  static RNFBMessagingNSNotificationCenter *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBMessagingNSNotificationCenter alloc] init];
  });
  return shared;
}

@end

@implementation RNFBMessagingSerializer

+ (nullable NSData *)APNSTokenDataFromNSString:(NSString *)token {
  return [token dataUsingEncoding:NSUTF8StringEncoding];
}

+ (NSString *)APNSTokenFromNSData:(NSData *)tokenData {
  return [[NSString alloc] initWithData:tokenData encoding:NSUTF8StringEncoding];
}

+ (NSDictionary *)notificationToDict:(UNNotification *)notification {
  return @{};
}

+ (NSDictionary *)remoteMessageUserInfoToDict:(NSDictionary *)userInfo {
  return @{};
}

@end
