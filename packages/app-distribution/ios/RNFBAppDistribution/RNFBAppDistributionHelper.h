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
// `FIRAppDistribution` for RNFBAppDistributionModule, plus the Catalyst/SPM
// unavailable reject path (`RNFB_APP_DISTRIBUTION_SDK_AVAILABLE`). This keeps
// RNFBAppDistributionModule.mm free of Firebase App Distribution imports: under
// SPM the CocoaPods umbrella is absent and falling through to `@import` cannot
// be used from an Objective-C++ (.mm) TurboModule when C++ modules are disabled
// (required by React Native's JSI headers). When product headers are absent
// (typical Mac Catalyst + SPM; upstream wrap is `.iOS` only), the helper rejects
// with `unsupported` — never `@import` from the `.mm`.
@interface RNFBAppDistributionHelper : NSObject

+ (void)rejectUnavailable:(RCTPromiseRejectBlock)reject;

#if defined(RNFB_APP_DISTRIBUTION_HOST_STUB_TESTS)
/** Host-stub XCTest seam only — not compiled into the production pod. */
+ (void)setForceUnavailableForTests:(BOOL)forceUnavailable;
#endif

+ (void)isTesterSignedIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)signInTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)signOutTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)checkForUpdate:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

@end
