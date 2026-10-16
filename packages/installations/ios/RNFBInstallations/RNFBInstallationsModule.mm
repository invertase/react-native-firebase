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

// This module intentionally has no Firebase imports — see RNFBInstallationsHelper.h /
// okf-bundle/ios-spm-native-imports.md. Every Firebase Installations SDK call is routed
// through the plain Objective-C RNFBInstallationsHelper class instead, which can safely
// use the CocoaPods/SPM dual-import (including `@import`) because it compiles as ObjC,
// not ObjC++.
#import "RNFBInstallationsModule.h"
#import "RNFBInstallationsHelper.h"

@implementation RNFBInstallationsModule

RCT_EXPORT_MODULE(NativeRNFBTurboInstallations)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboInstallationsSpecJSI>(params);
}

- (void)invalidate {
}

- (void)deleteInstallations:(NSString *)appName
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  [RNFBInstallationsHelper deleteInstallations:appName resolve:resolve reject:reject];
}

- (void)getId:(NSString *)appName
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  [RNFBInstallationsHelper getId:appName resolve:resolve reject:reject];
}

- (void)getToken:(NSString *)appName
    forceRefresh:(BOOL)forceRefresh
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [RNFBInstallationsHelper getToken:appName
                       forceRefresh:forceRefresh
                            resolve:resolve
                             reject:reject];
}

@end
