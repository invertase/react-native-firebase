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

#import <Firebase/Firebase.h>
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

- (void)isTesterSignedIn:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  BOOL isTesterSignedIn = appDistribution.isTesterSignedIn;
  resolve([NSNumber numberWithBool:isTesterSignedIn]);
}

- (void)signInTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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
}

- (void)signOutTester:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [[FIRAppDistribution appDistribution] signOutTester];
  resolve([NSNull null]);
}

- (void)checkForUpdate:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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
}

@end
