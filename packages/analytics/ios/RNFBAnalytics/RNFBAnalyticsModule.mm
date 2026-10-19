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

// This module intentionally has no Firebase imports and no `*-Swift.h` —
// see RNFBAnalyticsHelper.h. Every Firebase Analytics SDK call (and the
// Swift param cleaner / consent mapper / log-transaction types) is routed
// through the plain Objective-C RNFBAnalyticsHelper class instead, which
// can safely `@import` FirebaseAnalytics / import the generated Swift
// interface because it compiles as ObjC, not ObjC++.
#import "RNFBAnalyticsModule.h"
#import "RNFBAnalyticsHelper.h"

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
  [RNFBAnalyticsHelper logEvent:name params:params resolve:resolve reject:reject];
}

- (void)setAnalyticsCollectionEnabled:(BOOL)enabled
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setAnalyticsCollectionEnabled:enabled resolve:resolve reject:reject];
}

- (void)setUserId:(NSString *)id
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setUserId:id resolve:resolve reject:reject];
}

- (void)setUserProperty:(NSString *)name
                  value:(NSString *)value
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setUserProperty:name value:value resolve:resolve reject:reject];
}

- (void)setUserProperties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setUserProperties:properties resolve:resolve reject:reject];
}

- (void)resetAnalyticsData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper resetAnalyticsData:resolve reject:reject];
}

- (void)setSessionTimeoutDuration:(double)milliseconds
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setSessionTimeoutDuration:milliseconds resolve:resolve reject:reject];
}

- (void)getAppInstanceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper getAppInstanceId:resolve reject:reject];
}

- (void)getSessionId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper getSessionId:resolve reject:reject];
}

- (void)setDefaultEventParameters:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setDefaultEventParameters:params resolve:resolve reject:reject];
}

- (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress
                                                      resolve:(RCTPromiseResolveBlock)resolve
                                                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithEmailAddress:emailAddress
                                                                     resolve:resolve
                                                                      reject:reject];
}

- (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSString *)hashedEmailAddress
                                                            resolve:(RCTPromiseResolveBlock)resolve
                                                             reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper
      initiateOnDeviceConversionMeasurementWithHashedEmailAddress:hashedEmailAddress
                                                          resolve:resolve
                                                           reject:reject];
}

- (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber
                                                     resolve:(RCTPromiseResolveBlock)resolve
                                                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithPhoneNumber:phoneNumber
                                                                    resolve:resolve
                                                                     reject:reject];
}

- (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSString *)hashedPhoneNumber
                                                           resolve:(RCTPromiseResolveBlock)resolve
                                                            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:hashedPhoneNumber
                                                                          resolve:resolve
                                                                           reject:reject];
}

- (void)logTransaction:(NSString *)transactionId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper logTransaction:transactionId resolve:resolve reject:reject];
}

- (void)setConsent:(NSDictionary *)consentSettings
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAnalyticsHelper setConsent:consentSettings resolve:resolve reject:reject];
}

@end
