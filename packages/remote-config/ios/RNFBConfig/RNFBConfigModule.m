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
    case FIRRemoteConfigFetchStatusNoFetchYet:
      return @"no_fetch_yet";
    case FIRRemoteConfigFetchStatusSuccess:
      return @"success";
    case FIRRemoteConfigFetchStatusThrottled:
      return @"throttled";
    case FIRRemoteConfigFetchStatusFailure:
      return @"failure";
    default:
      return @"unknown";
  }
}

NSString *convertFIRRemoteConfigFetchStatusToNSStringDescription(FIRRemoteConfigFetchStatus value) {
  switch (value) {
    case FIRRemoteConfigFetchStatusThrottled:
      return @"fetch() operation cannot be completed successfully, due to throttling.";
    case FIRRemoteConfigFetchStatusNoFetchYet:
    default:
      return @"fetch() operation cannot be completed successfully.";
  }
}

NSString *convertFIRRemoteConfigSourceToNSString(FIRRemoteConfigSource value) {
  switch (value) {
    case FIRRemoteConfigSourceDefault:
      return @"default";
    case FIRRemoteConfigSourceRemote:
      return @"remote";
    case FIRRemoteConfigSourceStatic:
      return @"static";
    default:
      return @"unknown";
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
  return YES;
}

#pragma mark -
#pragma mark Firebase Config Methods

RCT_EXPORT_METHOD(fetch:
  (nonnull
    NSNumber *)expirationDuration
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRRemoteConfigFetchCompletion completionHandler = ^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": convertFIRRemoteConfigFetchStatusToNSString(status),
          @"message": convertFIRRemoteConfigFetchStatusToNSStringDescription(status)} mutableCopy]];
    } else {
      resolve([self resultWithConstants:[NSNull null]]);
    }
  };

  if (expirationDuration == @(-1)) {
    [[FIRRemoteConfig remoteConfig] fetchWithCompletionHandler:completionHandler];
  } else {
    [[FIRRemoteConfig remoteConfig] fetchWithExpirationDuration:expirationDuration.doubleValue completionHandler:completionHandler];
  }
}

RCT_EXPORT_METHOD(fetchAndActivate:
  (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRRemoteConfigFetchCompletion completionHandler = ^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
          @"code": convertFIRRemoteConfigFetchStatusToNSString(status),
          @"message": convertFIRRemoteConfigFetchStatusToNSStringDescription(status)} mutableCopy]];
    } else {
      resolve([self resultWithConstants:@([[FIRRemoteConfig remoteConfig] activateFetched])]);
    }
  };

  [[FIRRemoteConfig remoteConfig] fetchWithCompletionHandler:completionHandler];
}

RCT_EXPORT_METHOD(activate:
  (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  BOOL status = [[FIRRemoteConfig remoteConfig] activateFetched];
  resolve([self resultWithConstants:@(status)]);
}

RCT_EXPORT_METHOD(setConfigSettings:
  (NSDictionary *) configSettings
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  FIRRemoteConfigSettings *remoteConfigSettings =
      [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:[configSettings[@"isDeveloperModeEnabled"] boolValue]];

  if ([configSettings objectForKey:@"minimumFetchInterval"]) {
    remoteConfigSettings.minimumFetchInterval = [configSettings[@"minimumFetchInterval"] doubleValue];
  }

  [FIRRemoteConfig remoteConfig].configSettings = remoteConfigSettings;
  resolve([self resultWithConstants:[NSNull null]]);
}

RCT_EXPORT_METHOD(setDefaults:
  (NSDictionary *) defaults
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  [[FIRRemoteConfig remoteConfig] setDefaults:defaults];
  resolve([self resultWithConstants:[NSNull null]]);
}

RCT_EXPORT_METHOD(setDefaultsFromResource:
  (NSString *) fileName
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject) {
  if ([[NSBundle mainBundle] pathForResource:fileName ofType:@"plist"] != nil) {
    [[FIRRemoteConfig remoteConfig] setDefaultsFromPlistFileName:fileName];
    resolve([self resultWithConstants:[NSNull null]]);
  } else {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{@"code": @"resource_not_found",
        @"message": @"The specified resource name was not found."} mutableCopy]];
  }
}

#pragma mark -
#pragma mark Internal Helper Methods

- (NSDictionary *)resultWithConstants:(id)result {
  NSMutableDictionary *responseDict = [NSMutableDictionary new];
  responseDict[@"result"] = result;
  responseDict[@"constants"] = [self getConstantsForApp];
  return responseDict;
}

// TODO only for default app, add support for multiple apps once SDK supports it
- (NSDictionary *)getConstantsForApp {
  FIRRemoteConfig *remoteConfig = [FIRRemoteConfig remoteConfig];

  NSDate *lastFetchTime = remoteConfig.lastFetchTime;
  BOOL isDeveloperModeEnabled = [RCTConvert BOOL:@([remoteConfig configSettings].isDeveloperModeEnabled)];
  NSString *lastFetchStatus = convertFIRRemoteConfigFetchStatusToNSString(remoteConfig.lastFetchStatus);
  double minimumFetchInterval = [RCTConvert double:@([remoteConfig configSettings].minimumFetchInterval)];

  NSMutableDictionary *values = [NSMutableDictionary new];
  NSSet *keys = [[FIRRemoteConfig remoteConfig] keysWithPrefix:nil];
  for (NSString *key in keys) {
    FIRRemoteConfigValue *value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
    values[key] = convertFIRRemoteConfigValueToNSDictionary(value);
  }

  NSArray *defaultKeys = [remoteConfig allKeysFromSource:FIRRemoteConfigSourceDefault namespace:FIRNamespaceGoogleMobilePlatform];
  for (NSString *key in defaultKeys) {
    if ([values valueForKey:key] == nil) {
      FIRRemoteConfigValue *value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
      values[key] = convertFIRRemoteConfigValueToNSDictionary(value);
    }
  }

  return @{
      @"values": values,
      @"lastFetchStatus": lastFetchStatus,
      @"isDeveloperModeEnabled": @(isDeveloperModeEnabled),
      @"lastFetchTime": @(round([lastFetchTime timeIntervalSince1970] * 1000.0)),
      @"minimumFetchInterval": @(minimumFetchInterval)
  };
}

- (NSDictionary *)constantsToExport {
  NSDictionary *firApps = [FIRApp allApps];
  NSMutableDictionary *constants = [NSMutableDictionary new];
  NSMutableDictionary *constantsForApps = [NSMutableDictionary new];
  for (id key in firApps) {
    constantsForApps[[RNFBSharedUtils getAppJavaScriptName:key]] = [self getConstantsForApp];
  }
  constants[@"REMOTE_CONFIG_APP_CONSTANTS"] = constantsForApps;
  return constants;
}

@end
