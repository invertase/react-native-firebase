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

// This file deliberately never imports FirebaseAnalytics directly (no
// `#import <FirebaseAnalytics/...>`, no `@import FirebaseAnalytics;`).
// Under the local dynamic SPM umbrella (RNFBFirebase, see
// packages/app/ios/RNFBFirebase/Package.swift) only this pod's own generated
// Swift interop header is on the Clang header search path -- the individual
// Firebase framework headers are not. Every FIRAnalytics call needed here
// goes through RNFBAnalyticsFacade (RNFBAnalyticsFacade.swift), a plain
// Swift file that `import`s Firebase directly (unaffected by that
// restriction) and is exposed back to this .mm via the block below, the same
// pattern RNFBAnalyticsLogTransaction already uses for `logTransaction`.
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
#import <React/RCTUtils.h>

#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBAnalyticsModule.h"

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
    [RNFBAnalyticsFacade logEventWithName:name parameters:params];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)setAnalyticsCollectionEnabled:(BOOL)enabled
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade setAnalyticsCollectionEnabled:enabled];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)setUserId:(NSString *)id
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade setUserID:[self convertNSNullToNil:id]];
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
    [RNFBAnalyticsFacade setUserPropertyString:[self convertNSNullToNil:value] forName:name];
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
      [RNFBAnalyticsFacade setUserPropertyString:[self convertNSNullToNil:value] forName:key];
    }];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)resetAnalyticsData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade resetAnalyticsData];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

- (void)setSessionTimeoutDuration:(double)milliseconds
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsFacade setSessionTimeoutInterval:milliseconds / 1000];
  return resolve([NSNull null]);
}

- (void)getAppInstanceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  return resolve([RNFBAnalyticsFacade appInstanceID]);
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

  [RNFBAnalyticsFacade sessionIDWithCompletion:^(NSNumber *_Nullable sessionID) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (completed) {
        return;
      }
      completed = YES;

      if (sessionID == nil) {
        DLog(@"getSessionId sdk_error: RNFBAnalyticsFacade reported an SDK error");
        return resolve([NSNull null]);
      }

      DLog(@"getSessionId success: sessionID=%@", sessionID);
      return resolve(sessionID);
    });
  }];
}

- (void)setDefaultEventParameters:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade setDefaultEventParameters:params];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress
                                                      resolve:(RCTPromiseResolveBlock)resolve
                                                       reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade initiateOnDeviceConversionMeasurementWithEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSString *)hashedEmailAddress
                                                            resolve:(RCTPromiseResolveBlock)resolve
                                                             reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *emailAddress = RNFBAnalyticsDataFromSHA256HexString(hashedEmailAddress);
    if (emailAddress == nil) {
      reject(@"firebase_analytics", @"Expected a 64-character SHA-256 hex string", nil);
      return;
    }
    [RNFBAnalyticsFacade initiateOnDeviceConversionMeasurementWithHashedEmailAddress:emailAddress];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber
                                                     resolve:(RCTPromiseResolveBlock)resolve
                                                      reject:(RCTPromiseRejectBlock)reject {
  @try {
    [RNFBAnalyticsFacade initiateOnDeviceConversionMeasurementWithPhoneNumber:phoneNumber];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSString *)hashedPhoneNumber
                                                           resolve:(RCTPromiseResolveBlock)resolve
                                                            reject:(RCTPromiseRejectBlock)reject {
  @try {
    NSData *phoneNumber = RNFBAnalyticsDataFromSHA256HexString(hashedPhoneNumber);
    if (phoneNumber == nil) {
      reject(@"firebase_analytics", @"Expected a 64-character SHA-256 hex string", nil);
      return;
    }
    [RNFBAnalyticsFacade initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:phoneNumber];
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
    [RNFBAnalyticsFacade setConsentWithAnalyticsStorage:consentSettings[@"analytics_storage"]
                                               adStorage:consentSettings[@"ad_storage"]
                                              adUserData:consentSettings[@"ad_user_data"]
                                       adPersonalization:consentSettings[@"ad_personalization"]];
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }
  return resolve([NSNull null]);
}

#pragma mark -
#pragma mark Private methods

static int RNFBAnalyticsHexDigit(unichar character) {
  if (character >= '0' && character <= '9') {
    return character - '0';
  }
  if (character >= 'a' && character <= 'f') {
    return character - 'a' + 10;
  }
  if (character >= 'A' && character <= 'F') {
    return character - 'A' + 10;
  }
  return -1;
}

static NSData *RNFBAnalyticsDataFromSHA256HexString(NSString *hexString) {
  if (hexString.length != 64) {
    return nil;
  }

  unsigned char bytes[32];
  for (NSUInteger i = 0; i < sizeof(bytes); i++) {
    int high = RNFBAnalyticsHexDigit([hexString characterAtIndex:i * 2]);
    int low = RNFBAnalyticsHexDigit([hexString characterAtIndex:i * 2 + 1]);
    if (high < 0 || low < 0) {
      return nil;
    }
    bytes[i] = (high << 4) | low;
  }

  return [NSData dataWithBytes:bytes length:sizeof(bytes)];
}

/// Converts null values received over the bridge from NSNull to nil
/// @param value Nullable string value
- (NSString *)convertNSNullToNil:(NSString *)value {
  return [value isEqual:[NSNull null]] ? nil : value;
}

@end
