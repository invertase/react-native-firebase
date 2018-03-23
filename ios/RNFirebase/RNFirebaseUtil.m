#import "RNFirebaseUtil.h"

@implementation RNFirebaseUtil

static NSString *const DEFAULT_APP_DISPLAY_NAME = @"[DEFAULT]";
static NSString *const DEFAULT_APP_NAME = @"__FIRAPP_DEFAULT";

+ (FIRApp *)getApp:(NSString *)appDisplayName {
    NSString *appName = [RNFirebaseUtil getAppName:appDisplayName];
    return [FIRApp appNamed:appName];
}

+ (NSString *)getAppName:(NSString *)appDisplayName {
    if ([appDisplayName isEqualToString:DEFAULT_APP_DISPLAY_NAME]) {
        return DEFAULT_APP_NAME;
    }
    return appDisplayName;
}

+ (NSString *)getAppDisplayName:(NSString *)appName {
    if ([appName isEqualToString:DEFAULT_APP_NAME]) {
        return DEFAULT_APP_DISPLAY_NAME;
    }
    return appName;
}

+ (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(id)body {
    @try {
        // TODO: Temporary fix for https://github.com/invertase/react-native-firebase/issues/233
        // until a better solution comes around
        if (emitter.bridge) {
            [emitter sendEventWithName:name body:body];
        }
    } @catch (NSException *error) {
        NSLog(@"An error occurred in sendJSEvent: %@", [error debugDescription]);
    }
}

+ (void)sendJSEventWithAppName:(RCTEventEmitter *)emitter app:(FIRApp *)app name:(NSString *)name body:(id)body {
    // Add the appName to the body
    NSMutableDictionary *newBody = [body mutableCopy];
    newBody[@"appName"] = [RNFirebaseUtil getAppDisplayName:app.name];
    
    [RNFirebaseUtil sendJSEvent:emitter name:name body:newBody];
}

@end
