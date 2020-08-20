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

#import <React/RCTUtils.h>
#import <GoogleMobileAds/GoogleMobileAds.h>

#import "RNFBAdMobModule.h"
#import "RNFBApp/RNFBSharedUtils.h"


@implementation RNFBAdMobModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase Admob Methods


RCT_EXPORT_METHOD(setRequestConfiguration:
  (NSDictionary *) requestConfiguration
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [self setRequestConfiguration:requestConfiguration];
  resolve([NSNull null]);
}

- (void)setRequestConfiguration:(NSDictionary *)requestConfiguration {
  if (requestConfiguration[@"maxAdContentRating"]) {
    NSString *rating = requestConfiguration[@"maxAdContentRating"];
    if ([rating isEqualToString:@"G"]) {
      GADMobileAds.sharedInstance.requestConfiguration.maxAdContentRating = GADMaxAdContentRatingGeneral;
    } else if ([rating isEqualToString:@"PG"]) {
      GADMobileAds.sharedInstance.requestConfiguration.maxAdContentRating = GADMaxAdContentRatingParentalGuidance;
    } else if ([rating isEqualToString:@"T"]) {
      GADMobileAds.sharedInstance.requestConfiguration.maxAdContentRating = GADMaxAdContentRatingTeen;
    } else if ([rating isEqualToString:@"MA"]) {
      GADMobileAds.sharedInstance.requestConfiguration.maxAdContentRating = GADMaxAdContentRatingMatureAudience;
    }
  }

  if (requestConfiguration[@"tagForChildDirectedTreatment"]) {
    BOOL tag = (BOOL) requestConfiguration[@"tagForChildDirectedTreatment"];
    [GADMobileAds.sharedInstance.requestConfiguration tagForChildDirectedTreatment:tag];
  }

  if (requestConfiguration[@"tagForUnderAgeOfConsent"]) {
    BOOL tag = (BOOL) requestConfiguration[@"tagForUnderAgeOfConsent"];
    [GADMobileAds.sharedInstance.requestConfiguration tagForUnderAgeOfConsent:tag];
  }
}

@end
