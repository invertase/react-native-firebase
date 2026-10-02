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
 */

#import <React/RCTUtils.h>

#import "RNFBAppModuleImplementation.h"
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "RNFBPreferences.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBSharedUtils.h"
#import "RNFBVersion.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

void RNFBAppModuleInitialize(void) {
  [RNFBAppModuleFirebase registerLibraryOnceWithName:@"react-native-firebase"
                                             version:[RNFBVersionString copy]];
  if ([[RNFBJSON shared] contains:@"app_log_level"]) {
    NSString *logLevel = [[RNFBJSON shared] getStringValue:@"app_log_level" defaultValue:@"info"];
    RNFBAppModuleSetLogLevel(logLevel);
  }
}

void RNFBAppModuleSetBridge(RCTBridge *bridge) { [RNFBRCTEventEmitter shared].bridge = bridge; }

RCTBridge *RNFBAppModuleBridge(void) { return [RNFBRCTEventEmitter shared].bridge; }

void RNFBAppModuleInvalidate(void) { [[RNFBRCTEventEmitter shared] invalidate]; }

NSDictionary *RNFBAppModuleConstantsDictionary(void) {
  NSArray *firApps = [RNFBAppModuleFirebase allApps];
  NSMutableArray *appsArray = [NSMutableArray new];
  NSMutableDictionary *constants = [NSMutableDictionary new];

  for (id firApp in firApps) {
    [appsArray addObject:[RNFBSharedUtils firAppToDictionary:firApp]];
  }

  constants[@"NATIVE_FIREBASE_APPS"] = appsArray;
  constants[@"FIREBASE_RAW_JSON"] = [[RNFBJSON shared] getRawJSON];
  return constants;
}

void RNFBAppModuleMetaGetAll(RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  resolve([RNFBMeta getAll]);
}

void RNFBAppModuleJSONGetAll(RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  resolve([[RNFBJSON shared] getAll]);
}

void RNFBAppModulePreferencesSetBool(NSString *key, BOOL value, RCTPromiseResolveBlock resolve,
                                     RCTPromiseRejectBlock reject) {
  [[RNFBPreferences shared] setBooleanValue:key boolValue:value];
  resolve([NSNull null]);
}

void RNFBAppModulePreferencesSetString(NSString *key, NSString *value,
                                       RCTPromiseResolveBlock resolve,
                                       RCTPromiseRejectBlock reject) {
  [[RNFBPreferences shared] setStringValue:key stringValue:value];
  resolve([NSNull null]);
}

void RNFBAppModulePreferencesGetAll(RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  resolve([[RNFBPreferences shared] getAll]);
}

void RNFBAppModulePreferencesClearAll(RCTPromiseResolveBlock resolve,
                                      RCTPromiseRejectBlock reject) {
  [[RNFBPreferences shared] clearAll];
  resolve([NSNull null]);
}

void RNFBAppModuleEventsNotifyReady(BOOL ready) {
  [[RNFBRCTEventEmitter shared] notifyJsReady:ready];
}

void RNFBAppModuleEventsGetListeners(RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  resolve([[RNFBRCTEventEmitter shared] getListenersDictionary]);
}

void RNFBAppModuleEventsPing(NSString *eventName, NSDictionary *eventBody,
                             RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  [[RNFBRCTEventEmitter shared] sendEventWithName:eventName body:eventBody];
  resolve(eventBody);
}

void RNFBAppModuleEventsAddListener(NSString *eventName) {
  [[RNFBRCTEventEmitter shared] addListener:eventName];
}

void RNFBAppModuleEventsRemoveListener(NSString *eventName, BOOL all) {
  [[RNFBRCTEventEmitter shared] removeListeners:eventName all:all];
}

void RNFBAppModuleAddListener(NSString *eventName) { (void)eventName; }

void RNFBAppModuleRemoveListeners(double count) { (void)count; }

void RNFBAppModuleInitializeApp(NSDictionary *options, NSDictionary *appConfig,
                                RCTPromiseResolveBlock resolve, RCTPromiseRejectBlock reject) {
  RCTUnsafeExecuteOnMainQueueSync(^{
    id firApp;
    RNFBAppInitializeNameResolution *names =
        [RNFBAppInitializeOptionsMapper resolveNameFromAppConfig:appConfig];
    NSString *authDomain = [RNFBAppInitializeOptionsMapper authDomainFromOptions:options];
    id firOptions =
        [RNFBAppInitializeOptionsMapper buildOptionsFrom:options
                                          optionsFactory:[RNFBAppModuleFirebase optionsFactory]];

    // The catch only records the exception. A `return` inside it makes clang attribute zero
    // hits to everything after the try, which hides the success path from coverage.
    NSException *raised = nil;
    @try {
      firApp = [RNFBAppModuleFirebase configureOrReuseAppWithOptions:firOptions
                                                      nameResolution:names];
    } @catch (NSException *exception) {
      raised = exception;
    }
    if (raised != nil) {
      [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:raised];
      return;
    }

    RNFBAppModuleCompleteInitializeApp(firApp, authDomain, names.jsAppName, appConfig, resolve);
  });
}

void RNFBAppModuleCompleteInitializeApp(id firApp, NSString *authDomain, NSString *jsAppName,
                                        NSDictionary *appConfig, RCTPromiseResolveBlock resolve) {
  [RNFBAppCustomAuthDomains setCustomDomain:authDomain forAppName:jsAppName];
  if (firApp == nil) {
    // Pre-port messaged a nil app (no-ops) and mapped it to empty option/config sections.
    resolve(@{@"options" : @{}, @"appConfig" : @{@"automaticDataCollectionEnabled" : @NO}});
    return;
  }

  // Intentionally differs from the pre-port pointer cast, which made any non-nil value
  // (including JS `false` as @NO) enable collection. The boolean value is read now, so
  // @NO / @0 / NSNull / absent disable it. Pinned by RNFBAppModuleLifecycleTests for
  // @YES, @NO, @1, @0, NSNull and nil / absent.
  id dataCollection = [appConfig valueForKey:@"automaticDataCollectionEnabled"];
  BOOL dataCollectionEnabled =
      [dataCollection respondsToSelector:@selector(boolValue)] && [dataCollection boolValue];
  [RNFBAppModuleFirebase setDataCollectionDefaultEnabled:dataCollectionEnabled forApp:firApp];
  resolve([RNFBSharedUtils firAppToDictionary:firApp]);
}

void RNFBAppModuleSetAutomaticDataCollectionEnabled(NSString *appName, BOOL enabled) {
  [RNFBAppModuleFirebase setAutomaticDataCollectionEnabled:enabled forAppName:appName];
}

void RNFBAppModuleDeleteApp(NSString *appName, RCTPromiseResolveBlock resolve,
                            RCTPromiseRejectBlock reject) {
  [RNFBAppModuleFirebase deleteAppNamed:appName resolve:resolve reject:reject];
}

void RNFBAppModuleSetLogLevel(NSString *logLevel) {
  int level = (int)[RNFBAppLogLevelMapper loggerLevelForString:logLevel];
  DLog(@"RNFBSetLogLevel: setting level to %d from %@.", level, logLevel);
  [RNFBAppModuleFirebase setLoggerLevel:level];
}
