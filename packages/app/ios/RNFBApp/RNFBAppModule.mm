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

#import <Firebase/Firebase.h>
#import <React/RCTUtils.h>

#import "RNFBAppModule.h"
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "RNFBPreferences.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBSharedUtils.h"
#import "RNFBVersion.h"

#if __has_include(<FirebaseCore/FIRAppInternal.h>)
#import <FirebaseCore/FIRAppInternal.h>
#define REGISTER_LIB
#endif

@implementation RNFBAppModule

#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (void)setBridge:(RCTBridge *)bridge {
  [RNFBRCTEventEmitter shared].bridge = bridge;
}

- (RCTBridge *)bridge {
  return [RNFBRCTEventEmitter shared].bridge;
}

- (id)init {
  if (self = [super init]) {
#ifdef REGISTER_LIB
    static dispatch_once_t once;
    dispatch_once(&once, ^{
      [FIRApp registerLibrary:@"react-native-firebase" withVersion:[RNFBVersionString copy]];
    });
#endif
    if ([[RNFBJSON shared] contains:@"app_log_level"]) {
      NSString *logLevel = [[RNFBJSON shared] getStringValue:@"app_log_level" defaultValue:@"info"];
      [self setLogLevel:logLevel];
    }
  }

  return self;
}

- (void)invalidate {
  [[RNFBRCTEventEmitter shared] invalidate];
}

#pragma mark -
#pragma mark META Methods

RCT_EXPORT_METHOD(metaGetAll
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  resolve([RNFBMeta getAll]);
}

#pragma mark -
#pragma mark JSON Methods

RCT_EXPORT_METHOD(jsonGetAll
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  resolve([[RNFBJSON shared] getAll]);
}

#pragma mark -
#pragma mark Preference Methods

RCT_EXPORT_METHOD(preferencesSetBool
                  : (NSString *)key value
                  : (BOOL)value resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBPreferences shared] setBooleanValue:key boolValue:value];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(preferencesSetString
                  : (NSString *)key value
                  : (NSString *)value resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBPreferences shared] setStringValue:key stringValue:value];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(preferencesGetAll
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  resolve([[RNFBPreferences shared] getAll]);
}

RCT_EXPORT_METHOD(preferencesClearAll
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBPreferences shared] clearAll];
  resolve([NSNull null]);
}

#pragma mark -
#pragma mark Event Methods

RCT_EXPORT_METHOD(eventsNotifyReady : (BOOL)ready) {
  [[RNFBRCTEventEmitter shared] notifyJsReady:ready];
}

RCT_EXPORT_METHOD(eventsGetListeners
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  resolve([[RNFBRCTEventEmitter shared] getListenersDictionary]);
}

RCT_EXPORT_METHOD(eventsPing
                  : (NSString *)eventName eventBody
                  : (NSDictionary *)eventBody resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  [[RNFBRCTEventEmitter shared] sendEventWithName:eventName body:eventBody];
  resolve(eventBody);
}

RCT_EXPORT_METHOD(eventsAddListener : (NSString *)eventName) {
  [[RNFBRCTEventEmitter shared] addListener:eventName];
}

RCT_EXPORT_METHOD(eventsRemoveListener : (NSString *)eventName all : (BOOL)all) {
  [[RNFBRCTEventEmitter shared] removeListeners:eventName all:all];
}

#pragma mark -
#pragma mark Events Unused

RCT_EXPORT_METHOD(addListener : (NSString *)eventName) {
  // Keep: Required for RN built in Event Emitter Calls.
}

RCT_EXPORT_METHOD(removeListeners : (NSInteger)count) {
  // Keep: Required for RN built in Event Emitter Calls.
}

#pragma mark -
#pragma mark Firebase App Methods

RCT_EXPORT_METHOD(initializeApp
                  : (FIROptions *)firOptions appConfig
                  : (NSDictionary *)appConfig resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  RCTUnsafeExecuteOnMainQueueSync(^{
    FIRApp *firApp;
    NSString *appName = [appConfig valueForKey:@"name"];

    @try {
      if (!appName || [appName isEqualToString:DEFAULT_APP_DISPLAY_NAME]) {
        [FIRApp configureWithOptions:firOptions];
        firApp = [FIRApp defaultApp];
      } else {
        [FIRApp configureWithName:appName options:firOptions];
        firApp = [FIRApp appNamed:appName];
      }
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }

    firApp.dataCollectionDefaultEnabled =
        (BOOL)[appConfig valueForKey:@"automaticDataCollectionEnabled"];

    resolve([RNFBSharedUtils firAppToDictionary:firApp]);
  });
}

RCT_EXPORT_METHOD(setLogLevel : (NSString *)logLevel) {
  FIRLoggerLevel level = FIRLoggerLevelError;
  if ([logLevel isEqualToString:@"verbose"]) {
    level = FIRLoggerLevelDebug;
  } else if ([logLevel isEqualToString:@"debug"]) {
    level = FIRLoggerLevelDebug;
  } else if ([logLevel isEqualToString:@"info"]) {
    level = FIRLoggerLevelInfo;
  } else if ([logLevel isEqualToString:@"warn"]) {
    level = FIRLoggerLevelWarning;
  }
  DLog(@"RNFBSetLogLevel: setting level to %ld from %@.", level, logLevel);
  [[FIRConfiguration sharedInstance] setLoggerLevel:level];
}

RCT_EXPORT_METHOD(setAutomaticDataCollectionEnabled : (FIRApp *)firApp enabled : (BOOL)enabled) {
  if (firApp) {
    firApp.dataCollectionDefaultEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(deleteApp
                  : (FIRApp *)firApp resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject) {
  if (!firApp) {
    return resolve([NSNull null]);
  }

  [firApp deleteApp:^(BOOL success) {
    if (success) {
      resolve([NSNull null]);
    } else {
      // try again once more
      [firApp deleteApp:^(BOOL success2) {
        if (success2) {
          resolve([NSNull null]);
        } else {
          // TODO js error builder
          reject(@"app/delete-app-failed", @"Failed to delete the specified app.", nil);
        }
      }];
    }
  }];
}

- (NSDictionary *)getConstants {
    return self.constantsToExport;
}

- (NSDictionary *)constantsToExport {
  NSDictionary *firApps = [FIRApp allApps];
  NSMutableArray *appsArray = [NSMutableArray new];
  NSMutableDictionary *constants = [NSMutableDictionary new];

  for (id key in firApps) {
    [appsArray addObject:[RNFBSharedUtils firAppToDictionary:firApps[key]]];
  }

  constants[@"NATIVE_FIREBASE_APPS"] = appsArray;

  constants[@"FIREBASE_RAW_JSON"] = [[RNFBJSON shared] getRawJSON];

  return constants;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeFirebaseAppModuleSpecJSI>(params);
}
#endif

@end