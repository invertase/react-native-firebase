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

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNFBMessagingAppDelegate : NSObject <UIApplicationDelegate>

@property _Nullable RCTPromiseRejectBlock registerPromiseRejecter;
@property _Nullable RCTPromiseResolveBlock registerPromiseResolver;
@property(nonatomic, assign) NSUInteger registerPromiseGeneration;
@property(nonatomic, strong) NSCondition *conditionBackgroundMessageHandlerSet;
@property(nonatomic) BOOL backgroundMessageHandlerSet;
@property(nonatomic, copy) void (^completionHandler)(UIBackgroundFetchResult);
@property(nonatomic, assign) UIBackgroundTaskIdentifier backgroundTaskId;

+ (_Nonnull instancetype)sharedInstance;

- (void)observe;

- (void)signalBackgroundMessageHandlerSet;

/**
 * Atomically replace any pending register promise. If a prior promise was pending, it is
 * rejected with `registration-superseded` (does not orphan). Returns the generation id for
 * the newly stored promise — timeouts must claim with that generation so a superseded
 * timeout cannot settle a newer call.
 */
- (NSUInteger)beginRegisterPromiseResolve:(RCTPromiseResolveBlock)resolve
                         andPromiseReject:(RCTPromiseRejectBlock)reject;

/**
 * Atomically claim and clear the pending register promise only if `generation` still matches.
 * Safe from any queue (including a background timeout queue while main is stalled).
 */
- (BOOL)claimPendingRegisterPromiseGeneration:(NSUInteger)generation
                                      resolve:(RCTPromiseResolveBlock _Nullable *_Nonnull)outResolve
                                       reject:(RCTPromiseRejectBlock _Nullable *_Nonnull)outReject;

/**
 * Atomically claim and clear whatever register promise is currently pending (success / fail
 * AppDelegate callbacks). Returns YES if a pending promise was claimed.
 */
- (BOOL)claimPendingRegisterPromiseResolve:(RCTPromiseResolveBlock _Nullable *_Nonnull)outResolve
                                    reject:(RCTPromiseRejectBlock _Nullable *_Nonnull)outReject;

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler;

@end

NS_ASSUME_NONNULL_END
