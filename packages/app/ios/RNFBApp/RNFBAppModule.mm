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
#import <React/RCTInvalidating.h>
#import <React/RCTUtils.h>

#import "RCTConvert+FIRApp.h"
#import "RNFBAppModule.h"
#import "RNFBAppTurboModules.h"
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

@interface RNFBAppModule () <NativeRNFBTurboAppSpec, RCTInvalidating>
@end

@implementation RNFBAppModule

#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboApp)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAppSpecJSI>(params);
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
#pragma mark Constants

- (NSDictionary *)appConstantsDictionary {
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

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants::Builder>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self appConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

#pragma mark -
#pragma mark META Methods

- (void)metaGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve([RNFBMeta getAll]);
}

#pragma mark -
#pragma mark JSON Methods

- (void)jsonGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve([[RNFBJSON shared] getAll]);
}

#pragma mark -
#pragma mark Preference Methods

- (void)preferencesSetBool:(NSString *)key
                     value:(BOOL)value
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [[RNFBPreferences shared] setBooleanValue:key boolValue:value];
  resolve([NSNull null]);
}

- (void)preferencesSetString:(NSString *)key
                       value:(NSString *)value
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [[RNFBPreferences shared] setStringValue:key stringValue:value];
  resolve([NSNull null]);
}

- (void)preferencesGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve([[RNFBPreferences shared] getAll]);
}

- (void)preferencesClearAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  [[RNFBPreferences shared] clearAll];
  resolve([NSNull null]);
}

#pragma mark -
#pragma mark Event Methods

- (void)eventsNotifyReady:(BOOL)ready {
  [[RNFBRCTEventEmitter shared] notifyJsReady:ready];
}

- (void)eventsGetListeners:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve([[RNFBRCTEventEmitter shared] getListenersDictionary]);
}

- (void)eventsPing:(NSString *)eventName
         eventBody:(NSDictionary *)eventBody
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [[RNFBRCTEventEmitter shared] sendEventWithName:eventName body:eventBody];
  resolve(eventBody);
}

- (void)eventsAddListener:(NSString *)eventName {
  [[RNFBRCTEventEmitter shared] addListener:eventName];
}

- (void)eventsRemoveListener:(NSString *)eventName all:(BOOL)all {
  [[RNFBRCTEventEmitter shared] removeListeners:eventName all:all];
}

#pragma mark -
#pragma mark Events Unused

- (void)addListener:(NSString *)eventName {
  // Keep: Required for RN built in Event Emitter Calls.
}

- (void)removeListeners:(double)count {
  // Keep: Required for RN built in Event Emitter Calls.
}

#pragma mark -
#pragma mark Firebase App Methods

- (void)initializeApp:(NSDictionary *)options
            appConfig:(NSDictionary *)appConfig
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  RCTUnsafeExecuteOnMainQueueSync(^{
    FIRApp *firApp;
    NSString *appName = [appConfig valueForKey:@"name"];

    NSString *appId = [options valueForKey:@"appId"];
    NSString *messagingSenderId = [options valueForKey:@"messagingSenderId"];
    FIROptions *firOptions = [[FIROptions alloc] initWithGoogleAppID:appId
                                                         GCMSenderID:messagingSenderId];
    firOptions.APIKey = [options valueForKey:@"apiKey"];
    firOptions.projectID = [options valueForKey:@"projectId"];
    if (![[options valueForKey:@"databaseURL"] isEqual:[NSNull null]]) {
      firOptions.databaseURL = [options valueForKey:@"databaseURL"];
    }
    if (![[options valueForKey:@"storageBucket"] isEqual:[NSNull null]]) {
      firOptions.storageBucket = [options valueForKey:@"storageBucket"];
    }
    if (![[options valueForKey:@"iosBundleId"] isEqual:[NSNull null]]) {
      firOptions.bundleID = [options valueForKey:@"iosBundleId"];
    }
    if (![[options valueForKey:@"iosClientId"] isEqual:[NSNull null]]) {
      firOptions.clientID = [options valueForKey:@"iosClientId"];
    }
    if (![[options valueForKey:@"appGroupId"] isEqual:[NSNull null]]) {
      firOptions.appGroupID = [options valueForKey:@"appGroupId"];
    }

    if ([options valueForKey:@"authDomain"] != nil) {
      DLog(@"RNFBAuth app: %@ customAuthDomain: %@", appName, [options valueForKey:@"authDomain"]);
      if (customAuthDomains == nil) {
        customAuthDomains = [[NSMutableDictionary alloc] init];
      }
      customAuthDomains[appName] = [options valueForKey:@"authDomain"];
    }
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

static NSMutableDictionary<NSString *, NSString *> *customAuthDomains;

+ (NSString *)getCustomDomain:(NSString *)appName {
  DLog(@"authDomains: %@", customAuthDomains);
  return customAuthDomains[appName];
}

- (void)setLogLevel:(NSString *)logLevel {
  int level = FIRLoggerLevelError;
  if ([logLevel isEqualToString:@"verbose"]) {
    level = FIRLoggerLevelDebug;
  } else if ([logLevel isEqualToString:@"debug"]) {
    level = FIRLoggerLevelDebug;
  } else if ([logLevel isEqualToString:@"info"]) {
    level = FIRLoggerLevelInfo;
  } else if ([logLevel isEqualToString:@"warn"]) {
    level = FIRLoggerLevelWarning;
  }
  DLog(@"RNFBSetLogLevel: setting level to %d from %@.", level, logLevel);
  [[FIRConfiguration sharedInstance] setLoggerLevel:(FIRLoggerLevel)level];
}

- (void)setAutomaticDataCollectionEnabled:(NSString *)appName enabled:(BOOL)enabled {
  FIRApp *firApp = [RCTConvert firAppFromString:appName];
  if (firApp) {
    firApp.dataCollectionDefaultEnabled = enabled;
  }
}

- (void)deleteApp:(NSString *)appName
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firApp = [RCTConvert firAppFromString:appName];
  if (!firApp) {
    return resolve([NSNull null]);
  }

  [firApp deleteApp:^(BOOL success) {
    if (success) {
      resolve([NSNull null]);
    } else {
      [firApp deleteApp:^(BOOL success2) {
        if (success2) {
          resolve([NSNull null]);
        } else {
          reject(@"app/delete-app-failed", @"Failed to delete the specified app.", nil);
        }
      }];
    }
  }];
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end
