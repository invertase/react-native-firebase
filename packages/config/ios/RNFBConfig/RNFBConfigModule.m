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
#import "RNFBApp/RNFBSharedUtils.h"


@implementation RNFBConfigModule
#pragma mark -
# pragma mark Converters
    
    NSString *convertFIRRemoteConfigFetchStatusToNSString(FIRRemoteConfigFetchStatus value) {
        switch (value) {
            case FIRRemoteConfigFetchStatusNoFetchYet:
            return @"config/no_fetch_yet";
            case FIRRemoteConfigFetchStatusSuccess:
            return @"config/success";
            case FIRRemoteConfigFetchStatusThrottled:
            return @"config/throttled";
            case FIRRemoteConfigFetchStatusFailure:
            return @"config/failure";
            default:
            return @"config/unknown";
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
    
#pragma mark -
#pragma mark Firebase Config Methods
    
    RCT_EXPORT_METHOD(enableDeveloperMode) {
        FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:YES];
        [FIRRemoteConfig remoteConfig].configSettings = remoteConfigSettings;
    }
    
    RCT_EXPORT_METHOD(fetch:
                      (nullable
                       NSNumber *)expirationDuration
                      resolver:(RCTPromiseResolveBlock)resolve
                      rejecter:(RCTPromiseRejectBlock)reject) {
        if (expirationDuration == nil) {
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
                  @"lastFetchTime": lastFetchTime,
                  @"lastFetchStatus": lastFetchStatus
                  });
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
    
    RCT_EXPORT_METHOD(setDefaults:
                      (NSDictionary *) defaults) {
        [[FIRRemoteConfig remoteConfig] setDefaults:defaults];
    }
    
    RCT_EXPORT_METHOD(setDefaultsFromResource:
                      (NSString *) fileName) {
        [[FIRRemoteConfig remoteConfig] setDefaultsFromPlistFileName:fileName];
    }
    
    
    @end
