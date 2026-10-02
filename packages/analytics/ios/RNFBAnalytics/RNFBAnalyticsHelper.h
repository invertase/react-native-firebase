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

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRAnalytics` and the Swift param cleaner / consent mapper /
// log-transaction types for RNFBAnalyticsModule. This keeps
// RNFBAnalyticsModule.mm free of Firebase imports and `*-Swift.h`: under
// SPM an Objective-C++ (.mm) TurboModule cannot `@import` Firebase (or
// parse a Swift-generated header that uses module imports) when C++
// modules are disabled (required by React Native's JSI headers).
@interface RNFBAnalyticsHelper : NSObject

/**
 * setDefaultEventParameters seam: decode New Architecture null sentinels to NSNull.
 * FIRAnalytics clears a default when the value is NSNull (not the same as omitting the key).
 */
+ (NSDictionary *_Nullable)decodedParams:(NSDictionary *_Nullable)params;

/**
 * logEvent seam: decode sentinels then drop NSNull keys.
 * logEventWithName:parameters: only accepts String/Int/Double; null must not be forwarded
 * (and must not be mapped to @"").
 */
+ (NSDictionary *_Nullable)logEventParams:(NSDictionary *_Nullable)params;

/**
 * setUserProperties seam: decode sentinels then omit NSNull keys.
 * NSDictionary cannot store nil; omitted keys make subscript return nil, the same value
 * setUserPropertyString:forName: uses to clear a property.
 */
+ (NSDictionary *_Nullable)decodedUserProperties:(NSDictionary *_Nullable)properties;

+ (void)logEvent:(NSString *)name
          params:(NSDictionary *)params
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject;

+ (void)setAnalyticsCollectionEnabled:(BOOL)enabled
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject;

+ (void)setUserId:(NSString *)userId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

+ (void)setUserProperty:(NSString *)name
                  value:(NSString *)value
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject;

+ (void)setUserProperties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;

+ (void)resetAnalyticsData:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)setSessionTimeoutDuration:(double)milliseconds
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject;

+ (void)getAppInstanceId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)getSessionId:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject;

+ (void)setDefaultEventParameters:(NSDictionary *)params
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject;

+ (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress
                                                      resolve:(RCTPromiseResolveBlock)resolve
                                                       reject:(RCTPromiseRejectBlock)reject;

+ (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSString *)hashedEmailAddress
                                                            resolve:(RCTPromiseResolveBlock)resolve
                                                             reject:(RCTPromiseRejectBlock)reject;

+ (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber
                                                     resolve:(RCTPromiseResolveBlock)resolve
                                                      reject:(RCTPromiseRejectBlock)reject;

+ (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSString *)hashedPhoneNumber
                                                           resolve:(RCTPromiseResolveBlock)resolve
                                                            reject:(RCTPromiseRejectBlock)reject;

+ (void)logTransaction:(NSString *)transactionId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

+ (void)setConsent:(NSDictionary *)consentSettings
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

@end
