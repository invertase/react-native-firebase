#import "RNFirebase.h"
#import "RNFirebaseErrors.h"
#import "RNFirebaseEvents.h"

static RNFirebase *_sharedInstance = nil;
static dispatch_once_t onceToken;

@implementation RNFirebase

typedef void (^UserWithTokenResponse)(NSDictionary *, NSError *);

- (void)dealloc
{
    NSLog(@"Dealloc called on RNFirebase: %@", self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

// TODO: Implement
+ (void) setup:(UIApplication *) application
withLaunchOptions: (NSDictionary *) launchOptions
{
    NSLog(@"Called setup for RNFirebase");

    dispatch_once(&onceToken, ^{
        [application registerForRemoteNotifications];

        [[NSNotificationCenter defaultCenter]
         postNotificationName:kRNFirebaseInitialized
         object:nil];
    });
}

- (id) init
{
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebase instance");
        [RNFirebase initializeRNFirebase:self];
    }
    return self;
}

+ (void) initializeRNFirebase:(RNFirebase *) instance
{
    dispatch_once(&onceToken, ^{
        _sharedInstance = instance;

        [[NSNotificationCenter defaultCenter]
         postNotificationName:kRNFirebaseInitialized
         object:nil];
    });
}


+ (instancetype) sharedInstance
{
    return _sharedInstance;
}

- (FIRApp *) firebaseApp
{
    return [FIRApp defaultApp];
}


RCT_EXPORT_MODULE(RNFirebase);

RCT_EXPORT_METHOD(serverValue:(RCTResponseSenderBlock) callback)
{
    callback(@[[NSNull null], @{
        @"TIMESTAMP": [FIRServerValue timestamp]
    }]);
}

RCT_EXPORT_METHOD(configureWithOptions:(NSDictionary *) opts
                  callback:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(),^{
        // Are we debugging, yo?
        self.debug = [opts valueForKey:@"debug"] != nil ? YES : NO;
        NSLog(@"options passed into configureWithOptions: %@", [opts valueForKey:@"debug"]);

        NSDictionary *keyMapping = @{
                                     @"GOOGLE_APP_ID": @[
                                             @"appId",
                                             @"googleAppId",
                                             @"applicationId"
                                             ],
                                     @"BUNDLE_ID": @[
                                             @"bundleId",
                                             @"bundleID"
                                             ],
                                     @"GCM_SENDER_ID": @[
                                             @"gcmSenderID",
                                             @"GCMSenderID"
                                             ],
                                     @"API_KEY": @[
                                             @"apiKey"
                                             ],
                                     @"CLIENT_ID": @[
                                             @"clientId",
                                             @"clientID"
                                             ],
                                     @"TRACKING_ID": @[
                                             @"trackingID",
                                             @"trackingId"
                                             ],
                                     @"ANDROID_CLIENT_ID": @[
                                             @"applicationId",
                                             @"clientId",
                                             @"clientID",
                                             @"androidClientID",
                                             @"androidClientId"
                                             ],
                                     @"DATABASE_URL": @[
                                             @"databaseUrl",
                                             @"databaseURL"
                                             ],
                                     @"STORAGE_BUCKET": @[
                                             @"storageBucket"
                                             ],
                                     @"PROJECT_ID": @[
                                             @"projectId",
                                             @"projectID"
                                             ],
                                     @"TRACKING_ID": @[
                                             @"trackingID",
                                             @"trackingId"
                                             ],
                                     @"DEEP_LINK_SCHEME": @[
                                             @"deepLinkScheme"
                                             ],
                                     @"MESSAGING_SENDER_ID": @[
                                             @"messagingSenderId",
                                             @"messagingSenderID"
                                             ]
                                     };
        NSArray *optionKeys = [keyMapping allKeys];

        NSMutableDictionary *props;

        NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"GoogleService-Info" ofType:@"plist"];

        if ([[NSFileManager defaultManager] fileExistsAtPath:plistPath]) {
            // If the Firebase plist is included
            props = [NSMutableDictionary dictionaryWithContentsOfFile:plistPath];
        } else {
            props = [[NSMutableDictionary alloc] initWithCapacity:[optionKeys count]];
        }

        // Bundle ID either from options OR from the main bundle
        NSString *bundleID;
        if ([opts valueForKey:@"bundleID"]) {
            bundleID = [opts valueForKey:@"bundleID"];
        } else {
            bundleID = [[NSBundle mainBundle] bundleIdentifier];
        }
        [props setValue:bundleID forKey:@"BUNDLE_ID"];

        // Prefer the user configuration options over the default options
        for (int i=0; i < [optionKeys count]; i++) {
            // Traditional for loop here
            @try {
                NSString *key = [optionKeys objectAtIndex:i];
                // If the name is capitalized
                if ([opts valueForKey:key] != nil) {
                    NSString *value = [opts valueForKey:key];
                    [props setValue:value forKey:key];
                }

                NSArray *possibleNames = [keyMapping objectForKey:key];

                for (NSString *name in possibleNames) {
                    if ([opts valueForKey:name] != nil) {
                        // The user passed this option in
                        NSString *value = [opts valueForKey:name];
                        [props setValue:value forKey:key];
                    }
                }
            }
            @catch (NSException *err) {
                // Uh oh?
                NSLog(@"An error occurred: %@", err);
            }
        }

        @try {
            if (self.debug) {
                NSLog(@"props ->: %@", props);
                NSLog(@"GOOGLE_APP_ID: %@", [props valueForKey:@"GOOGLE_APP_ID"]);
                NSLog(@"BUNDLE_ID: %@", [props valueForKey:@"BUNDLE_ID"]);
                NSLog(@"GCM_SENDER_ID: %@", [props valueForKey:@"GCM_SENDER_ID"]);
                NSLog(@"API_KEY: %@", [props valueForKey:@"API_KEY"]);
                NSLog(@"CLIENT_ID: %@", [props valueForKey:@"CLIENT_ID"]);
                NSLog(@"TRACKING_ID: %@", [props valueForKey:@"TRACKING_ID"]);
                NSLog(@"ANDROID_CLIENT_ID: %@", [props valueForKey:@"ANDROID_CLIENT_ID"]);
                NSLog(@"DATABASE_URL: %@", [props valueForKey:@"DATABASE_URL"]);
                NSLog(@"STORAGE_BUCKET: %@", [props valueForKey:@"STORAGE_BUCKET"]);
                NSLog(@"DEEP_LINK_SCHEME: %@", [props valueForKey:@"DEEP_LINK_SCHEME"]);
            }

            FIROptions *finalOptions = [[FIROptions alloc]
                                        initWithGoogleAppID:[props valueForKey:@"GOOGLE_APP_ID"]
                                        bundleID:[props valueForKey:@"BUNDLE_ID"]
                                        GCMSenderID:[props valueForKey:@"GCM_SENDER_ID"]
                                        APIKey:[props valueForKey:@"API_KEY"]
                                        clientID:[props valueForKey:@"CLIENT_ID"]
                                        trackingID:[props valueForKey:@"TRACKING_ID"]
                                        androidClientID:[props valueForKey:@"ANDROID_CLIENT_ID"]
                                        databaseURL:[props valueForKey:@"DATABASE_URL"]
                                        storageBucket:[props valueForKey:@"STORAGE_BUCKET"]
                                        deepLinkURLScheme:[props valueForKey:@"DEEP_LINK_SCHEME"]];

            // Save configuration option
            //        NSDictionary *cfg = [self getConfig];
            //        [cfg setValuesForKeysWithDictionary:props];

            // if (!self.configured) {

            if ([FIRApp defaultApp] == NULL) {
                [FIRApp configureWithOptions:finalOptions];
            }
            [RNFirebase initializeRNFirebase:self];
            callback(@[[NSNull null], props]);
        }
        @catch (NSException *exception) {
            NSLog(@"Exception occurred while configuring: %@", exception);
            [self debugLog:@"Configuring error"
                       msg:[NSString stringWithFormat:@"An error occurred while configuring: %@", [exception debugDescription]]];
            NSDictionary *errProps = @{
                                       @"error": [exception name],
                                       @"description": [exception debugDescription]
                                       };
            callback(@[errProps]);
        }
    });
}

RCT_EXPORT_METHOD(configure:(RCTResponseSenderBlock)callback)
{
    NSDictionary *props = @{};
    [self configureWithOptions:props
                      callback:callback];
}

#pragma mark - Storage


#pragma mark RemoteConfig

// RCT_EXPORT_METHOD(setDefaultRemoteConfig:(NSDictionary *)props
//                   callback:(RCTResponseSenderBlock) callback)
// {
//     if (!self.remoteConfigInstance) {
//         // Create remote Config instance
//         self.remoteConfigInstance = [FIRRemoteConfig remoteConfig];
//     }

//     [self.remoteConfigInstance setDefaults:props];
//     callback(@[[NSNull null], props]);
// }

// RCT_EXPORT_METHOD(setDev:(RCTResponseSenderBlock) callback)
// {
//     FIRRemoteConfigSettings *remoteConfigSettings = [[FIRRemoteConfigSettings alloc] initWithDeveloperModeEnabled:YES];
//     self.remoteConfigInstance.configSettings = remoteConfigSettings;
//     callback(@[[NSNull null], @"ok"]);
// }

// RCT_EXPORT_METHOD(configValueForKey:(NSString *)name
//                   callback:(RCTResponseSenderBlock) callback)
// {
//     if (!self.remoteConfigInstance) {
//         NSDictionary *err = @{
//                               @"error": @"No configuration instance",
//                               @"msg": @"No configuration instance set. Please call setDefaultRemoteConfig before using this feature"
//                               };
//         callback(@[err]);
//     }


//     FIRRemoteConfigValue *value = [self.remoteConfigInstance configValueForKey:name];
//     NSString *valueStr = value.stringValue;

//     if (valueStr == nil) {
//         valueStr = @"";
//     }
//     callback(@[[NSNull null], valueStr]);
// }

// RCT_EXPORT_METHOD(fetchWithExpiration:(NSNumber*)expirationSeconds
//                   callback:(RCTResponseSenderBlock) callback)
// {
//     if (!self.remoteConfigInstance) {
//         NSDictionary *err = @{
//                               @"error": @"No configuration instance",
//                               @"msg": @"No configuration instance set. Please call setDefaultRemoteConfig before using this feature"
//                               };
//         callback(@[err]);
//     }

//     NSTimeInterval expirationDuration = [expirationSeconds doubleValue];

//     [self.remoteConfigInstance fetchWithExpirationDuration:expirationDuration completionHandler:^(FIRRemoteConfigFetchStatus status, NSError *error) {
//         if (status == FIRRemoteConfigFetchStatusSuccess) {
//             NSLog(@"Config fetched!");
//             [self.remoteConfigInstance activateFetched];
//             callback(@[[NSNull null], @(YES)]);
//         } else {
//             NSLog(@"Error %@", error.localizedDescription);

//             NSDictionary *err = @{
//                                   @"error": @"No configuration instance",
//                                   @"msg": [error localizedDescription]
//                                   };

//             callback(@[err]);
//         }
//     }];
// }

#pragma mark Database

#pragma mark Messaging

#pragma mark Helpers

- (NSDictionary *) getConfig
{
    if (self.configuration == nil) {
        self.configuration = [[NSMutableDictionary alloc] initWithCapacity:20];
    }
    return self.configuration;
}

- (NSDictionary *) handleFirebaseError:(NSString *) name
                                 error:(NSError *) error
                              withUser:(FIRUser *) user
{
    return [RNFirebaseErrors handleFirebaseError:name
                                          error:error
                                       withUser:user];
}

- (void) handleException:(NSException *)exception
            withCallback:(RCTResponseSenderBlock)callback
{
    [RNFirebaseErrors handleException:exception
                        withCallback:callback];
}

- (void) debugLog:(NSString *)title
              msg:(NSString *)msg
{
    if (self.debug) {
        NSLog(@"%@: %@", title, msg);
    }
}

// Not sure how to get away from this... yet
- (NSArray<NSString *> *)supportedEvents {
    return @[
        INITIALIZED_EVENT,
        DEBUG_EVENT,
        AUTH_CHANGED_EVENT];
}

- (void) sendJSEvent:(NSString *)title
               props:(NSDictionary *)props
{
    @try {
        [self sendEventWithName:title
                           body:props];
    }
    @catch (NSException *err) {
        NSLog(@"An error occurred in sendJSEvent: %@", [err debugDescription]);
    }
}

@end
