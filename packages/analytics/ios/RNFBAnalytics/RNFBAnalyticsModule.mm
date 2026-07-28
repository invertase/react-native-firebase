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

#if __has_include(<RNFBAnalytics/RNFBAnalytics-Swift.h>)
// This import will work in situations where `use_frameworks!` is in use
#import <RNFBAnalytics/RNFBAnalytics-Swift.h>
#elif __has_include("RNFBAnalytics-Swift.h")
// If `use_frameworks!` is not in use (for example, while using pre-built
// react-native core) then header imports based on frameworks assumptions fail.
// So, if frameworks are not available, fall back to importing the header directly, it
// should be findable from a header search path pointing to the build
// directory. See firebase-ios-sdk#12611 for more context.
#import "RNFBAnalytics-Swift.h"
#endif
#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBAnalyticsModule.h"

/** GA4 parameters that must be sent as integer NSNumber values (not doubles from JS). */
static NSArray<NSString *> *RNFBAnalyticsLongNumericParameterKeys(void) {
  static NSArray<NSString *> *keys;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    keys = @[
      kFIRParameterQuantity,
      kFIRParameterIndex,
      kFIRParameterLevel,
      kFIRParameterNumberOfNights,
      kFIRParameterNumberOfPassengers,
      kFIRParameterNumberOfRooms,
      kFIRParameterScore,
    ];
  });
  return keys;
}

@implementation RNFBAnalyticsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboAnalytics)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAnalyticsSpecJSI>(params);
}

#pragma mark -
#pragma mark Firebase Analytics Methods

- (void)logEvent:(NSString *)name
          params:(NSDictionary *)params
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics logEventWithName:name parameters:[self cleanJavascriptParams:params]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)setAnalyticsCollectionEnabled:(BOOL)enabled
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setAnalyticsCollectionEnabled:enabled];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)setUserId:(NSString *)id
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setUserID:[self convertNSNullToNil:id]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)setUserProperty:(NSString *)name
                  value:(NSString *)value
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setUserPropertyString:[self convertNSNullToNil:value] forName:name];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)setUserProperties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  @try {
    [properties enumerateKeysAndObjectsUsingBlock:^(id key, id value, BOOL *stop) {
      [FIRAnalytics setUserPropertyString:[self convertNSNullToNil:value] forName:key];
    }];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)resetAnalyticsData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics resetAnalyticsData];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)setSessionTimeoutDuration:(double)milliseconds
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [FIRAnalytics setSessionTimeoutInterval:milliseconds / 1000];
  return resolve([NSNull null]);
}

- (void)getAppInstanceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  return resolve([FIRAnalytics appInstanceID]);
}

- (void)getSessionId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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
    if (completed) {
      return;
    }
    completed = YES;

    // Occasionally sessionID is 0 despite nil error, reject as if it were an error
    // https://github.com/firebase/firebase-ios-sdk/issues/15258
    if (!error && [NSNumber numberWithLongLong:sessionID] == 0) {
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
  }];
}

- (void)setDefaultEventParameters:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics setDefaultEventParameters:[self cleanJavascriptParams:params]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress
                                                      resolve:(RCTPromiseResolveBlock)resolve
                                                       reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSString *)hashedEmailAddress
                                                            resolve:(RCTPromiseResolveBlock)resolve
                                                             reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *emailAddress = [self dataFromHexString:hashedEmailAddress];
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber
                                                     resolve:(RCTPromiseResolveBlock)resolve
                                                      reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSString *)hashedPhoneNumber
                                                           resolve:(RCTPromiseResolveBlock)resolve
                                                            reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *phoneNumber = [self dataFromHexString:hashedPhoneNumber];
    [FIRAnalytics initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)logTransaction:(NSString *)transactionId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  if (@available(iOS 15.0, macOS 12.0, *)) {
    RNFBAnalyticsLogTransaction *handler = [[RNFBAnalyticsLogTransaction alloc] init];
    [handler logTransactionWithTransactionId:transactionId resolve:resolve reject:reject];
  } else {
    reject(@"firebase_analytics", @"logTransaction() is only supported on iOS 15.0 or newer", nil);
  }
}

- (void)setConsent:(NSDictionary *)consentSettings
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
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
          [self rnfb_coerceLongNumericParametersInMutableDictionary:item];
          [newItems addObject:[item copy]];
        }];
    newParams[kFIRParameterItems] = [newItems copy];
  }
  [self rnfb_coerceLongNumericParametersInMutableDictionary:newParams];
  [self rnfb_coerceSuccessParameterInMutableDictionary:newParams];
  NSNumber *extendSession = [newParams valueForKey:kFIRParameterExtendSession];
  if ([extendSession isEqualToNumber:@1]) {
    newParams[kFIRParameterExtendSession] = @YES;
  }
  return [newParams copy];
}

- (void)rnfb_coerceLongNumericParametersInMutableDictionary:(NSMutableDictionary *)dict {
  for (NSString *key in RNFBAnalyticsLongNumericParameterKeys()) {
    id value = dict[key];
    if (value != nil && value != [NSNull null]) {
      dict[key] = @([value integerValue]);
    }
  }
}

- (void)rnfb_coerceSuccessParameterInMutableDictionary:(NSMutableDictionary *)dict {
  id value = dict[kFIRParameterSuccess];
  if (value == nil || value == [NSNull null]) {
    return;
  }
  int success = 0;
  if ([value isKindOfClass:[NSString class]]) {
    NSString *lower = [(NSString *)value lowercaseString];
    if ([lower isEqualToString:@"true"] || [lower isEqualToString:@"yes"] ||
        [lower isEqualToString:@"1"]) {
      success = 1;
    }
  } else {
    success = [value boolValue] ? 1 : 0;
  }
  dict[kFIRParameterSuccess] = @(success);
}

/// Converts null values received over the bridge from NSNull to nil
/// @param value Nullable string value
- (NSString *)convertNSNullToNil:(NSString *)value {
  return [value isEqual:[NSNull null]] ? nil : value;
}

/// Converts a hex string to NSData
/// @param hexString A hex string (e.g., SHA256 hash as 64-character hex string)
/// @return NSData containing the decoded bytes (e.g., 32 bytes for SHA256)
- (NSData *)dataFromHexString:(NSString *)hexString {
  NSMutableData *data = [NSMutableData dataWithCapacity:hexString.length / 2];
  unsigned char wholeByte;
  char byteChars[3] = {'\0', '\0', '\0'};
  for (NSUInteger i = 0; i < hexString.length; i += 2) {
    byteChars[0] = [hexString characterAtIndex:i];
    byteChars[1] = [hexString characterAtIndex:i + 1];
    wholeByte = strtol(byteChars, NULL, 16);
    [data appendBytes:&wholeByte length:1];
  }
  return data;
}

@end
