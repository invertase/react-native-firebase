#import "RNFirebaseRemoteConfig.h"

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#else // Compatibility for RN version < 0.40
#import "RCTConvert.h"
#endif
#if __has_include(<React/RCTUtils.h>)
#import <React/RCTUtils.h>
#else // Compatibility for RN version < 0.40
#import "RCTUtils.h"
#endif

#import "FirebaseRemoteConfig/FirebaseRemoteConfig.h"

NSString *convertFIRRemoteConfigFetchStatusToNSString(FIRRemoteConfigFetchStatus value)
{
    switch(value){
        case FIRRemoteConfigFetchStatusNoFetchYet:
            return @"remoteConfitFetchStatusNoFetchYet";
        case FIRRemoteConfigFetchStatusSuccess:
            return @"remoteConfitFetchStatusSuccess";
        case FIRRemoteConfigFetchStatusFailure:
            return @"remoteConfitFetchStatusFailure";
        case FIRRemoteConfigFetchStatusThrottled:
            return @"remoteConfitFetchStatusThrottled";
        default:
            return @"remoteConfitFetchStatusFailure";
    }
}

NSString *convertFIRRemoteConfigSourceToNSString(FIRRemoteConfigSource value)
{
    switch(value) {
        case FIRRemoteConfigSourceRemote:
            return @"remoteConfigSourceRemote";
        case FIRRemoteConfigSourceDefault:
            return @"remoteConfigSourceDefault";
        case FIRRemoteConfigSourceStatic:
            return @"remoteConfigSourceStatic";
        default:
            return @"remoteConfigSourceStatic";
    }
}

NSDictionary *convertFIRRemoteConfigValueToNSDictionary(FIRRemoteConfigValue *value)
{
    return @{
             @"stringValue" : value.stringValue ?: [NSNull null],
             @"numberValue" : value.numberValue ?: [NSNull null],
             @"dataValue" : value.dataValue ? [value.dataValue base64EncodedStringWithOptions:0] : [NSNull null],
             @"boolValue" : @(value.boolValue),
             @"source" : convertFIRRemoteConfigSourceToNSString(value.source)
             };
}

@interface RNFirebaseRemoteConfig ()

@property (nonatomic, readwrite, weak) FIRRemoteConfig *remoteConfig;

@end

@implementation RNFirebaseRemoteConfig

RCT_EXPORT_MODULE(RNFirebaseRemoteConfig);

- (id)init
{
    if (self = [super init]) {
        _remoteConfig = [FIRRemoteConfig remoteConfig];
    }
    return self;
}

RCT_EXPORT_METHOD(enableDeveloperMode)
{
    FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:YES];
    self.remoteConfig.configSettings = remoteConfigSettings;
}

RCT_EXPORT_METHOD(fetch:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self.remoteConfig fetchWithCompletionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
            RCTLogError(@"\nError: %@", RCTJSErrorFromNSError(error));
            reject(convertFIRRemoteConfigFetchStatusToNSString(status), error.localizedDescription, error);
        } else {
            resolve(convertFIRRemoteConfigFetchStatusToNSString(status));
        }
    }];
}

RCT_EXPORT_METHOD(fetchWithExpirationDuration:(NSNumber *)expirationDuration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self.remoteConfig fetchWithExpirationDuration:expirationDuration.doubleValue completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
            RCTLogError(@"\nError: %@", RCTJSErrorFromNSError(error));
            reject(convertFIRRemoteConfigFetchStatusToNSString(status), error.localizedDescription, error);
        } else {
            resolve(convertFIRRemoteConfigFetchStatusToNSString(status));
        }
    }];
}

RCT_EXPORT_METHOD(activateFetched:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL status = [self.remoteConfig activateFetched];
    if (status) {
        resolve(@(status));
    } else {
        reject(@"activate_failed", @"Did not activate remote config", nil);
    }
}

RCT_EXPORT_METHOD(configValueForKey:(NSString *)key
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    FIRRemoteConfigValue *value = [self.remoteConfig configValueForKey:key];
    resolve(convertFIRRemoteConfigValueToNSDictionary(value));
}

RCT_EXPORT_METHOD(configValuesForKeys:(NSArray *)keys
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableDictionary *res = [[NSMutableDictionary alloc] init];
    for (NSString *key in keys) {
      FIRRemoteConfigValue *value = [self.remoteConfig configValueForKey:key];
      res[key] = convertFIRRemoteConfigValueToNSDictionary(value);
    }
    resolve(res);
}

RCT_EXPORT_METHOD(keysWithPrefix:(NSString *)prefix
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSSet *keys = [self.remoteConfig keysWithPrefix:prefix];
    if (keys.count) {
        resolve(keys);
    } else {
        reject(@"no_keys_matching_prefix", @"There are no keys that match that prefix", nil);
    }
}

RCT_EXPORT_METHOD(setDefaults:(NSDictionary *)defaults)
{
    [self.remoteConfig setDefaults:defaults];
}

RCT_EXPORT_METHOD(setDefaultsFromPlistFileName:(NSString *)fileName)
{
    [self.remoteConfig setDefaultsFromPlistFileName:fileName];
}

@end
