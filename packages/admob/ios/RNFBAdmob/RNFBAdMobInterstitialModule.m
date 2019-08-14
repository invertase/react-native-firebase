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

#import <React/RCTUtils.h>

#import "RNFBAdMobInterstitialModule.h"
#import "RNFBAdMobCommon.h"
#import "RNFBSharedUtils.h"
#import "RNFBAdMobInterstitialDelegate.h"

static __strong NSMutableDictionary *interstitialMap;

@implementation RNFBAdMobInterstitialModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    interstitialMap = [[NSMutableDictionary alloc] init];
  });
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSNumber *id in [interstitialMap allKeys]) {
    RNFBGADInterstitial * ad = interstitialMap[id];
    [ad setRequestId:@-1];
    [interstitialMap removeObjectForKey:id];
  }
}

#pragma mark -
#pragma mark Firebase AdMob Methods

RCT_EXPORT_METHOD(interstitialLoad
  :
  (nonnull
    NSNumber *)requestId
    :(NSString *)adUnitId
    :(NSDictionary *)adRequestOptions
) {
  RNFBGADInterstitial *interstitial = [[RNFBGADInterstitial alloc] initWithAdUnitID:adUnitId];
  [interstitial setRequestId:requestId];
  [interstitial loadRequest:[RNFBAdMobCommon buildAdRequest:adRequestOptions]];
  interstitial.delegate = [RNFBAdMobInterstitialDelegate sharedInstance];
  interstitialMap[requestId] = interstitial;
}

RCT_EXPORT_METHOD(interstitialShow
  :
  (nonnull
    NSNumber *)requestId
    :(NSDictionary *)showOptions
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  GADInterstitial *interstitial = interstitialMap[requestId];
  if (interstitial.isReady) {
    [interstitial presentFromRootViewController:RCTSharedApplication().delegate.window.rootViewController];
    resolve([NSNull null]);
  } else {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
        @"code": @"not-ready",
        @"message": @"Interstitial ad attempted to show but was not ready.",
    } mutableCopy]];
  }
}



@end
