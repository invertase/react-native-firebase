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
 *
 * Swizzling is scheduled on the main queue from +load so codegen category methods
 * on RCTCxxConvert are attached before the method list is copied.
 */
@interface RNFBNullSentinelInterceptor : NSObject

/**
 * Schedules TurboModule converter swizzling on the main queue.
 * Called automatically when the class is loaded via +load.
 */
+ (void)load;

/**
 * Production entry used by +load. Schedules swizzleRCTConvertMethods on the main
 * queue behind a process-wide once-token.
 */
+ (void)scheduleSwizzleOnMainQueue;

/**
 * Testable schedule path. When turboConvertClass is Nil, behaves like production
 * (swizzleRCTConvertMethods). When non-Nil, swizzles that class instead so unit
 * tests can observe deferral without RCTCxxConvert.
 */
+ (void)scheduleSwizzleOnMainQueueWithOnceToken:(dispatch_once_t *)onceToken
                              turboConvertClass:(Class)turboConvertClass;

/**
 * Looks up RCTCxxConvert and swizzles matching TurboModule conversion methods.
 */
+ (void)swizzleRCTConvertMethods;

/**
 * Swizzles JS_NativeRNFBTurbo*_Spec* class methods on the given converter class
 * so decodeNullSentinels runs before the original IMP.
 */
+ (void)swizzleTurboModuleConversions:(Class)cxxConvertClass;

@end

#endif
