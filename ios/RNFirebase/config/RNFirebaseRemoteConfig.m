#import "RNFirebaseRemoteConfig.h"

#if __has_include(<FirebaseRemoteConfig/FirebaseRemoteConfig.h>)

#import <FirebaseRemoteConfig/FirebaseRemoteConfig.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

NSString *convertFIRRemoteConfigFetchStatusToNSString(FIRRemoteConfigFetchStatus value) {
    switch (value) {
        case FIRRemoteConfigFetchStatusNoFetchYet:
            return @"config/no_fetch_yet";
        case FIRRemoteConfigFetchStatusSuccess:
            return @"config/success";
        case FIRRemoteConfigFetchStatusThrottled:
            return @"config/throttled";
        default:
            return @"config/failure";
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
        default:
            return @"static";
    }
}

NSDictionary *convertFIRRemoteConfigValueToNSDictionary(FIRRemoteConfigValue *value) {
    return @{@"stringValue": value.stringValue ?: [NSNull null], @"numberValue": value.numberValue ?: [NSNull null], @"dataValue": value.dataValue ? [value.dataValue base64EncodedStringWithOptions:0] : [NSNull null], @"boolValue": @(value.boolValue), @"source": convertFIRRemoteConfigSourceToNSString(value.source)};
}

@implementation RNFirebaseRemoteConfig

RCT_EXPORT_MODULE(RNFirebaseRemoteConfig);

RCT_EXPORT_METHOD(enableDeveloperMode) {
    FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:YES];
    [FIRRemoteConfig remoteConfig].configSettings = remoteConfigSettings;
}

RCT_EXPORT_METHOD(fetch:
    (RCTPromiseResolveBlock) resolve
            rejecter:
            (RCTPromiseRejectBlock) reject) {
    [[FIRRemoteConfig remoteConfig] fetchWithCompletionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
            reject(convertFIRRemoteConfigFetchStatusToNSString(status), convertFIRRemoteConfigFetchStatusToNSStringDescription(status), error);
        } else {
            resolve([NSNull null]);
        }
    }];
}

RCT_EXPORT_METHOD(fetchWithExpirationDuration:
    (nonnull
        NSNumber *)expirationDuration
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject) {
    [[FIRRemoteConfig remoteConfig] fetchWithExpirationDuration:expirationDuration.doubleValue completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *__nullable error) {
        if (error) {
            reject(convertFIRRemoteConfigFetchStatusToNSString(status), convertFIRRemoteConfigFetchStatusToNSStringDescription(status), error);
        } else {
            resolve([NSNull null]);
        }
    }];
}

RCT_EXPORT_METHOD(activateFetched:
    (RCTPromiseResolveBlock) resolve
            rejecter:
            (RCTPromiseRejectBlock) reject) {
    BOOL status = [[FIRRemoteConfig remoteConfig] activateFetched];
    resolve(@(status));
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

#else
@implementation RNFirebaseRemoteConfig
@end
#endif
