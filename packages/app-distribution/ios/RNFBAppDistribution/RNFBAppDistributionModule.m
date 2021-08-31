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
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase AppDistribution Methods

RCT_EXPORT_METHOD(isTesterSignedIn
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  BOOL isTesterSignedIn = appDistribution.isTesterSignedIn;
  resolve([NSNumber numberWithBool:isTesterSignedIn]);
}

RCT_EXPORT_METHOD(signInTester : (RCTPromiseResolveBlock)resolve : (RCTPromiseRejectBlock)reject) {
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  [appDistribution signInTesterWithCompletion:^(NSError *_Nullable error) {
    if (error != nil) {
      // Handle any errors if the signIn failed
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

RCT_EXPORT_METHOD(signOutTester
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAppDistribution appDistribution] signOutTester];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(checkForUpdate
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppDistribution *appDistribution = [FIRAppDistribution appDistribution];
  [appDistribution checkForUpdateWithCompletion:^(FIRAppDistributionRelease *_Nullable release,
                                                  NSError *_Nullable error) {
    if (error != nil) {
      // Handle any errors if the release was not retrieved.
      DLog(@"Unable to check App Distribution release: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"check-update-error",
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }
    if (release == nil) {
      DLog(@"Unable to check App Distribution release: %@", error);
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
