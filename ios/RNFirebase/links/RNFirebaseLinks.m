#import "RNFirebaseLinks.h"

#if __has_include(<FirebaseDynamicLinks/FirebaseDynamicLinks.h>)
#import <Firebase.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"

@implementation RNFirebaseLinks

static RNFirebaseLinks *theRNFirebaseLinks = nil;

+ (nonnull instancetype)instance {
    return theRNFirebaseLinks;
}

RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseLinks instance");
        // Set static instance for use from AppDelegate
        theRNFirebaseLinks = self;
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

// *******************************************************
// ** Start AppDelegate methods
// *******************************************************

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [self application:app
                     openURL:url
           sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
                  annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
    FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
    if (dynamicLink && dynamicLink.url) {
        NSURL* url = dynamicLink.url;
        [RNFirebaseUtil sendJSEvent:self name:LINKS_LINK_RECEIVED body:url];
        return YES;
    }
    return NO;
}

- (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler {
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        return [[FIRDynamicLinks dynamicLinks]
                handleUniversalLink:userActivity.webpageURL
                completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
                    if (error != nil){
                        NSLog(@"Failed to handle universal link: %@", [error localizedDescription]);
                    } else {
                        NSURL* url = dynamicLink ? dynamicLink.url : userActivity.webpageURL;
                        [RNFirebaseUtil sendJSEvent:self name:LINKS_LINK_RECEIVED body:url];
                    }
                }];
    }
    return NO;
}
// *******************************************************
// ** Finish AppDelegate methods
// *******************************************************

// ** Start React Module methods **
RCT_EXPORT_METHOD(createDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];

        if (components == nil) {
            reject(@"links/failure", @"Failed to create Dynamic Link", nil);
        } else {
            NSURL *longLink =  components.url;
            NSLog(@"created long dynamic link: %@", longLink.absoluteString);
            resolve(longLink.absoluteString);
        }
    }
    @catch(NSException * e) {
        NSLog(@"create dynamic link failure %@", e);
        reject(@"links/failure",[e reason], nil);
    }
}

RCT_EXPORT_METHOD(createShortDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];
        [self setSuffixParameters:metadata components:components];
        [components shortenWithCompletion:^(NSURL *_Nullable shortURL,
                                            NSArray *_Nullable warnings,
                                            NSError *_Nullable error) {
            if (error) {
                NSLog(@"create short dynamic link failure %@", [error localizedDescription]);
                reject(@"links/failure", @"Failed to create Short Dynamic Link", error);
            }
            else {
                NSURL *shortLink = shortURL;
                NSLog(@"created short dynamic link: %@", shortLink.absoluteString);
                resolve(shortLink.absoluteString);
            }
        }];
    }
    @catch(NSException * e) {
        NSLog(@"create short dynamic link failure %@", e);
        reject(@"links/failure",[e reason], nil);
    }
}

RCT_EXPORT_METHOD(getInitialLink:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey]) {
        NSURL* url = (NSURL*)self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey];
        FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
        resolve(dynamicLink ? dynamicLink.url.absoluteString : nil);
    } else if (self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey]
               && [self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey][UIApplicationLaunchOptionsUserActivityTypeKey] isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        NSDictionary *dictionary = self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
        NSUserActivity* userActivity = (NSUserActivity*) dictionary[@"UIApplicationLaunchOptionsUserActivityKey"];
        [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL
                                                 completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
                                                     if (error != nil){
                                                         NSLog(@"Failed to handle universal link: %@", [error localizedDescription]);
                                                         reject(@"links/failure", @"Failed to handle universal link", error);
                                                     } else {
                                                         NSString* urlString = dynamicLink ? dynamicLink.url.absoluteString : userActivity.webpageURL.absoluteString;
                                                         NSLog(@"initial link is: %@", urlString);
                                                         resolve(urlString);
                                                     }
                                                 }];
    } else {
        resolve(nil);
    }
}

// ** Start internals **
- (FIRDynamicLinkComponents *)getDynamicLinkComponentsFromMetadata:(NSDictionary *)metadata {
    @try {
        NSURL *link = [NSURL URLWithString:metadata[@"link"]];
        FIRDynamicLinkComponents *components =
        [FIRDynamicLinkComponents componentsWithLink:link domain:metadata[@"dynamicLinkDomain"]];

        [self setAndroidParameters:metadata components:components];
        [self setIosParameters:metadata components:components];
        [self setSocialMetaTagParameters:metadata components:components];

        return components;
    }
    @catch(NSException * e) {
        NSLog(@"error while building componets from meta data %@", e);
        @throw;
    }
}

- (void)setAndroidParameters:(NSDictionary *)metadata
                  components:(FIRDynamicLinkComponents *)components {
    NSDictionary *androidParametersDict = metadata[@"androidInfo"];
    if (androidParametersDict) {
        FIRDynamicLinkAndroidParameters *androidParams = [FIRDynamicLinkAndroidParameters
                                                          parametersWithPackageName: androidParametersDict[@"androidPackageName"]];

        if (androidParametersDict[@"androidFallbackLink"]) {
            androidParams.fallbackURL = [NSURL URLWithString:androidParametersDict[@"androidFallbackLink"]];
        }
        if (androidParametersDict[@"androidMinPackageVersionCode"]) {
            androidParams.minimumVersion = [androidParametersDict[@"androidMinPackageVersionCode"] integerValue];
        }
        components.androidParameters = androidParams;
    }
}

- (void)setIosParameters:(NSDictionary *)metadata
              components:(FIRDynamicLinkComponents *)components {
    NSDictionary *iosParametersDict = metadata[@"iosInfo"];
    if (iosParametersDict) {
        FIRDynamicLinkIOSParameters *iOSParams = [FIRDynamicLinkIOSParameters
                                                  parametersWithBundleID:iosParametersDict[@"iosBundleId"]];
        if (iosParametersDict[@"iosAppStoreId"]) {
            iOSParams.appStoreID = iosParametersDict[@"iosAppStoreId"];
        }
        if (iosParametersDict[@"iosCustomScheme"]) {
            iOSParams.customScheme = iosParametersDict[@"iosCustomScheme"];
        }
        if (iosParametersDict[@"iosFallbackLink"]) {
            iOSParams.fallbackURL = [NSURL URLWithString:iosParametersDict[@"iosFallbackLink"]];
        }
        if (iosParametersDict[@"iosIpadBundleId"]) {
            iOSParams.iPadBundleID = iosParametersDict[@"iosIpadBundleId"];
        }
        if (iosParametersDict[@"iosIpadFallbackLink"]) {
            iOSParams.iPadFallbackURL = [NSURL URLWithString:iosParametersDict[@"iosIpadFallbackLink"]];
        }
        if (iosParametersDict[@"iosMinPackageVersionCode"]) {
            iOSParams.minimumAppVersion = iosParametersDict[@"iosMinPackageVersionCode"];
        }
        components.iOSParameters = iOSParams;
    }
}

- (void)setSocialMetaTagParameters:(NSDictionary *)metadata
                        components:(FIRDynamicLinkComponents *)components {
    NSDictionary *socialParamsDict = metadata[@"socialMetaTagInfo"];
    if (socialParamsDict) {
        FIRDynamicLinkSocialMetaTagParameters *socialParams = [FIRDynamicLinkSocialMetaTagParameters parameters];
        if (socialParamsDict[@"socialTitle"]) {
            socialParams.title = socialParamsDict[@"socialTitle"];
        }
        if (socialParamsDict[@"socialDescription"]) {
            socialParams.descriptionText = socialParamsDict[@"socialDescription"];
        }
        if (socialParamsDict[@"socialImageLink"]) {
            socialParams.imageURL = [NSURL URLWithString:socialParamsDict[@"socialImageLink"]];
        }
        components.socialMetaTagParameters = socialParams;
    }
}

- (void)setSuffixParameters:(NSDictionary *)metadata
                 components:(FIRDynamicLinkComponents *)components {
    NSDictionary *suffixParametersDict = metadata[@"suffix"];
    if (suffixParametersDict) {
        FIRDynamicLinkComponentsOptions *options = [FIRDynamicLinkComponentsOptions options];
        if ([suffixParametersDict[@"option"]  isEqual: @"SHORT"]) {
            options.pathLength = FIRShortDynamicLinkPathLengthShort;
        }
        else if ([suffixParametersDict[@"option"]  isEqual: @"UNGUESSABLE"]) {
            options.pathLength = FIRShortDynamicLinkPathLengthUnguessable;
        }
        components.options = options;
    }
}

- (NSArray<NSString *> *)supportedEvents {
    return @[LINKS_LINK_RECEIVED];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end

#else
@implementation RNFirebaseLinks
@end
#endif
