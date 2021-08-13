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
@property(nonatomic, strong) NSCondition *conditionBackgroundMessageHandlerSet;
@property(nonatomic) BOOL backgroundMessageHandlerSet;

+ (_Nonnull instancetype)sharedInstance;

- (void)observe;

- (void)signalBackgroundMessageHandlerSet;

- (void)setPromiseResolve:(RCTPromiseResolveBlock)resolve
         andPromiseReject:(RCTPromiseRejectBlock)reject;

- (void)application:(UIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

- (void)application:(UIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

- (void)application:(UIApplication *)application
    didReceiveRemoteNotification:(NSDictionary *)userInfo
          fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler;

@end

NS_ASSUME_NONNULL_END
