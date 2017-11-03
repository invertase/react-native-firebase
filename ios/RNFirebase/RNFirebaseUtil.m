#import "RNFirebaseUtil.h"

@implementation RNFirebaseUtil

+ (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(NSDictionary *)body {
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

+ (void)sendJSEventWithAppName:(RCTEventEmitter *)emitter appName:(NSString *)appName name:(NSString *)name body:(NSDictionary *)body {
    // Add the appName to the body
    NSMutableDictionary *newBody = [body mutableCopy];
    newBody[@"appName"] = appName;
    
    [RNFirebaseUtil sendJSEvent:emitter name:name body:newBody];
}

@end
