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

#ifndef RNFBNullSentinelInterceptor_h
#define RNFBNullSentinelInterceptor_h

#import <Foundation/Foundation.h>

/**
 * Intercepts TurboModule conversions to automatically decode null sentinels.
 *
 * iOS TurboModules strip null values from object properties during serialization.
 * See: https://github.com/facebook/react-native/issues/52802
 * The JavaScript side encodes nulls as sentinel objects,
 * and this interceptor automatically converts them back to NSNull before they
 * reach module implementation methods.
 *
 * This class uses method swizzling on RCTCxxConvert to intercept all TurboModule
 * data conversion methods (JS_*Module_Spec*Data:), decoding sentinels before the
 * data reaches the C++ bridging layer and ultimately your module methods.
 */
@interface RNFBNullSentinelInterceptor : NSObject

/**
 * Initializes the null sentinel interceptor.
 * This swizzles RCTCxxConvert (TurboModule converter) to automatically decode null sentinels.
 * Called automatically when the class is loaded via +load.
 */
+ (void)initialize;

@end

#endif
