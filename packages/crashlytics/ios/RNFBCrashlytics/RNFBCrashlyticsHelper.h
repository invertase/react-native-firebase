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

/** Upper bound (seconds) a JS fatal waits for its record to save before the process exits. */
FOUNDATION_EXPORT const NSTimeInterval RNFBCrashlyticsFatalExitWatchdogTimeout;

/**
 * Records a JS fatal, then terminates the process once the record has had a chance to save.
 *
 * `-[FIRCrashlytics recordExceptionModel:]` saves asynchronously: once Crashlytics' context-init
 * promise is fulfilled, the save block is dispatched to the main queue. Terminating on the
 * calling queue right after recording usually loses that save. Instead the terminator is
 * enqueued on `terminateQueue` (the main queue in production), so it runs FIFO after the save
 * block. A watchdog on `watchdogQueue` terminates after `watchdogTimeout` if `terminateQueue`
 * is hung. The terminator runs at most once.
 *
 * Known limit: a JS fatal recorded before Crashlytics finished initialising queues its save as a
 * promise observer instead of a main-queue block, so it can still be lost.
 * The FIFO ordering also relies on FBLPromise's default dispatch queue being the main queue; if an
 * app changes it, the save runs off the main queue and the terminator can run first, losing the
 * report. The watchdog only covers a hung `terminateQueue`.
 */
@interface RNFBCrashlyticsFatalExit : NSObject

/** Production instance: terminates with `exit(0)` on the main queue, 2 s watchdog. */
+ (instancetype)shared;

- (instancetype)initWithTerminator:(dispatch_block_t)terminator
                    terminateQueue:(dispatch_queue_t)terminateQueue
                     watchdogQueue:(dispatch_queue_t)watchdogQueue
                   watchdogTimeout:(NSTimeInterval)watchdogTimeout NS_DESIGNATED_INITIALIZER;

- (instancetype)init NS_UNAVAILABLE;

/**
 * Runs `record` synchronously, then schedules termination, even when `record` raises. Returns NO
 * without running `record` when an earlier call already started terminating (a second fatal
 * while waiting).
 */
- (BOOL)recordThenTerminate:(dispatch_block_t)record;

@end
