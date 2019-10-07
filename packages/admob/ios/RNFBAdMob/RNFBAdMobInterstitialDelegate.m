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

#import "RNFBAdMobInterstitialDelegate.h"


@implementation RNFBAdMobInterstitialDelegate

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  static RNFBAdMobInterstitialDelegate *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBAdMobInterstitialDelegate alloc] init];
  });
  return sharedInstance;
}

#pragma mark -
#pragma mark Helper Methods

+ (void)sendInterstitialEvent:(NSString *)type
                    requestId:(NSNumber *)requestId
                     adUnitId:(NSString *)adUnitId
                        error:(nullable NSDictionary *)error {
  [RNFBAdMobCommon sendAdEvent:EVENT_INTERSTITIAL requestId:requestId type:type adUnitId:adUnitId error:error data:nil];
}


#pragma mark -
#pragma mark GADInterstitialDelegate Methods

- (void)interstitialDidReceiveAd:(GADInterstitial *)ad {
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_LOADED requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:nil];
}

- (void)interstitial:(GADInterstitial *)ad didFailToReceiveAdWithError:(GADRequestError *)error {
  NSDictionary *codeAndMessage = [RNFBAdMobCommon getCodeAndMessageFromAdError:error];
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_ERROR requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:codeAndMessage];
}

- (void)interstitialWillPresentScreen:(GADInterstitial *)ad {
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_OPENED requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:nil];
}

- (void)interstitialDidDismissScreen:(GADInterstitial *)ad {
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_CLOSED requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:nil];
}

- (void)interstitialWillLeaveApplication:(GADInterstitial *)ad {
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_CLICKED requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:nil];
  [RNFBAdMobInterstitialDelegate sendInterstitialEvent:ADMOB_EVENT_LEFT_APPLICATION requestId:[(RNFBGADInterstitial *) ad requestId] adUnitId:ad.adUnitID error:nil];
}


@end
