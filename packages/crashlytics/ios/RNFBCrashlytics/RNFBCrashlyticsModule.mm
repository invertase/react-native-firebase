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

// This module intentionally has no Firebase imports and no `*-Swift.h` —
// see RNFBCrashlyticsHelper.h. Every Firebase Crashlytics SDK call (and the
// Swift debugger probe) is routed through the plain Objective-C
// RNFBCrashlyticsHelper class instead, which can safely `@import`
// FirebaseCrashlytics / import the generated Swift interface because it
// compiles as ObjC, not ObjC++.
#import <React/RCTConvert.h>
#import <React/RCTLog.h>

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBCrashlyticsHelper.h"
#import "RNFBCrashlyticsInitProvider.h"
#import "RNFBCrashlyticsModule.h"
#import "RNFBPreferences.h"

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
  if ([RNFBCrashlyticsHelper isDebuggerAttached]) {
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
  (void)reject;
  [RNFBCrashlyticsHelper checkForUnsentReportsWithCompletion:^(BOOL unsentReports) {
    resolve([NSNumber numberWithBool:unsentReports]);
  }];
}

- (void)crash {
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([RNFBCrashlyticsHelper isDebuggerAttached]) {
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
  (void)reject;
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    if ([RNFBCrashlyticsHelper isDebuggerAttached]) {
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
  (void)reject;
  [RNFBCrashlyticsHelper deleteUnsentReports];
  resolve([NSNull null]);
}

- (void)didCrashOnPreviousExecution:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  BOOL didCrash = [RNFBCrashlyticsHelper didCrashDuringPreviousExecution];
  resolve([NSNumber numberWithBool:didCrash]);
}

- (void)log:(NSString *)message {
  [RNFBCrashlyticsHelper log:message];
}

- (void)logPromise:(NSString *)message
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  [RNFBCrashlyticsHelper log:message];
  resolve([NSNull null]);
}

- (void)sendUnsentReports {
  [RNFBCrashlyticsHelper sendUnsentReports];
}

- (void)setAttribute:(NSString *)key
               value:(NSString *)value
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [RNFBCrashlyticsHelper setCustomValue:value forKey:key];
  }
  resolve([NSNull null]);
}

- (void)setAttributes:(NSDictionary *)attributes
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [RNFBCrashlyticsHelper setCustomKeysAndValues:attributes];
  }
  resolve([NSNull null]);
}

- (void)setUserId:(NSString *)userId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [RNFBCrashlyticsHelper setUserID:userId];
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
  (void)reject;
  if ([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled]) {
    [self recordJavaScriptError:jsErrorDict];
  }
  resolve([NSNull null]);
}

- (void)setCrashlyticsCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  [[RNFBPreferences shared] setBooleanValue:@"crashlytics_auto_collection_enabled"
                                  boolValue:enabled];
  resolve([NSNull null]);
}

- (void)recordJavaScriptError:(JS::NativeRNFBTurboCrashlytics::JavaScriptErrorObject &)jsErrorDict {
  NSString *message = jsErrorDict.message();
  auto stackFrames = jsErrorDict.frames();
  NSMutableArray *frames = [[NSMutableArray alloc] init];
  BOOL isUnhandledPromiseRejection = jsErrorDict.isUnhandledRejection();

  for (const auto &stackFrame : stackFrames) {
    [frames addObject:@{
      @"fn" : stackFrame.fn() ?: @"",
      @"file" : stackFrame.file() ?: @"",
      @"line" : @((NSUInteger)stackFrame.line()),
    }];
  }

  [RNFBCrashlyticsHelper recordJavaScriptErrorWithMessage:message
                                                   frames:frames
                              isUnhandledPromiseRejection:isUnhandledPromiseRejection];
}

@end
