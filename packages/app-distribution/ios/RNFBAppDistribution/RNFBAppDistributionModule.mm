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

// This module intentionally has no Firebase imports — see RNFBAppDistributionHelper.h /
// okf-bundle/ios-spm-native-imports.md. Every Firebase App Distribution SDK call (and the
// Catalyst/SPM unavailable reject path) is routed through the plain Objective-C
// RNFBAppDistributionHelper class instead, which can safely own the CocoaPods/SPM dual-import
// and `RNFB_APP_DISTRIBUTION_SDK_AVAILABLE` gate because it compiles as ObjC, not ObjC++.
#import "RNFBAppDistributionModule.h"
#import "RNFBAppDistributionHelper.h"

@implementation RNFBAppDistributionModule

RCT_EXPORT_MODULE(NativeRNFBTurboAppDistribution)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAppDistributionSpecJSI>(params);
}

- (void)isTesterSignedIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppDistributionHelper isTesterSignedIn:resolve reject:reject];
}

- (void)signInTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppDistributionHelper signInTester:resolve reject:reject];
}

- (void)signOutTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppDistributionHelper signOutTester:resolve reject:reject];
}

- (void)checkForUpdate:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppDistributionHelper checkForUpdate:resolve reject:reject];
}

@end
