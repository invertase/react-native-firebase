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

#import "RNFBSharedUtils.h"
#import "RNFBAppModule.h"
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "RNFBPreferences.h"
#import "RNFBRCTEventEmitter.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

#pragma mark -
#pragma mark Constants

NSString *const DEFAULT_APP_DISPLAY_NAME = @"[DEFAULT]";
NSString *const DEFAULT_APP_NAME = @"__FIRAPP_DEFAULT";

/**
 * Adapts `RNFBMeta` class methods to the instance-based config source protocol used by
 * `RNFBSharedUtilsConfig`.
 */
@interface RNFBConfigMetaSource : NSObject <RNFBConfigBooleanProviding>
@end

@implementation RNFBConfigMetaSource

- (BOOL)contains:(NSString *)key {
  return [RNFBMeta contains:key];
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  return [RNFBMeta getBooleanValue:key defaultValue:defaultValue];
}

@end

static id<RNFBConfigBooleanProviding> RNFBSharedUtilsMetaConfigSource(void) {
  static RNFBConfigMetaSource *sharedSource;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedSource = [[RNFBConfigMetaSource alloc] init];
  });
  return sharedSource;
}

/**
 * Adapts live `FIROptions` to the injectable protocol used by `RNFBSharedUtilsFIRApp`.
 */
@interface RNFBFIROptionsAdapter : NSObject <RNFBFIROptionsProviding>
@property(nonatomic, strong) FIROptions *options;
@end

@implementation RNFBFIROptionsAdapter

- (NSString *)apiKey {
  return self.options.APIKey;
}

- (NSString *)googleAppID {
  return self.options.googleAppID;
}

- (NSString *)projectID {
  return self.options.projectID;
}

- (NSString *)databaseURL {
  return self.options.databaseURL;
}

- (NSString *)storageBucket {
  return self.options.storageBucket;
}

- (NSString *)gcmSenderID {
  return self.options.GCMSenderID;
}

- (NSString *)clientID {
  return self.options.clientID;
}

@end

/**
 * Adapts live `FIRApp` to the injectable protocol used by `RNFBSharedUtilsFIRApp`.
 */
@interface RNFBFIRAppAdapter : NSObject <RNFBFIRAppProviding>
@property(nonatomic, strong) FIRApp *app;
@property(nonatomic, strong) RNFBFIROptionsAdapter *optionsAdapter;
@end

@implementation RNFBFIRAppAdapter

- (instancetype)initWithFIRApp:(FIRApp *)app {
  self = [super init];
  if (self) {
    _app = app;
    _optionsAdapter = [RNFBFIROptionsAdapter new];
    _optionsAdapter.options = app.options;
  }
  return self;
}

- (NSString *)name {
  return self.app.name;
}

- (id<RNFBFIROptionsProviding>)options {
  return self.optionsAdapter;
}

- (BOOL)isDataCollectionDefaultEnabled {
  return [self.app isDataCollectionDefaultEnabled];
}

@end

/**
 * Adapts `RNFBAppModule getCustomDomain:` for `RNFBSharedUtilsFIRApp`.
 */
@interface RNFBCustomDomainProvider : NSObject <RNFBCustomDomainProviding>
@end

@implementation RNFBCustomDomainProvider

- (NSString *)getCustomDomain:(NSString *)appName {
  return [RNFBAppModule getCustomDomain:appName];
}

@end

/**
 * Adapts `RNFBRCTEventEmitter.shared` for `RNFBSharedUtilsFIRApp`.
 */
@interface RNFBJSEventSender : NSObject <RNFBJSEventSending>
@end

@implementation RNFBJSEventSender

- (void)sendEventWithName:(NSString *)name body:(id)body {
  [[RNFBRCTEventEmitter shared] sendEventWithName:name body:body];
}

@end

static id<RNFBCustomDomainProviding> RNFBSharedUtilsCustomDomainProvider(void) {
  static RNFBCustomDomainProvider *sharedProvider;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedProvider = [[RNFBCustomDomainProvider alloc] init];
  });
  return sharedProvider;
}

static id<RNFBJSEventSending> RNFBSharedUtilsJSEventSender(void) {
  static RNFBJSEventSender *sharedSender;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedSender = [[RNFBJSEventSender alloc] init];
  });
  return sharedSender;
}

@implementation RNFBSharedUtils

#pragma mark -
#pragma mark Methods

+ (NSString *)getAppJavaScriptName:(NSString *)appDisplayName {
  return [RNFBSharedUtilsFormatting getAppJavaScriptName:appDisplayName];
}

+ (NSDictionary *)firAppToDictionary:(FIRApp *)firApp {
  RNFBFIRAppAdapter *adapter = [[RNFBFIRAppAdapter alloc] initWithFIRApp:firApp];
  return [RNFBSharedUtilsFIRApp firAppToDictionary:adapter
                              customDomainProvider:RNFBSharedUtilsCustomDomainProvider()];
}

+ (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject
                             exception:(NSException *)exception {
  [RNFBSharedUtilsPromiseRejection rejectPromiseWithException:reject exception:exception];
}

+ (void)rejectPromiseWithNSError:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  [RNFBSharedUtilsPromiseRejection rejectPromiseWithNSError:reject error:error];
}

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo {
  [RNFBSharedUtilsPromiseRejection rejectPromiseWithUserInfo:reject userInfo:userInfo];
}

// for easier v5 migration
+ (void)sendJSEventForApp:(FIRApp *)app name:(NSString *)name body:(NSDictionary *)body {
  RNFBFIRAppAdapter *adapter = [[RNFBFIRAppAdapter alloc] initWithFIRApp:app];
  [RNFBSharedUtilsFIRApp sendJSEventForApp:adapter
                                      name:name
                                      body:body
                               eventSender:RNFBSharedUtilsJSEventSender()];
}

+ (NSString *)getISO8601String:(NSDate *)date {
  return [RNFBSharedUtilsFormatting getISO8601String:date];
}

+ (BOOL)configContains:(NSString *)key {
  return [RNFBSharedUtilsConfig
      configContainsKey:key
            preferences:(id<RNFBConfigBooleanProviding>)[RNFBPreferences shared]
                   json:(id<RNFBConfigBooleanProviding>)[RNFBJSON shared]
                   meta:RNFBSharedUtilsMetaConfigSource()];
}

+ (BOOL)getConfigBooleanValue:(NSString *)tag key:(NSString *)key defaultValue:(BOOL)defaultValue {
  BOOL enabled = [RNFBSharedUtilsConfig
      getConfigBooleanValueForKey:key
                     defaultValue:defaultValue
                      preferences:(id<RNFBConfigBooleanProviding>)[RNFBPreferences shared]
                             json:(id<RNFBConfigBooleanProviding>)[RNFBJSON shared]
                             meta:RNFBSharedUtilsMetaConfigSource()];
  // Branch-specific "via Preferences/JSON/Meta" DLogs lived in the pre-port body; keep the
  // final-value log on the ObjC façade (DLog is an ObjC macro; return value unchanged).
  DLog(@"%@ %@ final value: %d", tag, key, enabled);
  return enabled;
}

/**
 * Decodes null sentinel objects back to NSNull values.
 * Uses iterative stack-based traversal to avoid stack overflow on deeply nested structures.
 *
 * This reverses the encoding done on the JavaScript side where null values in object
 * properties are replaced with {__rnfbNull: true} sentinel objects to survive iOS
 * TurboModule serialization.
 *
 * Process:
 * 1. Detects sentinel objects: dictionaries with single key "__rnfbNull" set to true
 * 2. Replaces sentinels with NSNull in object properties and arrays
 * 3. Preserves regular NSNull values that were in arrays (never encoded as sentinels)
 * 4. Deep processes all nested objects and arrays using a stack-based iteration
 *
 * @param value - The value to decode (dictionary, array, or primitive)
 * @return The decoded value with sentinels replaced by NSNull
 */
+ (id)decodeNullSentinels:(id)value {
  return [RNFBNullSentinelDecoder decode:value];
}

@end
