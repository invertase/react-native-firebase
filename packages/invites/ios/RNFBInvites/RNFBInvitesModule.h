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
#import <React/RCTEventEmitter.h>

#import <FirebaseInvites/FirebaseInvites.h>

@interface RNFBInvitesModule : RCTEventEmitter <RCTBridgeModule, FIRInviteDelegate>
@property _Nullable RCTPromiseRejectBlock invitationsRejecter;
@property _Nullable RCTPromiseResolveBlock invitationsResolver;

+ (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options;

+ (BOOL)application:(nonnull UIApplication *)application continueUserActivity :(nonnull NSUserActivity *)userActivity restorationHandler:
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
  (nonnull void (^)(NSArray<id <UIUserActivityRestoring>> *_Nullable))restorationHandler;
#else
  (nonnull void (^)(NSArray *_Nullable))restorationHandler;
#endif

@end
