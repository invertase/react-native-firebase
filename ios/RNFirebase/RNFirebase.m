#import "RNFirebase.h"
#import "FirebaseCore/FirebaseCore.h"

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
    (NSString *) name
            options:
            (NSDictionary *) options
            callback:
            (RCTResponseSenderBlock) callback) {

    dispatch_sync(dispatch_get_main_queue(), ^{
        FIRApp *existingApp = [FIRApp appNamed:name];

        if (!existingApp) {
            FIROptions *firOptions = [
                [FIROptions alloc]
                initWithGoogleAppID:[options valueForKey:@"iosAppId"]
                GCMSenderID:[options valueForKey:@"messagingSenderId"]
            ];

            firOptions.APIKey = [options valueForKey:@"apiKey"];
            firOptions.projectID = [options valueForKey:@"projectId"];
            firOptions.clientID = [options valueForKey:@"iosClientId"];
            firOptions.trackingID = [options valueForKey:@"trackingId"];
            firOptions.databaseURL = [options valueForKey:@"databaseURL"];
            firOptions.storageBucket = [options valueForKey:@"storageBucket"];
            firOptions.androidClientID = [options valueForKey:@"androidClientId"];
            firOptions.deepLinkURLScheme = [options valueForKey:@"deepLinkURLScheme"];
            firOptions.bundleID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"];

            [FIRApp configureWithName:name options:firOptions];
        }

        // todo expand on callback result
        callback(@[[NSNull null], @{@"result": @"success"}]);
    });
}

@end
