//
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

#import "RNFBAdMobCommon.h"
#import "RNFBRCTEventEmitter.h"

NSString *const EVENT_INTERSTITIAL = @"admob_interstitial_event";
NSString *const EVENT_REWARDED = @"admob_rewarded_event";
NSString *const ADMOB_EVENT_LOADED = @"loaded";
NSString *const ADMOB_EVENT_ERROR = @"error";
NSString *const ADMOB_EVENT_OPENED = @"opened";
NSString *const ADMOB_EVENT_CLICKED = @"clicked";
NSString *const ADMOB_EVENT_LEFT_APPLICATION = @"left_application";
NSString *const ADMOB_EVENT_CLOSED = @"closed";
NSString *const ADMOB_EVENT_REWARDED_LOADED = @"rewarded_loaded";
NSString *const ADMOB_EVENT_REWARDED_EARNED_REWARD = @"rewarded_earned_reward";


@implementation RNFBGADInterstitial : GADInterstitial
- (void)setRequestId:(NSNumber *)requestId {
  _requestId = requestId;
}
@end

@implementation RNFBGADRewarded : GADRewardedAd
- (void)setRequestId:(NSNumber *)requestId {
  _requestId = requestId;
}
@end

@implementation RNFBAdMobCommon

+ (GADRequest *)buildAdRequest:(NSDictionary *)adRequestOptions {
  GADRequest *request = [GADRequest request];
  NSMutableDictionary *extras = [@{} mutableCopy];

  if (adRequestOptions[@"requestNonPersonalizedAdsOnly"]) {
    extras[@"npa"] = @"1";
  }

  if (adRequestOptions[@"networkExtras"]) {
    for (NSString *key in adRequestOptions[@"networkExtras"]) {
      NSString *value = adRequestOptions[@"networkExtras"][key];
      extras[key] = value;
    }
  }

  GADExtras *networkExtras = [[GADExtras alloc] init];
  networkExtras.additionalParameters = extras;
  [request registerAdNetworkExtras:networkExtras];

  if (adRequestOptions[@"keywords"]) {
    request.keywords = adRequestOptions[@"keywords"];
  }

  if (adRequestOptions[@"testDevices"]) {
    NSMutableArray *devices = [@[] mutableCopy];
    for (NSString *key in adRequestOptions[@"testDevices"]) {
      if ([key isEqualToString:@"EMULATOR"]) {
        [devices addObject:kGADSimulatorID];
      } else {
        [devices addObject:key];
      }
    }
    request.testDevices = devices;
  }

  if (adRequestOptions[@"location"]) {
    NSArray<NSNumber *> *latLong = adRequestOptions[@"location"];
    [request setLocationWithLatitude:[latLong[0] doubleValue] longitude:[latLong[1] doubleValue] accuracy:[adRequestOptions[@"locationAccuracy"] doubleValue]];
  }

  if (adRequestOptions[@"contentUrl"]) {
    request.contentURL = adRequestOptions[@"contentUrl"];
  }

  if (adRequestOptions[@"requestAgent"]) {
    request.requestAgent = adRequestOptions[@"requestAgent"];
  }

  return request;
}

+ (NSDictionary *)getCodeAndMessageFromAdError:(GADRequestError *)error {
  NSString *code = @"unknown";
  NSString *message = @"An unknown error occurred.";

  if (error.code == kGADErrorInvalidRequest) {
    code = @"invalid-request";
    message = @"The ad request was invalid; for instance, the ad unit ID was incorrect.";
  } else if (error.code == kGADErrorNoFill) {
    code = @"no-fill";
    message = @"The ad request was successful, but no ad was returned due to lack of ad inventory.";
  } else if (error.code == kGADErrorNetworkError) {
    code = @"network-error";
    message = @"The ad request was unsuccessful due to network connectivity.";
  } else if (error.code == kGADErrorInternalError) {
    code = @"internal-error";
    message = @"Something happened internally; for instance, an invalid response was received from the ad server.";
  }

  return @{
      @"code": code,
      @"message": message,
  };
}

+ (void)sendAdEvent:(NSString *)event
          requestId:(NSNumber *)requestId
               type:(NSString *)type
           adUnitId:(NSString *)adUnitId
              error:(nullable NSDictionary *)error
               data:(nullable NSDictionary *)data {
  NSMutableDictionary *body = [@{
      @"type": type,
  } mutableCopy];

  if (error != nil) {
    body[@"error"] = error;
  }

  if (data != nil) {
    body[@"data"] = data;
  }

  NSMutableDictionary *payload = [@{
      @"eventName": type,
      @"requestId": requestId,
      @"adUnitId": adUnitId,
      @"body": body,
  } mutableCopy];

  [[RNFBRCTEventEmitter shared] sendEventWithName:event body:payload];
}

@end
