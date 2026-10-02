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

NS_ASSUME_NONNULL_BEGIN

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

@end

NS_ASSUME_NONNULL_END
