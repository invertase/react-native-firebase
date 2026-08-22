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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#else
@import FirebaseCore;
@import FirebaseRemoteConfig;
#endif
#import <React/RCTConvert.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBConfigHelper.h"
#import "RNFBRemoteConfigListenerRegistry.h"

static NSString *const ON_CONFIG_UPDATED_EVENT = @"on_config_updated";

static __strong RNFBRemoteConfigListenerRegistry *configUpdateHandlers;

static NSString *convertFIRRemoteConfigFetchStatusToNSString(FIRRemoteConfigFetchStatus value) {
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

static NSString *convertFIRRemoteConfigFetchStatusToNSStringDescription(
    FIRRemoteConfigFetchStatus value) {
  switch (value) {
    case FIRRemoteConfigFetchStatusThrottled:
      return @"fetch() operation cannot be completed successfully, due to throttling.";
    case FIRRemoteConfigFetchStatusNoFetchYet:
    default:
      return @"fetch() operation cannot be completed successfully.";
  }
}

static NSString *convertFIRRemoteConfigSourceToNSString(FIRRemoteConfigSource value) {
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

static NSString *convertFIRRemoteConfigUpdateErrorToNSString(FIRRemoteConfigUpdateError value) {
  switch (value) {
    case FIRRemoteConfigUpdateErrorStreamError:
      return @"config_update_stream_error";
    case FIRRemoteConfigUpdateErrorMessageInvalid:
      return @"config_update_message_invalid";
    case FIRRemoteConfigUpdateErrorNotFetched:
      return @"config_update_not_fetched";
    case FIRRemoteConfigUpdateErrorUnavailable:
      return @"config_update_unavailable";
    default:
      return @"internal";
  }
}

static NSDictionary *convertFIRRemoteConfigValueToNSDictionary(FIRRemoteConfigValue *value) {
  return @{
    @"value" : (id)value.stringValue ?: [NSNull null],
    @"source" : convertFIRRemoteConfigSourceToNSString(value.source)
  };
}

static FIRApp *firebaseAppForName(NSString *appName) {
  return [RCTConvert firAppFromString:appName];
}

@implementation RNFBConfigHelper

+ (void)initializeConfigUpdateHandlersOnce {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    configUpdateHandlers = [[RNFBRemoteConfigListenerRegistry alloc] init];
  });
}

+ (NSDictionary *)getConstantsForAppName:(NSString *)appName {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  return [self getConstantsForApp:firebaseApp];
}

+ (NSDictionary *)getConstantsForApp:(FIRApp *)firebaseApp {
  FIRRemoteConfig *remoteConfig = [FIRRemoteConfig remoteConfigWithApp:firebaseApp];

  NSDate *lastFetchTime = remoteConfig.lastFetchTime;
  NSString *lastFetchStatus =
      convertFIRRemoteConfigFetchStatusToNSString(remoteConfig.lastFetchStatus);

  NSMutableDictionary *values = [NSMutableDictionary new];
  NSSet *keys = [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] keysWithPrefix:nil];
  for (NSString *key in keys) {
    FIRRemoteConfigValue *value =
        [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] configValueForKey:key];
    values[key] = convertFIRRemoteConfigValueToNSDictionary(value);
  }

  NSArray *defaultKeys = [remoteConfig allKeysFromSource:FIRRemoteConfigSourceDefault];
  for (NSString *key in defaultKeys) {
    if ([values valueForKey:key] == nil) {
      FIRRemoteConfigValue *value =
          [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] configValueForKey:key];
      values[key] = convertFIRRemoteConfigValueToNSDictionary(value);
    }
  }

  // Never read `[remoteConfig configSettings]` (firebase-ios-sdk getter/setter both
  // `recreateNetworkSession` / `invalidateAndCancel`). JS no-ops missing settings keys.
  return @{
    @"values" : values,
    @"lastFetchStatus" : lastFetchStatus,
    @"lastFetchTime" : @(round([lastFetchTime timeIntervalSince1970] * 1000.0)),
  };
}

+ (NSDictionary *)resultWithConstants:(id)result firebaseApp:(FIRApp *)firebaseApp {
  NSMutableDictionary *responseDict = [NSMutableDictionary new];
  responseDict[@"result"] = result;
  responseDict[@"constants"] = [self getConstantsForApp:firebaseApp];
  return responseDict;
}

+ (NSDictionary *)resultWithVoidConstantsForApp:(FIRApp *)firebaseApp {
  NSMutableDictionary *responseDict = [NSMutableDictionary new];
  responseDict[@"constants"] = [self getConstantsForApp:firebaseApp];
  return responseDict;
}

+ (void)ensureInitialized:(NSString *)appName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigInitializationCompletion completionHandler = ^(NSError *__nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
    } else {
      resolve([self resultWithVoidConstantsForApp:firebaseApp]);
    }
  };

  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
      ensureInitializedWithCompletionHandler:completionHandler];
}

+ (void)fetch:(NSString *)appName
    expirationDurationSeconds:(double)expirationDurationSeconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigFetchCompletion completionHandler =
      ^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
          [RNFBSharedUtils
              rejectPromiseWithUserInfo:reject
                               userInfo:[@{
                                 @"code" : convertFIRRemoteConfigFetchStatusToNSString(status),
                                 @"message" :
                                     convertFIRRemoteConfigFetchStatusToNSStringDescription(status),
                                 @"nativeErrorCode" : @(error.code),
                                 @"nativeErrorMessage" : error.localizedDescription ?: @""
                               } mutableCopy]];
        } else {
          resolve([self resultWithVoidConstantsForApp:firebaseApp]);
        }
      };

  if (expirationDurationSeconds == -1) {
    [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
        fetchWithCompletionHandler:completionHandler];
  } else {
    [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
        fetchWithExpirationDuration:expirationDurationSeconds
                  completionHandler:completionHandler];
  }
}

// Shared by `activate:` and `fetchAndActivate:` below - resolves with the `changed` BOOL from
// `-[FIRRemoteConfig activateWithCompletion:]`, treating the SDK's "already activated" error as a
// non-error `false` result rather than a rejection, since it just means there was nothing new to
// activate.
+ (void)rnfb_activateRemoteConfig:(FIRApp *)firebaseApp
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] activateWithCompletion:^(
                                                         BOOL changed, NSError *_Nullable error) {
    if (error) {
      if (error.userInfo && error.userInfo[@"ActivationFailureReason"] != nil &&
          [error.userInfo[@"ActivationFailureReason"] containsString:@"already activated"]) {
        resolve([self resultWithConstants:@([RCTConvert BOOL:@(NO)]) firebaseApp:firebaseApp]);
      } else {
        [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
      }
    } else {
      resolve([self resultWithConstants:@([RCTConvert BOOL:@(changed)]) firebaseApp:firebaseApp]);
    }
  }];
}

+ (void)fetchAndActivate:(NSString *)appName
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  // NOTE: We deliberately do not use `-[FIRRemoteConfig fetchAndActivateWithCompletionHandler:]`
  // here. Its `FIRRemoteConfigFetchAndActivateStatus` result only reflects whether the fetch
  // succeeded (`SuccessFetchedFromRemote`) vs fell back to previously fetched data
  // (`SuccessUsingPreFetchedData`) - it does NOT reflect whether activation actually changed any
  // config values, so it reports `SuccessFetchedFromRemote` (=> we'd resolve `true`) even when the
  // fetched values are identical to what's already active. See
  // https://github.com/invertase/react-native-firebase/issues/7779
  //
  // Instead we perform the fetch ourselves and hand off to the same activation + resolution logic
  // `activate()` uses, so `fetchAndActivate()` resolves `true` only when activation changed the
  // in-use config values - matching `activate()`'s own semantics as well as the Android
  // implementation.
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigFetchCompletion fetchCompletion =
      ^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
          [RNFBSharedUtils
              rejectPromiseWithUserInfo:reject
                               userInfo:[@{
                                 @"code" : convertFIRRemoteConfigFetchStatusToNSString(status),
                                 @"message" :
                                     convertFIRRemoteConfigFetchStatusToNSStringDescription(status),
                                 @"nativeErrorCode" : @(error.code),
                                 @"nativeErrorMessage" : error.localizedDescription ?: @""
                               } mutableCopy]];
          return;
        }

        [self rnfb_activateRemoteConfig:firebaseApp resolve:resolve reject:reject];
      };

  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] fetchWithCompletionHandler:fetchCompletion];
}

+ (void)activate:(NSString *)appName
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  [self rnfb_activateRemoteConfig:firebaseApp resolve:resolve reject:reject];
}

+ (void)setConfigSettings:(NSString *)appName
     minimumFetchInterval:(double)minimumFetchInterval
             fetchTimeout:(double)fetchTimeout
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] init];
  remoteConfigSettings.minimumFetchInterval = minimumFetchInterval;
  remoteConfigSettings.fetchTimeout = fetchTimeout;

  [FIRRemoteConfig remoteConfigWithApp:firebaseApp].configSettings = remoteConfigSettings;
  resolve([self resultWithVoidConstantsForApp:firebaseApp]);
}

+ (void)setDefaults:(NSString *)appName
           defaults:(NSDictionary *)defaults
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] setDefaults:defaults];
  resolve([self resultWithConstants:[NSNull null] firebaseApp:firebaseApp]);
}

+ (void)setDefaultsFromResource:(NSString *)appName
                   resourceName:(NSString *)resourceName
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  if ([[NSBundle mainBundle] pathForResource:resourceName ofType:@"plist"] != nil) {
    [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] setDefaultsFromPlistFileName:resourceName];
    resolve([self resultWithConstants:[NSNull null] firebaseApp:firebaseApp]);
  } else {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:[@{
                                        @"code" : @"resource_not_found",
                                        @"message" : @"The specified resource name was not found."
                                      } mutableCopy]];
  }
}

+ (void)reset:(NSString *)appName
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  resolve([self resultWithVoidConstantsForApp:firebaseApp]);
}

+ (void)onConfigUpdated:(NSString *)appName {
  [self initializeConfigUpdateHandlersOnce];

  FIRApp *firebaseApp = firebaseAppForName(appName);
  if ([configUpdateHandlers get:firebaseApp.name] != nil) {
    return;
  }

  FIRConfigUpdateListenerRegistration *newRegistration =
      [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
          addOnConfigUpdateListener:^(FIRRemoteConfigUpdate *_Nonnull configUpdate,
                                      NSError *_Nullable error) {
            if (error != nil) {
              NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];

              [userInfo setValue:@"error" forKey:@"resultType"];
              [userInfo setValue:convertFIRRemoteConfigUpdateErrorToNSString(
                                     (FIRRemoteConfigUpdateError)error.code)
                          forKey:@"code"];
              [userInfo setValue:error.localizedDescription forKey:@"message"];
              [userInfo setValue:error.localizedDescription forKey:@"nativeErrorMessage"];
              [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                            name:ON_CONFIG_UPDATED_EVENT
                                            body:userInfo];
              return;
            }

            NSMutableDictionary *results = [NSMutableDictionary dictionary];

            [results setValue:@"success" forKey:@"resultType"];
            [results setValue:[configUpdate.updatedKeys allObjects] forKey:@"updatedKeys"];

            [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                          name:ON_CONFIG_UPDATED_EVENT
                                          body:results];
          }];

  [configUpdateHandlers putOrDiscard:firebaseApp.name value:newRegistration];
}

+ (void)removeConfigUpdateRegistration:(NSString *)appName {
  [self initializeConfigUpdateHandlersOnce];
  FIRApp *firebaseApp = firebaseAppForName(appName);
  [configUpdateHandlers takeAndRemove:firebaseApp.name];
}

+ (void)removeAllConfigUpdateRegistrations {
  [self initializeConfigUpdateHandlersOnce];
  [configUpdateHandlers removeAll];
}

+ (void)setCustomSignals:(NSString *)appName
           customSignals:(NSDictionary *)customSignals
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  NSDictionary *decodedCustomSignals = [RNFBSharedUtils decodeNullSentinels:customSignals];
  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
      setCustomSignals:decodedCustomSignals
        withCompletion:^(NSError *_Nullable error) {
          if (error != nil) {
            [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
          } else {
            resolve([self resultWithVoidConstantsForApp:firebaseApp]);
          }
        }];
}

@end
