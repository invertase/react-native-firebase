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
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#import "RNFBFiamModule.h"

@implementation RNFBFiamModule

RCT_EXPORT_MODULE(NativeRNFBTurboFiam)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSDictionary *)fiamConstantsDictionary {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isMessagesDisplaySuppressed"] =
      @([RCTConvert BOOL:@([FIRInAppMessaging inAppMessaging].messageDisplaySuppressed)]);
  constants[@"isAutomaticDataCollectionEnabled"] =
      @([RCTConvert BOOL:@([FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled)]);
  return constants;
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboFiam::Constants::Builder>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self fiamConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboFiam::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFiamSpecJSI>(params);
}

- (void)setAutomaticDataCollectionEnabled:(BOOL)enabled
                                  resolve:(RCTPromiseResolveBlock)resolve
                                   reject:(RCTPromiseRejectBlock)reject {
  [FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled = (BOOL)enabled;
  resolve([NSNull null]);
}

- (void)setMessagesDisplaySuppressed:(BOOL)enabled
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  [FIRInAppMessaging inAppMessaging].messageDisplaySuppressed = (BOOL)enabled;
  resolve([NSNull null]);
}

- (void)triggerEvent:(NSString *)eventId
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  [[FIRInAppMessaging inAppMessaging] triggerEvent:eventId];
  resolve([NSNull null]);
}

@end
