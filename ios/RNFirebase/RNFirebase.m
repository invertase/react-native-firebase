#import "RNFirebase.h"
#import "RNFirebaseUtil.h"
#import <FirebaseCore/FirebaseCore.h>

@implementation RNFirebase
RCT_EXPORT_MODULE(RNFirebase);

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebase instance");
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[];
}

/**
 * Initialize a new firebase app instance or ignore if currently exists.
 * @return
 */
RCT_EXPORT_METHOD(initializeApp:
    (NSString *) appDisplayName
            options:
            (NSDictionary *) options
            callback:
            (RCTResponseSenderBlock) callback) {

    dispatch_sync(dispatch_get_main_queue(), ^{
        FIRApp *existingApp = [RNFirebaseUtil getApp:appDisplayName];

        if (!existingApp) {
            FIROptions *firOptions = [[FIROptions alloc] initWithGoogleAppID:[options valueForKey:@"appId"] GCMSenderID:[options valueForKey:@"messagingSenderId"]];

            firOptions.APIKey = [options valueForKey:@"apiKey"];
            firOptions.projectID = [options valueForKey:@"projectId"];
            firOptions.clientID = [options valueForKey:@"clientId"];
            firOptions.trackingID = [options valueForKey:@"trackingId"];
            firOptions.databaseURL = [options valueForKey:@"databaseURL"];
            firOptions.storageBucket = [options valueForKey:@"storageBucket"];
            firOptions.androidClientID = [options valueForKey:@"androidClientId"];
            firOptions.deepLinkURLScheme = [options valueForKey:@"deepLinkURLScheme"];
            firOptions.bundleID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"];

            NSString *appName = [RNFirebaseUtil getAppName:appDisplayName];
            [FIRApp configureWithName:appName options:firOptions];
        }

        callback(@[[NSNull null], @{@"result": @"success"}]);
    });
}

/**
 * Delete a firebase app
 * @return
 */
RCT_EXPORT_METHOD(deleteApp:
    (NSString *) appDisplayName
            resolver:
            (RCTPromiseResolveBlock) resolve
            rejecter:
            (RCTPromiseRejectBlock) reject) {

    FIRApp *existingApp = [RNFirebaseUtil getApp:appDisplayName];

    if (!existingApp) {
        return resolve([NSNull null]);
    }

    [existingApp deleteApp:^(BOOL success) {
        if (success) {
            resolve([NSNull null]);
        } else {
            reject(@"app/delete-app-failed", @"Failed to delete the specified app.", nil);
        }
    }];

}

/**
 * React native constant exports - exports native firebase apps mainly
 * @return NSDictionary
 */
- (NSDictionary *)constantsToExport {
    NSMutableDictionary *constants = [NSMutableDictionary new];
    NSDictionary *firApps = [FIRApp allApps];
    NSMutableArray *appsArray = [NSMutableArray new];

    for (id key in firApps) {
        NSMutableDictionary *appOptions = [NSMutableDictionary new];
        FIRApp *firApp = firApps[key];
        FIROptions *firOptions = [firApp options];
        appOptions[@"name"] = [RNFirebaseUtil getAppDisplayName:firApp.name];
        appOptions[@"apiKey"] = firOptions.APIKey;
        appOptions[@"appId"] = firOptions.googleAppID;
        appOptions[@"databaseURL"] = firOptions.databaseURL;
        appOptions[@"messagingSenderId"] = firOptions.GCMSenderID;
        appOptions[@"projectId"] = firOptions.projectID;
        appOptions[@"storageBucket"] = firOptions.storageBucket;

        // missing from android sdk / ios only:
        appOptions[@"clientId"] = firOptions.clientID;
        appOptions[@"trackingId"] = firOptions.trackingID;
        appOptions[@"androidClientID"] = firOptions.androidClientID;
        appOptions[@"deepLinkUrlScheme"] = firOptions.deepLinkURLScheme;

        [appsArray addObject:appOptions];
    }

    constants[@"apps"] = appsArray;
    return constants;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
