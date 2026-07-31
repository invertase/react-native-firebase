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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#define RNFB_APP_DISTRIBUTION_SDK_AVAILABLE 1
#elif __has_include(<FirebaseAppDistribution/FirebaseAppDistribution.h>)
#import <FirebaseAppDistribution/FirebaseAppDistribution.h>
#import <FirebaseCore/FirebaseCore.h>
#define RNFB_APP_DISTRIBUTION_SDK_AVAILABLE 1
#else
// Product headers absent (typical Mac Catalyst + SPM). Never fall through to
// @import in this .mm — that requires -fcxx-modules and breaks RN C++/JSI.
#define RNFB_APP_DISTRIBUTION_SDK_AVAILABLE 0
#endif
#import <React/RCTUtils.h>

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBAppDistributionModule.h"

@implementation RNFBAppDistributionModule

RCT_EXPORT_MODULE(NativeRNFBTurboAppDistribution)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAppDistributionSpecJSI>(params);
}

#if !RNFB_APP_DISTRIBUTION_SDK_AVAILABLE
- (void)rejectUnavailable:(RCTPromiseRejectBlock)reject {
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : @"unsupported",
                                      @"message" : @"Firebase App Distribution is not available on "
                                                   @"this platform or dependency configuration.",
                                    }];
}
#endif

- (void)isTesterSignedIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
#if RNFB_APP_DISTRIBUTION_SDK_AVAILABLE
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  BOOL isTesterSignedIn = appDistribution.isTesterSignedIn;
  resolve([NSNumber numberWithBool:isTesterSignedIn]);
#else
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

- (void)signInTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
#if RNFB_APP_DISTRIBUTION_SDK_AVAILABLE
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  [appDistribution signInTesterWithCompletion:^(NSError *_Nullable error) {
    if (error != nil) {
      DLog(@"Unable to signInTester: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"tester-sign-in-error",
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }

    resolve([NSNull null]);
  }];
#else
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

- (void)signOutTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
#if RNFB_APP_DISTRIBUTION_SDK_AVAILABLE
  [[FIRAppDistribution appDistribution] signOutTester];
  resolve([NSNull null]);
#else
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

- (void)checkForUpdate:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
#if RNFB_APP_DISTRIBUTION_SDK_AVAILABLE
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  [appDistribution checkForUpdateWithCompletion:^(FIRAppDistributionRelease *_Nullable release,
                                                  NSError *_Nullable error) {
    if (error != nil) {
      DLog(@"Unable to check App Distribution release: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"check-update-error",
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }
    if (release == nil) {
      DLog(@"Unable to check App Distribution release.");
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"checkupdate-null",
                                          @"message" : @"no update checked",
                                        }];
      return;
    }

    resolve(@{
      @"displayVersion" : release.displayVersion,
      @"buildVersion" : release.buildVersion,
      @"releaseNotes" : release.releaseNotes == nil ? [NSNull null] : release.releaseNotes,
      @"isExpired" : [NSNumber numberWithBool:release.isExpired],
      @"downloadURL" : release.downloadURL.absoluteString
    });
  }];
#else
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

@end
