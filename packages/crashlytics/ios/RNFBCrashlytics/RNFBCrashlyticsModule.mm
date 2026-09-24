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

#import <React/RCTConvert.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseCrashlytics/FirebaseCrashlytics.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseCrashlytics/FirebaseCrashlytics.h>
#else
@import FirebaseCore;
@import FirebaseCrashlytics;
#endif
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBCrashlyticsInitProvider.h"
#import "RNFBCrashlyticsModule.h"
#import "RNFBPreferences.h"

#if __has_include(<RNFBCrashlytics/RNFBCrashlytics-Swift.h>)
#import <RNFBCrashlytics/RNFBCrashlytics-Swift.h>
#elif __has_include("RNFBCrashlytics-Swift.h")
#import "RNFBCrashlytics-Swift.h"
#endif

@implementation RNFBCrashlyticsModule

RCT_EXPORT_MODULE(NativeRNFBTurboCrashlytics)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboCrashlyticsSpecJSI>(params);
}

- (NSDictionary *)crashlyticsConstantsDictionary {
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

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboCrashlytics::Constants>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self crashlyticsConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboCrashlytics::Constants>)getConstants {
  return [self constantsToExport];
}

- (void)checkForUnsentReports:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [[FIRCrashlytics crashlytics] checkForUnsentReportsWithCompletion:^(BOOL unsentReports) {
    resolve([NSNumber numberWithBool:unsentReports]);
  }];
}

- (void)crash {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([self isDebuggerAttached]) {
      RCTLog(
          @"Crashlytics - WARNING: Debugger detected. Crashlytics will not receive crash reports.");
    }

    int *p = 0;
    *p = 0;
  } else {
    RCTLog(@"Crashlytics - INFO: crashlytics collection is not enabled, not crashing.");
  }
}

- (void)crashWithStackPromise:(JS::NativeRNFBTurboCrashlytics::JavaScriptErrorObject &)jsErrorDict
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([self isDebuggerAttached]) {
      RCTLog(
          @"Crashlytics - WARNING: Debugger detected. Crashlytics will not receive crash reports.");
    }
    [self recordJavaScriptError:jsErrorDict];

    ELog(@"Crashlytics - Crash logged. Terminating app.");
    exit(0);
  } else {
    RCTLog(@"Crashlytics - INFO: crashlytics collection is not enabled, not crashing.");
  }
  resolve([NSNull null]);
}

- (void)deleteUnsentReports:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [[FIRCrashlytics crashlytics] deleteUnsentReports];
  resolve([NSNull null]);
}

- (void)didCrashOnPreviousExecution:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  BOOL didCrash = [[FIRCrashlytics crashlytics] didCrashDuringPreviousExecution];
  resolve([NSNumber numberWithBool:didCrash]);
}

- (void)log:(NSString *)message {
  [[FIRCrashlytics crashlytics] log:message];
}

- (void)logPromise:(NSString *)message
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [[FIRCrashlytics crashlytics] log:message];
  resolve([NSNull null]);
}

- (void)sendUnsentReports {
  [[FIRCrashlytics crashlytics] sendUnsentReports];
}

- (void)setAttribute:(NSString *)key
               value:(NSString *)value
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[FIRCrashlytics crashlytics] setCustomValue:value forKey:key];
  }
  resolve([NSNull null]);
}

- (void)setAttributes:(NSDictionary *)attributes
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    NSArray *keys = [attributes allKeys];

    for (NSString *key in keys) {
      [[FIRCrashlytics crashlytics] setCustomValue:attributes[key] forKey:key];
    }
  }
  resolve([NSNull null]);
}

- (void)setUserId:(NSString *)userId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [[FIRCrashlytics crashlytics] setUserID:userId];
  }
  resolve([NSNull null]);
}

- (void)recordError:(JS::NativeRNFBTurboCrashlytics::JavaScriptErrorObject &)jsErrorDict {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
}

- (void)recordErrorPromise:(JS::NativeRNFBTurboCrashlytics::JavaScriptErrorObject &)jsErrorDict
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
  resolve([NSNull null]);
}

- (void)setCrashlyticsCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  [[RNFBPreferences shared] setBooleanValue:@"crashlytics_auto_collection_enabled"
                                  boolValue:enabled];
  resolve([NSNull null]);
}

- (void)recordJavaScriptError:(JS::NativeRNFBTurboCrashlytics::JavaScriptErrorObject &)jsErrorDict {
  NSString *message = jsErrorDict.message();
  auto stackFrames = jsErrorDict.frames();
  NSMutableArray *stackTrace = [[NSMutableArray alloc] init];
  BOOL isUnhandledPromiseRejection = jsErrorDict.isUnhandledRejection();

  for (const auto &stackFrame : stackFrames) {
    FIRStackFrame *customFrame = [FIRStackFrame stackFrameWithSymbol:stackFrame.fn()
                                                                file:stackFrame.file()
                                                                line:(uint32_t)stackFrame.line()];
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

- (BOOL)isDebuggerAttached {
  return [RNFBCrashlyticsDebuggerProbe isDebuggerAttached];
}

@end
