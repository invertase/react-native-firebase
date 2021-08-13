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

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBFiamModule.h"

@implementation RNFBFiamModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isMessagesDisplaySuppressed"] =
      @([RCTConvert BOOL:@([FIRInAppMessaging inAppMessaging].messageDisplaySuppressed)]);
  constants[@"isAutomaticDataCollectionEnabled"] =
      @([RCTConvert BOOL:@([FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled)]);
  return constants;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Fiam Methods

RCT_EXPORT_METHOD(setAutomaticDataCollectionEnabled
                  : (BOOL)enabled resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled = (BOOL)enabled;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setMessagesDisplaySuppressed
                  : (BOOL)enabled resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [FIRInAppMessaging inAppMessaging].messageDisplaySuppressed = (BOOL)enabled;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(triggerEvent
                  : (NSString *)eventId resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRInAppMessaging inAppMessaging] triggerEvent:eventId];
  resolve([NSNull null]);
}

@end
