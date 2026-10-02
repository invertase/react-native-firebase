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

#import "RNFBPerfHandleRegistry.h"

NS_ASSUME_NONNULL_BEGIN

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// Firebase Performance / metric types and the Swift stop appliers /
// HTTP method mapper for RNFBPerfModule. This keeps RNFBPerfModule.mm free
// of Firebase imports and `*-Swift.h`: under SPM an Objective-C++ (.mm)
// TurboModule cannot `@import` Firebase (or parse a Swift-generated header
// that uses module imports) when C++ modules are disabled (required by
// React Native's JSI headers). On Mac Catalyst + SPM the upstream wrap
// target omits the real module — see RNFBPerfHelper.m stubs and
// https://github.com/firebase/firebase-ios-sdk/pull/16468.
@interface RNFBPerfHelper : NSObject

+ (NSDictionary *)constantsDictionary;

+ (void)setPerformanceCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject;

+ (void)setInstrumentationEnabled:(BOOL)enabled
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject;

+ (void)startTraceWithId:(NSNumber *)traceId
              identifier:(NSString *)identifier
              inRegistry:(RNFBPerfHandleRegistry *)registry;

+ (void)stopTraceWithId:(NSNumber *)traceId
                metrics:(nullable NSDictionary *)metrics
             attributes:(nullable NSDictionary *)attributes
             inRegistry:(RNFBPerfHandleRegistry *)registry;

+ (void)startHttpMetricWithId:(NSNumber *)metricId
                          url:(NSString *)url
                   httpMethod:(NSString *)httpMethod
                   inRegistry:(RNFBPerfHandleRegistry *)registry;

+ (void)stopHttpMetricWithId:(NSNumber *)metricId
                  attributes:(nullable NSDictionary *)attributes
            httpResponseCode:(nullable NSNumber *)httpResponseCode
          requestPayloadSize:(nullable NSNumber *)requestPayloadSize
         responsePayloadSize:(nullable NSNumber *)responsePayloadSize
         responseContentType:(nullable NSString *)responseContentType
                  inRegistry:(RNFBPerfHandleRegistry *)registry;

@end

NS_ASSUME_NONNULL_END
