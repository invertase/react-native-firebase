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
    return @{@"stringValue": value.stringValue ?: [NSNull null], @"numberValue": value.numberValue ?: [NSNull null], @"dataValue": value.dataValue ? [value.dataValue base64EncodedStringWithOptions:0] : [NSNull null], @"boolValue": @(value.boolValue), @"source": convertFIRRemoteConfigSourceToNSString(value.source)};
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
    (nonnull NSNumber *)expirationDuration
      resolver:(RCTPromiseResolveBlock)resolve
      rejecter:(RCTPromiseRejectBlock)reject) {
    if (expirationDuration == @(-1)) {
      [[FIRRemoteConfig remoteConfig] fetchWithExpirationDuration:expirationDuration.doubleValue completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
          reject(convertFIRRemoteConfigFetchStatusToNSString(status), convertFIRRemoteConfigFetchStatusToNSStringDescription(status), error);
        } else {
          resolve([NSNull null]);
        }
      }];
    } else {
      [[FIRRemoteConfig remoteConfig] fetchWithCompletionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
          reject(convertFIRRemoteConfigFetchStatusToNSString(status), convertFIRRemoteConfigFetchStatusToNSStringDescription(status), error);
        } else {
          resolve([NSNull null]);
        }
      }];
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
    FIRRemoteConfig *remoteConfig = [FIRRemoteConfig remoteConfig];
    BOOL isDeveloperModeEnabled = [RCTConvert BOOL:@([remoteConfig configSettings].isDeveloperModeEnabled)];
    NSString *lastFetchStatus = convertFIRRemoteConfigFetchStatusToNSString(remoteConfig.lastFetchStatus);
    NSDate *lastFetchTime = remoteConfig.lastFetchTime;
    resolve(@{
        @"isDeveloperModeEnabled": @(isDeveloperModeEnabled),
        @"lastFetchTime": @(round([lastFetchTime timeIntervalSince1970])),
        @"lastFetchStatus": lastFetchStatus
    });
  }

  RCT_EXPORT_METHOD(getValue:
    (NSString *) key
        namespace:
        (nullable
      NSString *) namespace
      resolver:
  (RCTPromiseResolveBlock) resolve
      rejecter:
  (RCTPromiseRejectBlock) reject) {
    FIRRemoteConfigValue *value;

    if (namespace != nil) {
      value = [[FIRRemoteConfig remoteConfig] configValueForKey:key namespace:namespace];
    } else {
      value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
    }

    resolve(convertFIRRemoteConfigValueToNSDictionary(value));
  }

  RCT_EXPORT_METHOD(getValues:
    (NSArray *) keys
        namespace:
        (nullable
      NSString *) namespace
      resolver:
  (RCTPromiseResolveBlock) resolve
      rejecter:
  (RCTPromiseRejectBlock) reject) {
    NSMutableArray *valuesArray = [[NSMutableArray alloc] init];

    for (NSString *key in keys) {
      FIRRemoteConfigValue *value;
      if (namespace != nil) {
        value = [[FIRRemoteConfig remoteConfig] configValueForKey:key namespace:namespace];
      } else {
        value = [[FIRRemoteConfig remoteConfig] configValueForKey:key];
      }
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
    FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:[configSettings[@"isDeveloperModeEnabled"] boolValue]];
    [FIRRemoteConfig remoteConfig].configSettings = remoteConfigSettings;
    resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(getKeysByPrefix:
    (NSString *) prefix
        namespace:
        (nullable
      NSString *) namespace
      resolver:
  (RCTPromiseResolveBlock) resolve
      rejecter:
  (RCTPromiseRejectBlock) reject) {
    NSSet *keys;
    if (namespace != nil) {
      keys = [[FIRRemoteConfig remoteConfig] keysWithPrefix:prefix namespace:namespace];
    } else {
      keys = [[FIRRemoteConfig remoteConfig] keysWithPrefix:prefix];
    }

    NSMutableArray *keysArray = [[NSMutableArray alloc] init];
    for (NSString *key in keys) {
      [keysArray addObject:key];
    }

    resolve(keysArray);
  }

  RCT_EXPORT_METHOD(setDefaults:
    (NSDictionary *) defaults
        namespace:
        (nullable
      NSString *) namespace
      resolver:
  (RCTPromiseResolveBlock) resolve
      rejecter:
  (RCTPromiseRejectBlock) reject
  ) {
    if (namespace != nil) {
      [[FIRRemoteConfig remoteConfig] setDefaults:defaults namespace:namespace];
    } else {
      [[FIRRemoteConfig remoteConfig] setDefaults:defaults];
    }

    resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setDefaultsFromResource:
    (NSString *) fileName
        namespace:
        (nullable
      NSString *) namespace
      resolver:
  (RCTPromiseResolveBlock) resolve
      rejecter:
  (RCTPromiseRejectBlock) reject) {
    if ([[NSBundle mainBundle] pathForResource:fileName ofType:@"plist"] != nil) {
      [[FIRRemoteConfig remoteConfig] setDefaultsFromPlistFileName:fileName];
      resolve([NSNull null]);
    } else {
      // TODO(salakar) cleanup error codes to match other modules
      reject(@"config/resource_not_found", @"The specified resource name was not found.", nil);
    }
  }
@end
