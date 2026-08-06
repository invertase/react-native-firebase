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

#import "RNFBConfigModule.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBConfigHelper.h"

@implementation RNFBConfigModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboConfig)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)invalidate {
  [RNFBConfigHelper removeAllConfigUpdateRegistrations];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboConfigSpecJSI>(params);
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboConfig::Constants::Builder>)
    constantsToExport {
  return [_RCTTypedModuleConstants
      newWithUnsafeDictionary:[RNFBConfigHelper getConstantsForAppName:DEFAULT_APP_DISPLAY_NAME]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboConfig::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

#pragma mark -
#pragma mark Firebase Config Methods

- (void)ensureInitialized:(NSString *)appName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper ensureInitialized:appName resolve:resolve reject:reject];
}

- (void)fetch:(NSString *)appName
    expirationDurationSeconds:(double)expirationDurationSeconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper fetch:appName
      expirationDurationSeconds:expirationDurationSeconds
                        resolve:resolve
                         reject:reject];
}

- (void)fetchAndActivate:(NSString *)appName
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper fetchAndActivate:appName resolve:resolve reject:reject];
}

- (void)activate:(NSString *)appName
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper activate:appName resolve:resolve reject:reject];
}

- (void)setConfigSettings:(NSString *)appName
                 settings:(JS::NativeRNFBTurboConfig::ConfigSettings &)configSettings
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper setConfigSettings:appName
                 minimumFetchInterval:configSettings.minimumFetchInterval()
                         fetchTimeout:configSettings.fetchTimeout()
                              resolve:resolve
                               reject:reject];
}

- (void)setDefaults:(NSString *)appName
           defaults:(NSDictionary *)defaults
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper setDefaults:appName defaults:defaults resolve:resolve reject:reject];
}

- (void)setDefaultsFromResource:(NSString *)appName
                   resourceName:(NSString *)resourceName
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper setDefaultsFromResource:appName
                               resourceName:resourceName
                                    resolve:resolve
                                     reject:reject];
}

- (void)reset:(NSString *)appName
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper reset:appName resolve:resolve reject:reject];
}

- (void)onConfigUpdated:(NSString *)appName {
  [RNFBConfigHelper onConfigUpdated:appName];
}

- (void)removeConfigUpdateRegistration:(NSString *)appName {
  [RNFBConfigHelper removeConfigUpdateRegistration:appName];
}

- (void)setCustomSignals:(NSString *)appName
           customSignals:(NSDictionary *)customSignals
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [RNFBConfigHelper setCustomSignals:appName
                       customSignals:customSignals
                             resolve:resolve
                              reject:reject];
}

@end
