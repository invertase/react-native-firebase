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

#include <Foundation/Foundation.h>
#include <sys/sysctl.h>

#import <React/RCTLog.h>
#import <React/RCTUtils.h>

#import <Firebase/Firebase.h>
#import "RCTConvert.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBCrashlyticsInitProvider.h"
#import "RNFBCrashlyticsModule.h"
#import "RNFBPreferences.h"

@implementation RNFBCrashlyticsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isCrashlyticsCollectionEnabled"] =
      @([RCTConvert BOOL:@([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled])]);
  constants[@"isErrorGenerationOnJSCrashEnabled"] =
      @([RCTConvert BOOL:@([RNFBCrashlyticsInitProvider isErrorGenerationOnJSCrashEnabled])]);
  constants[@"isCrashlyticsJavascriptExceptionHandlerChainingEnabled"] =
      @([RCTConvert BOOL:@([RNFBCrashlyticsInitProvider
                             isCrashlyticsJavascriptExceptionHandlerChainingEnabled])]);
  if ([self isDebuggerAttached]) {
    RCTLog(
        @"Crashlytics - WARNING: Debugger detected. Crashlytics will not receive crash reports.");
  }
  return constants;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Crashlytics Methods

RCT_EXPORT_METHOD(checkForUnsentReports
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRCrashlytics crashlytics] checkForUnsentReportsWithCompletion:^(BOOL unsentReports) {
    resolve([NSNumber numberWithBool:unsentReports]);
  }];
}

RCT_EXPORT_METHOD(crash) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([self isDebuggerAttached]) {
      RCTLog(
          @"Crashlytics - WARNING: Debugger detected. Crashlytics will not receive crash reports.");
    }

    // https://firebase.google.com/docs/crashlytics/test-implementation?platform=ios recommends
    // using "@[][1]" to crash, but that gets caught by react-native and shown as a red box for
    // debug builds. Raise SIGSEGV here to generate a hard crash.
    int *p = 0;
    *p = 0;
  } else {
    RCTLog(@"Crashlytics - INFO: crashlytics collection is not enabled, not crashing.");
  }
}

RCT_EXPORT_METHOD(crashWithStackPromise
                  : (NSDictionary *)jsErrorDict resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([self isDebuggerAttached]) {
      RCTLog(
          @"Crashlytics - WARNING: Debugger detected. Crashlytics will not receive crash reports.");
    }
    [self recordJavaScriptError:jsErrorDict];

    // This is strongly discouraged by Apple as "it will appear as though your app has crashed".
    // Coincidentally, we are *in* a crash handler and have logged a crash report.
    // It seems like the one place calling exit cleanly is valid.
    ELog(@"Crashlytics - Crash logged. Terminating app.");
    exit(0);
  } else {
    RCTLog(@"Crashlytics - INFO: crashlytics collection is not enabled, not crashing.");
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(deleteUnsentReports) { [[FIRCrashlytics crashlytics] deleteUnsentReports]; }

RCT_EXPORT_METHOD(didCrashOnPreviousExecution
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  BOOL didCrash = [[FIRCrashlytics crashlytics] didCrashDuringPreviousExecution];
  resolve([NSNumber numberWithBool:didCrash]);
}

RCT_EXPORT_METHOD(log : (NSString *)message) { [[FIRCrashlytics crashlytics] log:message]; }

RCT_EXPORT_METHOD(logPromise
                  : (NSString *)message resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRCrashlytics crashlytics] log:message];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(sendUnsentReports) { [[FIRCrashlytics crashlytics] sendUnsentReports]; }

RCT_EXPORT_METHOD(setAttribute
                  : (NSString *)key value
                  : (NSString *)value resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[FIRCrashlytics crashlytics] setCustomValue:value forKey:key];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setAttributes
                  : (NSDictionary *)attributes resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    NSArray *keys = [attributes allKeys];

    for (NSString *key in keys) {
      [[FIRCrashlytics crashlytics] setCustomValue:attributes[key] forKey:key];
    }
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setUserId
                  : (NSString *)userId resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[FIRCrashlytics crashlytics] setUserID:userId];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(recordError : (NSDictionary *)jsErrorDict) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
}

RCT_EXPORT_METHOD(recordErrorPromise
                  : (NSDictionary *)jsErrorDict resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setCrashlyticsCollectionEnabled
                  : (BOOL)enabled resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBPreferences shared] setBooleanValue:@"crashlytics_auto_collection_enabled"
                                  boolValue:enabled];
  resolve([NSNull null]);
}

- (void)recordJavaScriptError:(NSDictionary *)jsErrorDict {
  NSString *message = jsErrorDict[@"message"];
  NSDictionary *stackFrames = jsErrorDict[@"frames"];
  NSMutableArray *stackTrace = [[NSMutableArray alloc] init];
  BOOL isUnhandledPromiseRejection = [jsErrorDict[@"isUnhandledRejection"] boolValue];

  for (NSDictionary *stackFrame in stackFrames) {
    FIRStackFrame *customFrame =
        [FIRStackFrame stackFrameWithSymbol:stackFrame[@"fn"]
                                       file:stackFrame[@"file"]
                                       line:(uint32_t)[stackFrame[@"line"] intValue]];
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

/**
 * Check if the debugger is attached
 *
 * Taken from
 * https://github.com/plausiblelabs/plcrashreporter/blob/2dd862ce049e6f43feb355308dfc710f3af54c4d/Source/Crash%20Demo/main.m#L96
 *
 * @return `YES` if the debugger is attached to the current process, `NO` otherwise
 */
- (BOOL)isDebuggerAttached {
  static BOOL debuggerIsAttached = NO;

  static dispatch_once_t debuggerPredicate;
  dispatch_once(&debuggerPredicate, ^{
    struct kinfo_proc info;
    size_t info_size = sizeof(info);
    int name[4];

    name[0] = CTL_KERN;
    name[1] = KERN_PROC;
    name[2] = KERN_PROC_PID;
    name[3] = getpid();  // from unistd.h, included by Foundation

    if (sysctl(name, 4, &info, &info_size, NULL, 0) == -1) {
      ELog(@"Crashlytics ERROR: Checking for a running debugger via sysctl() failed: %s",
           strerror(errno));
      debuggerIsAttached = false;
    }

    if (!debuggerIsAttached && (info.kp_proc.p_flag & P_TRACED) != 0) debuggerIsAttached = true;
  });

  return debuggerIsAttached;
}

@end
