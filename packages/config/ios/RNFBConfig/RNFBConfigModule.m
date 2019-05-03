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

#import <React/RCTUtils.h>
#import <React/RCTConvert.h>
#import <Firebase/Firebase.h>

#import "RNFBConfigModule.h"
#import "RNFBSharedUtils.h"

@implementation RNFBConfigModule
#pragma mark -
# pragma mark Converters

NSString *convertFIRRemoteConfigFetchStatusToNSString(FIRRemoteConfigFetchStatus value) {
  switch (value) {
  case FIRRemoteConfigFetchStatusNoFetchYet:return @"no_fetch_yet";
  case FIRRemoteConfigFetchStatusSuccess:return @"success";
  case FIRRemoteConfigFetchStatusThrottled:return @"throttled";
  case FIRRemoteConfigFetchStatusFailure:return @"failure";
  default:return @"unknown";
  }
}

NSString *convertFIRRemoteConfigFetchStatusToNSStringDescription(FIRRemoteConfigFetchStatus value) {
  switch (value) {
  case FIRRemoteConfigFetchStatusThrottled:return @"fetch() operation cannot be completed successfully, due to throttling.";
  case FIRRemoteConfigFetchStatusNoFetchYet:
  default:return @"fetch() operation cannot be completed successfully.";
  }
}

NSString *convertFIRRemoteConfigSourceToNSString(FIRRemoteConfigSource value) {
  switch (value) {
  case FIRRemoteConfigSourceDefault:return @"default";
  case FIRRemoteConfigSourceRemote:return @"remote";
  case FIRRemoteConfigSourceStatic:return @"static";
  default:return @"unknown";
  }
}

NSDictionary *convertFIRRemoteConfigValueToNSDictionary(FIRRemoteConfigValue *value) {
  return @{@"stringValue": (id) value.stringValue ?: [NSNull null],
      @"numberValue": (id) value.numberValue ?: [NSNull null], @"boolValue": @(value.boolValue),
      @"source": convertFIRRemoteConfigSourceToNSString(value.source)};
}

#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Config Methods

RCT_EXPORT_METHOD(fetch:
  (nonnull
    NSNumber *)expirationDuration
    activate: (BOOL) activate
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject) {
  FIRRemoteConfigFetchCompletion completionHandler = ^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": convertFIRRemoteConfigFetchStatusToNSString(status),
          @"message": convertFIRRemoteConfigFetchStatusToNSStringDescription(status)} mutableCopy]];
    } else {
      if (activate) {
        resolve(@([[FIRRemoteConfig remoteConfig] activateFetched]));
      } else {
        resolve([NSNull null]);
      }
    }
  };

  if (expirationDuration == @(-1)) {
    [[FIRRemoteConfig remoteConfig] fetchWithExpirationDuration:expirationDuration.doubleValue completionHandler:completionHandler];
  } else {
    [[FIRRemoteConfig remoteConfig] fetchWithCompletionHandler:completionHandler];
  }
}

RCT_EXPORT_METHOD(activateFetched:
  (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  BOOL status = [[FIRRemoteConfig remoteConfig] activateFetched];
  resolve(@(status));
}

RCT_EXPORT_METHOD(getConfigSettings:
  (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  resolve([self getConfigSettings]);
}

RCT_EXPORT_METHOD(getValue:
  (NSString *) key
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  FIRRemoteConfigValue *value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
  resolve(convertFIRRemoteConfigValueToNSDictionary(value));
}

RCT_EXPORT_METHOD(getValues:
  (NSArray *) keys
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  NSMutableArray *valuesArray = [[NSMutableArray alloc] init];

  for (NSString *key in keys) {
    FIRRemoteConfigValue *value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
    [valuesArray addObject:convertFIRRemoteConfigValueToNSDictionary(value)];
  }

  resolve(valuesArray);
}

RCT_EXPORT_METHOD(setConfigSettings:
  (NSDictionary *) configSettings
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  FIRRemoteConfigSettings *remoteConfigSettings =
      [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:[configSettings[@"isDeveloperModeEnabled"] boolValue]];
  [FIRRemoteConfig remoteConfig].configSettings = remoteConfigSettings;
  resolve([self getConfigSettings]);
}

RCT_EXPORT_METHOD(getKeysByPrefix:
  (NSString *) prefix
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  NSSet *keys = [[FIRRemoteConfig remoteConfig] keysWithPrefix:prefix];

  NSMutableArray *keysArray = [[NSMutableArray alloc] init];
  for (NSString *key in keys) {
    [keysArray addObject:key];
  }

  resolve(keysArray);
}

RCT_EXPORT_METHOD(getValuesByKeysPrefix:
  (NSString *) prefix
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  NSSet *keys = [[FIRRemoteConfig remoteConfig] keysWithPrefix:prefix];
  NSMutableDictionary *mutableDictionary = [NSMutableDictionary dictionary];

  for (NSString *key in keys) {
    FIRRemoteConfigValue *value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
    mutableDictionary[key] = convertFIRRemoteConfigValueToNSDictionary(value);
  }

  resolve(mutableDictionary);
}

RCT_EXPORT_METHOD(setDefaults:
  (NSDictionary *) defaults
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject
) {
  [[FIRRemoteConfig remoteConfig] setDefaults:defaults];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setDefaultsFromResource:
  (NSString *) fileName
      resolver:
      (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if ([[NSBundle mainBundle] pathForResource:fileName ofType:@"plist"] != nil) {
    [[FIRRemoteConfig remoteConfig] setDefaultsFromPlistFileName:fileName];
    resolve([NSNull null]);
  } else {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{@"code": @"resource_not_found",
        @"message": @"The specified resource name was not found."} mutableCopy]];
  }
}

#pragma mark -
#pragma mark Internal Helper Methods

- (NSDictionary *)getConfigSettings {
  FIRRemoteConfig *remoteConfig = [FIRRemoteConfig remoteConfig];
  BOOL isDeveloperModeEnabled = [RCTConvert BOOL:@([remoteConfig configSettings].isDeveloperModeEnabled)];
  NSString *lastFetchStatus = convertFIRRemoteConfigFetchStatusToNSString(remoteConfig.lastFetchStatus);
  NSDate *lastFetchTime = remoteConfig.lastFetchTime;
  return @{
      @"isDeveloperModeEnabled": @(isDeveloperModeEnabled),
      @"lastFetchTime": @(round([lastFetchTime timeIntervalSince1970] * 1000.0)),
      @"lastFetchStatus": lastFetchStatus
  };
}

@end
