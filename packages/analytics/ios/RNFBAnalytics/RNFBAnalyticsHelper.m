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
#elif __has_include(<FirebaseAnalytics/FirebaseAnalytics.h>)
#import <FirebaseAnalytics/FirebaseAnalytics.h>
#import <FirebaseCore/FirebaseCore.h>
#else
@import FirebaseCore;
@import FirebaseAnalytics;
#endif

#if __has_include(<RNFBAnalytics/RNFBAnalytics-Swift.h>)
#import <RNFBAnalytics/RNFBAnalytics-Swift.h>
#elif __has_include("RNFBAnalytics-Swift.h")
#import "RNFBAnalytics-Swift.h"
#elif __has_include("RNFBAnalyticsJavascriptParamsCleaner-Swift.inc")
#import "RNFBAnalyticsJavascriptParamsCleaner-Swift.inc"
#if __has_include("RNFBAnalytics/RNFBAnalyticsLogTransactionHostStub.h")
#import "RNFBAnalytics/RNFBAnalyticsLogTransactionHostStub.h"
#endif
#else
#error "RNFBAnalytics Swift interface not found"
#endif

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#endif

#import "RNFBAnalyticsHelper.h"
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBAnalyticsHelper

+ (NSDictionary *)decodedParams:(NSDictionary *)params {
  return [RNFBNullSentinelDecoder decodeNullSentinels:params];
}

+ (NSDictionary *)logEventParams:(NSDictionary *)params {
  return [self dictionaryByDecodingAndOmittingNSNull:params];
}

+ (NSDictionary *)decodedUserProperties:(NSDictionary *)properties {
  return [self dictionaryByDecodingAndOmittingNSNull:properties];
}

+ (NSDictionary *)dictionaryByDecodingAndOmittingNSNull:(NSDictionary *)params {
  return [self dictionaryByOmittingNSNull:[RNFBNullSentinelDecoder decodeNullSentinels:params]];
}

+ (NSDictionary *)dictionaryByOmittingNSNull:(id)decoded {
  if (decoded == nil || decoded == [NSNull null]) {
    return nil;
  }
  if (![decoded isKindOfClass:[NSDictionary class]]) {
    return nil;
  }
  return [self valueByOmittingNSNull:decoded];
}

+ (id)valueByOmittingNSNull:(id)value {
  if (value == nil || value == [NSNull null]) {
    return nil;
  }
  if ([value isKindOfClass:[NSDictionary class]]) {
    NSDictionary *dict = (NSDictionary *)value;
    NSMutableDictionary *normalized = [NSMutableDictionary dictionaryWithCapacity:dict.count];
    for (id key in dict) {
      id child = [self valueByOmittingNSNull:dict[key]];
      if (child != nil) {
        normalized[key] = child;
      }
    }
    return normalized;
  }
  if ([value isKindOfClass:[NSArray class]]) {
    NSArray *array = (NSArray *)value;
    NSMutableArray *normalized = [NSMutableArray arrayWithCapacity:array.count];
    for (id child in array) {
      id processed = [self valueByOmittingNSNull:child];
      if (processed != nil) {
        [normalized addObject:processed];
      }
    }
    return normalized;
  }
  return value;
}

+ (void)logEvent:(NSString *)name
          params:(NSDictionary *)params
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSDictionary *decoded = [self logEventParams:params];
    [FIRAnalytics
        logEventWithName:name
              parameters:[RNFBAnalyticsJavascriptParamsCleaner cleanJavascriptParams:decoded]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)setAnalyticsCollectionEnabled:(BOOL)enabled
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setAnalyticsCollectionEnabled:enabled];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)setUserId:(NSString *)userId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setUserID:[RNFBAnalyticsJavascriptParamsCleaner convertNSNullToNil:userId]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

+ (void)setUserProperty:(NSString *)name
                  value:(NSString *)value
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics
        setUserPropertyString:[RNFBAnalyticsJavascriptParamsCleaner convertNSNullToNil:value]
                      forName:name];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

+ (void)setUserProperties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  @try {
    // Seam omits NSNull keys (subscript → nil). Iterate the original keys so a cleared
    // property still reaches setUserPropertyString:forName: (nil removes the property).
    NSDictionary *decoded = [self decodedUserProperties:properties];
    for (NSString *key in properties) {
      [FIRAnalytics setUserPropertyString:decoded[key] forName:key];
    }
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

+ (void)resetAnalyticsData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics resetAnalyticsData];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

+ (void)setSessionTimeoutDuration:(double)milliseconds
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  [FIRAnalytics setSessionTimeoutInterval:milliseconds / 1000];
  return resolve([NSNull null]);
}

+ (void)getAppInstanceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  return resolve([FIRAnalytics appInstanceID]);
}

+ (void)getSessionId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  __block BOOL completed = NO;
  const int64_t timeoutNs = (int64_t)(60 * NSEC_PER_SEC);

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, timeoutNs), dispatch_get_main_queue(), ^{
    if (completed) {
      return;
    }
    completed = YES;
    DLog(@"getSessionId timed_out: no SDK callback within 60 seconds");
    resolve([NSNull null]);
  });

  [FIRAnalytics sessionIDWithCompletion:^(int64_t sessionID, NSError *_Nullable error) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (completed) {
        return;
      }
      completed = YES;

      // Occasionally sessionID is 0 despite nil error, treat as if it were an error
      // https://github.com/firebase/firebase-ios-sdk/issues/15258
      if (!error && sessionID == 0) {
        DLog(@"getSessionId zero_without_error: sessionID=0 (firebase-ios-sdk#15258)");
        return resolve([NSNull null]);
      }

      if (error) {
        DLog(@"getSessionId sdk_error: domain=%@ code=%ld description=%@", error.domain,
             (long)error.code, error.localizedDescription ?: @"(none)");
        return resolve([NSNull null]);
      }

      DLog(@"getSessionId success: sessionID=%lld", sessionID);
      return resolve([NSNumber numberWithLongLong:sessionID]);
    });
  }];
}

+ (void)setDefaultEventParameters:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSDictionary *decoded = [self decodedParams:params];
    [FIRAnalytics setDefaultEventParameters:[RNFBAnalyticsJavascriptParamsCleaner
                                                cleanJavascriptParams:decoded]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress
                                                      resolve:(RCTPromiseResolveBlock)resolve
                                                       reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSString *)hashedEmailAddress
                                                            resolve:(RCTPromiseResolveBlock)resolve
                                                             reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *emailAddress =
        [RNFBAnalyticsJavascriptParamsCleaner dataFromSHA256HexString:hashedEmailAddress];
    if (emailAddress == nil) {
      reject(@"firebase_analytics", @"Expected a 64-character SHA-256 hex string", nil);
      return;
    }
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber
                                                     resolve:(RCTPromiseResolveBlock)resolve
                                                      reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSString *)hashedPhoneNumber
                                                           resolve:(RCTPromiseResolveBlock)resolve
                                                            reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *phoneNumber =
        [RNFBAnalyticsJavascriptParamsCleaner dataFromSHA256HexString:hashedPhoneNumber];
    if (phoneNumber == nil) {
      reject(@"firebase_analytics", @"Expected a 64-character SHA-256 hex string", nil);
      return;
    }
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)logTransaction:(NSString *)transactionId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  if (@available(iOS 15.0, macOS 12.0, *)) {
    RNFBAnalyticsLogTransaction *handler = [[RNFBAnalyticsLogTransaction alloc] init];
    [handler logTransactionWithTransactionId:transactionId resolve:resolve reject:reject];
  } else {
    reject(@"firebase_analytics", @"logTransaction() is only supported on iOS 15.0 or newer", nil);
  }
}

+ (void)setConsent:(NSDictionary *)consentSettings
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSDictionary *consent =
        [RNFBAnalyticsConsentSettingsMapper consentDictionaryFromSettings:consentSettings];
    [FIRAnalytics setConsent:consent];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

@end
