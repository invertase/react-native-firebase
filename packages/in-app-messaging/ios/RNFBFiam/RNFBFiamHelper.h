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

NS_ASSUME_NONNULL_BEGIN

/// Thin Objective-C wrapper around FirebaseInAppMessaging.
///
/// FirebaseInAppMessaging is a pure-Swift SPM module: its generated ObjC
/// interface header (FirebaseInAppMessaging-Swift.h) is not reliably
/// importable from a cross-project CocoaPods target, and `@import
/// FirebaseInAppMessaging;` (the pattern the Firebase SDK itself documents
/// for ObjC clients, see SPMSwiftHeaderWorkaround.swift) requires C++
/// modules to be enabled when used from an Objective-C++ (.mm) file, which
/// breaks React Native's own jsi/React modules. Isolating all
/// FirebaseInAppMessaging usage in this plain Objective-C (.m) file avoids
/// that requirement entirely, since `@import` only needs `-fmodules`
/// (already enabled) for plain ObjC. On Mac Catalyst + SPM the upstream
/// wrap target omits the real module — see RNFBFiamHelper.m stubs and
/// https://github.com/firebase/firebase-ios-sdk/pull/16468. See
/// okf-bundle/ios-spm-native-imports.md.
@interface RNFBFiamHelper : NSObject

+ (BOOL)isMessageDisplaySuppressed;
+ (BOOL)isAutomaticDataCollectionEnabled;
+ (void)setAutomaticDataCollectionEnabled:(BOOL)enabled;
+ (void)setMessageDisplaySuppressed:(BOOL)enabled;
+ (void)triggerEvent:(NSString *)eventId;

@end

NS_ASSUME_NONNULL_END
