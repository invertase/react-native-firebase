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

#import "RNFBConfigModule.h"
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"

static NSString *const ON_CONFIG_UPDATED_EVENT = @"on_config_updated";

static __strong NSMutableDictionary *configUpdateHandlers;

@implementation RNFBConfigModule
#pragma mark -
#pragma mark Converters

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

NSString *convertFIRRemoteConfigUpdateErrorToNSString(FIRRemoteConfigUpdateError value) {
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

NSDictionary *convertFIRRemoteConfigValueToNSDictionary(FIRRemoteConfigValue *value) {
  return @{
    @"value" : (id)value.stringValue ?: [NSNull null],
    @"source" : convertFIRRemoteConfigSourceToNSString(value.source)
  };
}

static FIRApp *firebaseAppForName(NSString *appName) {
  return [RCTConvert firAppFromString:appName];
}

#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboConfig)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      configUpdateHandlers = [[NSMutableDictionary alloc] init];
    });
  }
  return self;
}

- (void)invalidate {
  for (NSString *key in [configUpdateHandlers allKeys]) {
    FIRConfigUpdateListenerRegistration *registration = [configUpdateHandlers objectForKey:key];
    [registration remove];
  }

  [configUpdateHandlers removeAllObjects];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboConfigSpecJSI>(params);
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboConfig::Constants::Builder>)
    constantsToExport {
  return [_RCTTypedModuleConstants
      newWithUnsafeDictionary:[self getConstantsForApp:firebaseAppForName(DEFAULT_APP_DISPLAY_NAME)]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboConfig::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

#pragma mark -
#pragma mark Firebase Config Methods

- (void)ensureInitialized:(NSString *)appName
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

- (void)fetch:(NSString *)appName
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
                                     convertFIRRemoteConfigFetchStatusToNSStringDescription(status)
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

- (void)fetchAndActivate:(NSString *)appName
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigFetchAndActivateCompletion completionHandler =
      ^(FIRRemoteConfigFetchAndActivateStatus status, NSError *__nullable error) {
        if (error) {
          if (error.userInfo && error.userInfo[@"ActivationFailureReason"] != nil &&
              [error.userInfo[@"ActivationFailureReason"] containsString:@"already activated"]) {
            resolve([self resultWithConstants:@([RCTConvert BOOL:@(YES)]) firebaseApp:firebaseApp]);
          } else {
            [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
          }
        } else {
          if (status == FIRRemoteConfigFetchAndActivateStatusSuccessFetchedFromRemote) {
            resolve([self resultWithConstants:@([RCTConvert BOOL:@(YES)]) firebaseApp:firebaseApp]);
            return;
          }
          resolve([self resultWithConstants:@([RCTConvert BOOL:@(NO)]) firebaseApp:firebaseApp]);
        }
      };

  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp]
      fetchAndActivateWithCompletionHandler:completionHandler];
}

- (void)activate:(NSString *)appName
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
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

- (void)setConfigSettings:(NSString *)appName
                 settings:(JS::NativeRNFBTurboConfig::ConfigSettings &)configSettings
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] init];
  remoteConfigSettings.minimumFetchInterval = configSettings.minimumFetchInterval();
  remoteConfigSettings.fetchTimeout = configSettings.fetchTimeout();

  [FIRRemoteConfig remoteConfigWithApp:firebaseApp].configSettings = remoteConfigSettings;
  resolve([self resultWithVoidConstantsForApp:firebaseApp]);
}

- (void)setDefaults:(NSString *)appName
           defaults:(NSDictionary *)defaults
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  [[FIRRemoteConfig remoteConfigWithApp:firebaseApp] setDefaults:defaults];
  resolve([self resultWithConstants:[NSNull null] firebaseApp:firebaseApp]);
}

- (void)setDefaultsFromResource:(NSString *)appName
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

- (void)reset:(NSString *)appName
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  resolve([self resultWithVoidConstantsForApp:firebaseApp]);
}

- (void)onConfigUpdated:(NSString *)appName {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  if (![configUpdateHandlers valueForKey:firebaseApp.name]) {
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

    configUpdateHandlers[firebaseApp.name] = newRegistration;
  }
}

- (void)removeConfigUpdateRegistration:(NSString *)appName {
  FIRApp *firebaseApp = firebaseAppForName(appName);
  if ([configUpdateHandlers valueForKey:firebaseApp.name]) {
    [[configUpdateHandlers objectForKey:firebaseApp.name] remove];
    [configUpdateHandlers removeObjectForKey:firebaseApp.name];
  }
}

- (void)setCustomSignals:(NSString *)appName
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

#pragma mark -
#pragma mark Internal Helper Methods

- (NSDictionary *)resultWithConstants:(id)result firebaseApp:(FIRApp *)firebaseApp {
  NSMutableDictionary *responseDict = [NSMutableDictionary new];
  responseDict[@"result"] = result;
  responseDict[@"constants"] = [self getConstantsForApp:firebaseApp];
  return responseDict;
}

- (NSDictionary *)resultWithVoidConstantsForApp:(FIRApp *)firebaseApp {
  NSMutableDictionary *responseDict = [NSMutableDictionary new];
  responseDict[@"constants"] = [self getConstantsForApp:firebaseApp];
  return responseDict;
}

- (NSDictionary *)getConstantsForApp:(FIRApp *)firebaseApp {
  FIRRemoteConfig *remoteConfig = [FIRRemoteConfig remoteConfigWithApp:firebaseApp];

  NSDate *lastFetchTime = remoteConfig.lastFetchTime;
  NSString *lastFetchStatus =
      convertFIRRemoteConfigFetchStatusToNSString(remoteConfig.lastFetchStatus);
  double minimumFetchInterval =
      [RCTConvert double:@([remoteConfig configSettings].minimumFetchInterval)];
  double fetchTimeout = [RCTConvert double:@([remoteConfig configSettings].fetchTimeout)];

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

  return @{
    @"values" : values,
    @"lastFetchStatus" : lastFetchStatus,
    @"lastFetchTime" : @(round([lastFetchTime timeIntervalSince1970] * 1000.0)),
    @"minimumFetchInterval" : @(minimumFetchInterval),
    @"fetchTimeout" : @(fetchTimeout)
  };
}

@end
