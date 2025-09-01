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

#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBAnalyticsModule.h"

@implementation RNFBAnalyticsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase Analytics Methods

RCT_EXPORT_METHOD(logEvent
                  : (NSString *)name params
                  : (NSDictionary *)params resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics logEventWithName:name parameters:[self cleanJavascriptParams:params]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setAnalyticsCollectionEnabled
                  : (BOOL)enabled resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics setAnalyticsCollectionEnabled:enabled];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserId
                  : (NSString *)id resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics setUserID:[self convertNSNullToNil:id]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserProperty
                  : (NSString *)name value
                  : (NSString *)value resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics setUserPropertyString:[self convertNSNullToNil:value] forName:name];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserProperties
                  : (NSDictionary *)properties resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [properties enumerateKeysAndObjectsUsingBlock:^(id key, id value, BOOL *stop) {
      [FIRAnalytics setUserPropertyString:[self convertNSNullToNil:value] forName:key];
    }];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(resetAnalyticsData
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics resetAnalyticsData];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setSessionTimeoutDuration
                  : (double)milliseconds resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [FIRAnalytics setSessionTimeoutInterval:milliseconds / 1000];
  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(getAppInstanceId
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  return resolve([FIRAnalytics appInstanceID]);
}

RCT_EXPORT_METHOD(getSessionId
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [FIRAnalytics sessionIDWithCompletion:^(int64_t sessionID, NSError *_Nullable error) {
    // Occasionally sessionID is 0 despite nil error, reject as if it were an error
    // https://github.com/firebase/firebase-ios-sdk/issues/15258
    if (!error && [NSNumber numberWithLongLong:sessionID] == 0) {
      DLog(@"Error getting session ID: sessionID is zero despite nil error");
      return resolve([NSNull null]);
    }

    if (error) {
      DLog(@"Error getting session ID: %@", error);
      return resolve([NSNull null]);
    } else {
      return resolve([NSNumber numberWithLongLong:sessionID]);
    }
  }];
}

RCT_EXPORT_METHOD(setDefaultEventParameters
                  : (NSDictionary *)params resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics setDefaultEventParameters:[self cleanJavascriptParams:params]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(initiateOnDeviceConversionMeasurementWithEmailAddress
                  : (NSString *)emailAddress resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(initiateOnDeviceConversionMeasurementWithHashedEmailAddress
                  : (NSString *)hashedEmailAddress resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    NSData *emailAddress = [hashedEmailAddress dataUsingEncoding:NSUTF8StringEncoding];
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(initiateOnDeviceConversionMeasurementWithPhoneNumber
                  : (NSString *)phoneNumber resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(initiateOnDeviceConversionMeasurementWithHashedPhoneNumber
                  : (NSString *)hashedPhoneNumber resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    NSData *phoneNumber = [hashedPhoneNumber dataUsingEncoding:NSUTF8StringEncoding];
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setConsent
                  : (NSDictionary *)consentSettings resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    BOOL analyticsStorage = [consentSettings[@"analytics_storage"] boolValue];
    BOOL adStorage = [consentSettings[@"ad_storage"] boolValue];
    BOOL adUserData = [consentSettings[@"ad_user_data"] boolValue];
    BOOL adPersonalization = [consentSettings[@"ad_personalization"] boolValue];
    [FIRAnalytics setConsent:@{
      FIRConsentTypeAnalyticsStorage : analyticsStorage ? FIRConsentStatusGranted
                                                        : FIRConsentStatusDenied,
      FIRConsentTypeAdStorage : adStorage ? FIRConsentStatusGranted : FIRConsentStatusDenied,
      FIRConsentTypeAdUserData : adUserData ? FIRConsentStatusGranted : FIRConsentStatusDenied,
      FIRConsentTypeAdPersonalization : adPersonalization ? FIRConsentStatusGranted
                                                          : FIRConsentStatusDenied,
    }];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

#pragma mark -
#pragma mark Private methods

- (NSDictionary *)cleanJavascriptParams:(NSDictionary *)params {
  NSMutableDictionary *newParams = [params mutableCopy];
  if (newParams[kFIRParameterItems]) {
    NSMutableArray *newItems = [NSMutableArray array];
    [(NSArray *)newParams[kFIRParameterItems]
        enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx, BOOL *_Nonnull stop) {
          NSMutableDictionary *item = [obj mutableCopy];
          if (item[kFIRParameterQuantity]) {
            item[kFIRParameterQuantity] = @([item[kFIRParameterQuantity] integerValue]);
          }
          [newItems addObject:[item copy]];
        }];
    newParams[kFIRParameterItems] = [newItems copy];
  }
  NSNumber *extendSession = [newParams valueForKey:kFIRParameterExtendSession];
  if ([extendSession isEqualToNumber:@1]) {
    newParams[kFIRParameterExtendSession] = @YES;
  }
  return [newParams copy];
}

/// Converts null values received over the bridge from NSNull to nil
/// @param value Nullable string value
- (NSString *)convertNSNullToNil:(NSString *)value {
  return [value isEqual:[NSNull null]] ? nil : value;
}

@end
