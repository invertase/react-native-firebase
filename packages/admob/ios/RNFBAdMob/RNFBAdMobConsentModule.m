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

#import "RNFBAdMobConsentModule.h"
#import <RNFBApp/RNFBSharedUtils.h>

@implementation RNFBAdMobConsentModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase AdMob Methods

RCT_EXPORT_METHOD(requestInfoUpdate:
  (NSArray *) publisherIds
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACConsentInformation *consentInformation = [PACConsentInformation sharedInstance];

  id completionHandler = ^(NSError *_Nullable error) {
    if (error != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": @"consent-update-failed",
          @"message": error.localizedDescription,
      } mutableCopy]];
    } else {
      resolve(@{
          @"status": @(consentInformation.consentStatus),
          @"isRequestLocationInEeaOrUnknown": @(consentInformation.requestLocationInEEAOrUnknown),
      });
    }
  };

  [consentInformation requestConsentInfoUpdateForPublisherIdentifiers:publisherIds completionHandler:completionHandler];
}

RCT_EXPORT_METHOD(showForm:
  (NSDictionary *) options
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  NSString *privacyPolicy = options[@"privacyPolicy"];
  PACConsentForm *form = [[PACConsentForm alloc] initWithApplicationPrivacyPolicyURL:[NSURL URLWithString:privacyPolicy]];

  form.shouldOfferPersonalizedAds = [options[@"withPersonalizedAds"] boolValue];
  form.shouldOfferNonPersonalizedAds = [options[@"withNonPersonalizedAds"] boolValue];
  form.shouldOfferAdFree = [options[@"withAdFree"] boolValue];

  id dismissCompletionBlock = ^(NSError *error, BOOL userPrefersAdFree) {
    if (error != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": @"consent-form-error",
          @"message": error.localizedDescription,
      } mutableCopy]];
    } else {
      resolve(@{
          @"status": @(PACConsentInformation.sharedInstance.consentStatus),
          @"userPrefersAdFree": @(userPrefersAdFree),
      });
    }
  };

  [form loadWithCompletionHandler:^(NSError *error) {
    if (error != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": @"consent-form-error",
          @"message": error.localizedDescription,
      } mutableCopy]];
    } else {
      [form presentFromViewController:[UIApplication sharedApplication].delegate.window.rootViewController dismissCompletion:dismissCompletionBlock];
    }
  }];
}

RCT_EXPORT_METHOD(getStatus
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACConsentInformation *consentInformation = [PACConsentInformation sharedInstance];
  resolve(@(consentInformation.consentStatus));
}

RCT_EXPORT_METHOD(setStatus
  :(nonnull NSNumber *)status
  :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACConsentStatus consentStatus = PACConsentStatusUnknown;

  if ([status integerValue] == [@0 integerValue]) {
    consentStatus = PACConsentStatusUnknown;
  } else if ([status integerValue] == [@1 integerValue]) {
    consentStatus = PACConsentStatusNonPersonalized;
  } else if ([status integerValue] == [@2 integerValue]) {
    consentStatus = PACConsentStatusPersonalized;
  }

  PACConsentInformation.sharedInstance.consentStatus = consentStatus;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(getAdProviders
  :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  NSArray *providers = PACConsentInformation.sharedInstance.adProviders;
  NSMutableArray *formattedProviders = [[NSMutableArray alloc] init];

  for (PACAdProvider *provider in providers) {
    NSMutableDictionary *formattedProvider = [[NSMutableDictionary alloc] init];
    formattedProvider[@"companyName"] = provider.name;
    formattedProvider[@"companyId"] = [provider.identifier stringValue];
    formattedProvider[@"privacyPolicyUrl"] = provider.privacyPolicyURL.absoluteString;
    [formattedProviders addObject:formattedProvider];
  }

  resolve(formattedProviders);
}

RCT_EXPORT_METHOD(setTagForUnderAgeOfConsent
  :(BOOL)tag
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACConsentInformation *consentInformation = [PACConsentInformation sharedInstance];
  consentInformation.tagForUnderAgeOfConsent = tag;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setDebugGeography
  :(nonnull NSNumber *)geography
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACDebugGeography debugGeography = PACDebugGeographyDisabled;

  if ([geography integerValue] == [@0 integerValue]) {
    debugGeography = PACDebugGeographyDisabled;
  } else if ([geography integerValue] == [@1 integerValue]) {
    debugGeography = PACDebugGeographyEEA;
  } else if ([geography integerValue] == [@2 integerValue]) {
    debugGeography = PACDebugGeographyNotEEA;
  }

  PACConsentInformation.sharedInstance.debugGeography = debugGeography;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(addTestDevices
  :(NSArray *)deviceIds
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  PACConsentInformation.sharedInstance.debugIdentifiers = deviceIds;
  resolve([NSNull null]);
}

@end
