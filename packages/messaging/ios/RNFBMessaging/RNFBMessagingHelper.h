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

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRMessaging` for RNFBMessagingModule. This keeps RNFBMessagingModule.mm
// free of Firebase Messaging imports: under SPM the usable Objective-C
// surface for Messaging is module-backed, and `@import` cannot be used from
// an Objective-C++ (.mm) TurboModule when C++ modules are disabled (required
// by React Native's JSI headers).
@interface RNFBMessagingHelper : NSObject

+ (BOOL)isAutoInitEnabled;

+ (void)setAutoInitEnabled:(BOOL)enabled
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;

+ (void)getTokenWithSenderId:(NSString *)senderId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject;

+ (void)deleteTokenWithSenderId:(NSString *)senderId
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

+ (void)getAPNSToken:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)setAPNSToken:(NSString *)token
                type:(NSString *)type
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject;

+ (void)subscribeToTopic:(NSString *)topic
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)unsubscribeFromTopic:(NSString *)topic
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject;

@end
