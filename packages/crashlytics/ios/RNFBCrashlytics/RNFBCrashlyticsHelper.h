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

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRCrashlytics` / exception models for RNFBCrashlyticsModule, plus the
// Swift debugger probe. This keeps RNFBCrashlyticsModule.mm free of Firebase
// Crashlytics imports and `*-Swift.h`: under SPM an Objective-C++ (.mm)
// TurboModule cannot `@import` Firebase (or parse a Swift-generated header
// that uses module imports) when C++ modules are disabled (required by React
// Native's JSI headers).
@interface RNFBCrashlyticsHelper : NSObject

/** Cached `sysctl` debugger-attach probe (Swift `RNFBCrashlyticsDebuggerProbe`). */
+ (BOOL)isDebuggerAttached;

+ (void)checkForUnsentReportsWithCompletion:(void (^)(BOOL unsentReports))completion;

+ (void)deleteUnsentReports;

+ (BOOL)didCrashDuringPreviousExecution;

+ (void)log:(NSString *)message;

+ (void)sendUnsentReports;

+ (void)setCustomValue:(NSString *)value forKey:(NSString *)key;

/** Applies each entry via `setCustomValue:forKey:` (Module setAttributes path). */
+ (void)setCustomKeysAndValues:(NSDictionary *)attributes;

+ (void)setUserID:(NSString *)userId;

/**
 * Records a JS exception model.
 * Each frame dictionary uses keys: `fn` (symbol), `file`, `line` (number).
 */
+ (void)recordJavaScriptErrorWithMessage:(NSString *)message
                                  frames:(NSArray<NSDictionary *> *)frames
             isUnhandledPromiseRejection:(BOOL)isUnhandledPromiseRejection;

@end
