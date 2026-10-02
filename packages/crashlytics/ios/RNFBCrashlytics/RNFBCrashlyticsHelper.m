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
