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

#import <React/RCTInvalidating.h>

#import "RNFBAppModule.h"
#import "RNFBAppModuleImplementation.h"
#import "RNFBAppTurboModules.h"

@interface RNFBAppModule () <NativeRNFBTurboAppSpec, RCTInvalidating>

@end

@implementation RNFBAppModule

- (instancetype)init {
  if ((self = [super init])) {
    RNFBAppModuleInitialize();
  }
  return self;
}

#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboApp)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAppSpecJSI>(params);
}

- (void)setBridge:(RCTBridge *)bridge {
  RNFBAppModuleSetBridge(bridge);
}

- (RCTBridge *)bridge {
  return RNFBAppModuleBridge();
}

- (void)invalidate {
  RNFBAppModuleInvalidate();
}

#pragma mark -
#pragma mark Constants

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:RNFBAppModuleConstantsDictionary()];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboApp::Constants>)getConstants {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:RNFBAppModuleConstantsDictionary()];
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Methods

- (void)initializeApp:(NSDictionary *)options
            appConfig:(NSDictionary *)appConfig
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleInitializeApp(options, appConfig, resolve, reject);
}

- (void)setAutomaticDataCollectionEnabled:(NSString *)appName enabled:(BOOL)enabled {
  RNFBAppModuleSetAutomaticDataCollectionEnabled(appName, enabled);
}

- (void)deleteApp:(NSString *)appName
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleDeleteApp(appName, resolve, reject);
}

- (void)eventsNotifyReady:(BOOL)ready {
  RNFBAppModuleEventsNotifyReady(ready);
}

- (void)eventsGetListeners:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleEventsGetListeners(resolve, reject);
}

- (void)eventsPing:(NSString *)eventName
         eventBody:(NSDictionary *)eventBody
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleEventsPing(eventName, eventBody, resolve, reject);
}

- (void)eventsAddListener:(NSString *)eventName {
  RNFBAppModuleEventsAddListener(eventName);
}

- (void)eventsRemoveListener:(NSString *)eventName all:(BOOL)all {
  RNFBAppModuleEventsRemoveListener(eventName, all);
}

- (void)addListener:(NSString *)eventName {
  RNFBAppModuleAddListener(eventName);
}

- (void)removeListeners:(double)count {
  RNFBAppModuleRemoveListeners(count);
}

- (void)metaGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleMetaGetAll(resolve, reject);
}

- (void)jsonGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModuleJSONGetAll(resolve, reject);
}

- (void)preferencesSetBool:(NSString *)key
                     value:(BOOL)value
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModulePreferencesSetBool(key, value, resolve, reject);
}

- (void)preferencesSetString:(NSString *)key
                       value:(NSString *)value
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModulePreferencesSetString(key, value, resolve, reject);
}

- (void)preferencesGetAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModulePreferencesGetAll(resolve, reject);
}

- (void)preferencesClearAll:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBAppModulePreferencesClearAll(resolve, reject);
}

- (void)setLogLevel:(NSString *)logLevel {
  RNFBAppModuleSetLogLevel(logLevel);
}

@end
