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

#import "RNFBUtilsModule.h"
#import "RNFBAppTurboModules.h"
#import "RNFBUtilsModuleImplementation.h"

@interface RNFBUtilsModule () <NativeRNFBTurboUtilsSpec>

@end

@implementation RNFBUtilsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboUtils)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboUtilsSpecJSI>(params);
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Constants

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:RNFBUtilsModuleConstantsDictionary()];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants>)getConstants {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:RNFBUtilsModuleConstantsDictionary()];
}

#pragma mark -
#pragma mark Methods

- (void)androidGetPlayServicesStatus:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  RNFBUtilsModuleAndroidGetPlayServicesStatus(resolve, reject);
}

- (void)androidPromptForPlayServices:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  RNFBUtilsModuleAndroidPromptForPlayServices(resolve, reject);
}

- (void)androidResolutionForPlayServices:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  RNFBUtilsModuleAndroidResolutionForPlayServices(resolve, reject);
}

- (void)androidMakePlayServicesAvailable:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  RNFBUtilsModuleAndroidMakePlayServicesAvailable(resolve, reject);
}

@end
