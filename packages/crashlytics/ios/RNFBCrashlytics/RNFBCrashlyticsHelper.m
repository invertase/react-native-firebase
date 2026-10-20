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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseCrashlytics/FirebaseCrashlytics.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseCrashlytics/FirebaseCrashlytics.h>
#else
@import FirebaseCore;
@import FirebaseCrashlytics;
#endif

#if __has_include(<RNFBCrashlytics/RNFBCrashlytics-Swift.h>)
#import <RNFBCrashlytics/RNFBCrashlytics-Swift.h>
#elif __has_include("RNFBCrashlytics-Swift.h")
#import "RNFBCrashlytics-Swift.h"
#elif __has_include("RNFBCrashlyticsDebuggerProbe-Swift.inc")
#import "RNFBCrashlyticsDebuggerProbe-Swift.inc"
#else
#error "RNFBCrashlyticsDebuggerProbe Swift interface not found"
#endif

#import <stdatomic.h>

#import "RNFBCrashlyticsHelper.h"

@implementation RNFBCrashlyticsHelper

+ (BOOL)isDebuggerAttached {
  return [RNFBCrashlyticsDebuggerProbe isDebuggerAttached];
}

+ (void)checkForUnsentReportsWithCompletion:(void (^)(BOOL unsentReports))completion {
  [[FIRCrashlytics crashlytics] checkForUnsentReportsWithCompletion:^(BOOL unsentReports) {
    if (completion != nil) {
      completion(unsentReports);
    }
  }];
}

+ (void)deleteUnsentReports {
  [[FIRCrashlytics crashlytics] deleteUnsentReports];
}

+ (BOOL)didCrashDuringPreviousExecution {
  return [[FIRCrashlytics crashlytics] didCrashDuringPreviousExecution];
}

+ (void)log:(NSString *)message {
  [[FIRCrashlytics crashlytics] log:message];
}

+ (void)sendUnsentReports {
  [[FIRCrashlytics crashlytics] sendUnsentReports];
}

+ (void)setCustomValue:(NSString *)value forKey:(NSString *)key {
  [[FIRCrashlytics crashlytics] setCustomValue:value forKey:key];
}

+ (void)setCustomKeysAndValues:(NSDictionary *)attributes {
  NSArray *keys = [attributes allKeys];
  for (NSString *key in keys) {
    [[FIRCrashlytics crashlytics] setCustomValue:attributes[key] forKey:key];
  }
}

+ (void)setUserID:(NSString *)userId {
  [[FIRCrashlytics crashlytics] setUserID:userId];
}

+ (void)recordJavaScriptErrorWithMessage:(NSString *)message
                                  frames:(NSArray<NSDictionary *> *)frames
             isUnhandledPromiseRejection:(BOOL)isUnhandledPromiseRejection {
  NSMutableArray *stackTrace = [[NSMutableArray alloc] init];
  for (NSDictionary *stackFrame in frames) {
    NSString *symbol = stackFrame[@"fn"];
    NSString *file = stackFrame[@"file"];
    uint32_t line = (uint32_t)[stackFrame[@"line"] unsignedIntValue];
    FIRStackFrame *customFrame = [FIRStackFrame stackFrameWithSymbol:symbol file:file line:line];
    [stackTrace addObject:customFrame];
  }

  NSString *name = @"JavaScriptError";
  if (isUnhandledPromiseRejection) {
    name = @"UnhandledPromiseRejection";
  }

  FIRExceptionModel *exceptionModel = [FIRExceptionModel exceptionModelWithName:name
                                                                         reason:message];
  exceptionModel.stackTrace = stackTrace;

  [[FIRCrashlytics crashlytics] recordExceptionModel:exceptionModel];
}

@end

const NSTimeInterval RNFBCrashlyticsFatalExitWatchdogTimeout = 2.0;

@implementation RNFBCrashlyticsFatalExit {
  dispatch_block_t _terminator;
  dispatch_queue_t _terminateQueue;
  dispatch_queue_t _watchdogQueue;
  NSTimeInterval _watchdogTimeout;
  atomic_bool _exiting;
  atomic_bool _terminated;
}

+ (instancetype)shared {
  static RNFBCrashlyticsFatalExit *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBCrashlyticsFatalExit alloc]
        initWithTerminator:^{
          // Coverage exception: ends the process, so no test can run it.
          exit(0);
        }
            terminateQueue:dispatch_get_main_queue()
             watchdogQueue:dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0)
           watchdogTimeout:RNFBCrashlyticsFatalExitWatchdogTimeout];
  });
  return shared;
}

- (instancetype)initWithTerminator:(dispatch_block_t)terminator
                    terminateQueue:(dispatch_queue_t)terminateQueue
                     watchdogQueue:(dispatch_queue_t)watchdogQueue
                   watchdogTimeout:(NSTimeInterval)watchdogTimeout {
  if (self = [super init]) {
    _terminator = [terminator copy];
    _terminateQueue = terminateQueue;
    _watchdogQueue = watchdogQueue;
    _watchdogTimeout = watchdogTimeout;
    atomic_init(&_exiting, false);
    atomic_init(&_terminated, false);
  }
  return self;
}

- (BOOL)recordThenTerminate:(dispatch_block_t)record {
  if (atomic_exchange(&_exiting, true)) {
    return NO;
  }
  @try {
    record();
  } @catch (NSException *exception) {
    // The guard is already set, so terminate anyway rather than leave the app running with every
    // later fatal ignored.
    NSLog(@"RNFBCrashlytics: recording JS fatal failed: %@", exception);
  }
  dispatch_block_t terminateOnce = ^{
    [self terminateOnce];
  };
  // FIFO behind the Crashlytics save block that recordExceptionModel: enqueued on main.
  dispatch_async(_terminateQueue, terminateOnce);
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(_watchdogTimeout * NSEC_PER_SEC)),
                 _watchdogQueue, terminateOnce);
  return YES;
}

- (void)terminateOnce {
  if (!atomic_exchange(&_terminated, true)) {
    _terminator();
  }
}

@end
