#import "RNFirebaseLinks.h"
#import "Firebase.h"

#if __has_include(<FirebaseDynamicLinks/FIRDynamicLink.h>)
#import "RNFirebaseEvents.h"


static void sendDynamicLink(NSURL *url, id sender) {
    [[NSNotificationCenter defaultCenter] postNotificationName:LINKS_DYNAMIC_LINK_RECEIVED
                                                        object:sender
                                                      userInfo:@{@"url": url.absoluteString}];
    NSLog(@"sendDynamicLink Success: %@", url.absoluteString);
}

@implementation RNFirebaseLinks

RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseLinks instance");
        [self initialiseLinks];
    }
    return self;
}

- (void)initialiseLinks {
    // Set up internal listener to send notification over bridge
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(sendDynamicLinkEvent:)
                                                 name:LINKS_DYNAMIC_LINK_RECEIVED
                                               object:nil];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    return [self handleLinkFromCustomSchemeURL:url];
}

+ (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
    return [self handleLinkFromCustomSchemeURL:url];
}

+(BOOL)handleLinkFromCustomSchemeURL:(NSURL *)url {
    FIRDynamicLink *dynamicLink =
    [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
    if (dynamicLink) {
        sendDynamicLink(dynamicLink.url, self);
        return YES;
    }
    return NO;
}

+ (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler {
    BOOL handled = [[FIRDynamicLinks dynamicLinks]
                    handleUniversalLink:userActivity.webpageURL
                    completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
                        if (error != nil){
                            NSLog(@"Failed to handle universal link: %@", [error localizedDescription]);
                        }
                        else {
                            if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
                                NSURL* url = dynamicLink ? dynamicLink.url : userActivity.webpageURL;
                                sendDynamicLink(url, self);
                            }
                        }
                    }];
    return handled;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[LINKS_DYNAMIC_LINK_RECEIVED];
}

- (void)sendDynamicLinkEvent:(NSNotification *)notification {
    [self sendEventWithName:LINKS_DYNAMIC_LINK_RECEIVED body:notification.userInfo[@"url"]];
}

-(void)handleInitialLinkFromCustomSchemeURL:(NSURL*)url resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    FIRDynamicLink *dynamicLink =
    [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
    NSString* urlString = dynamicLink ? dynamicLink.url.absoluteString : (id)kCFNull;
    NSLog(@"initial link is: %@", urlString);
    resolve(urlString);
}

-(void)handleInitialLinkFromUniversalLinkURL:(NSDictionary *)userActivityDictionary resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject {
    NSUserActivity* userActivity = (NSUserActivity*) userActivityDictionary[@"UIApplicationLaunchOptionsUserActivityKey"];
    if ([userActivityDictionary[UIApplicationLaunchOptionsUserActivityTypeKey] isEqual:NSUserActivityTypeBrowsingWeb])
    {
        [[FIRDynamicLinks dynamicLinks]
         handleUniversalLink:userActivity.webpageURL
         completion:^(FIRDynamicLink * _Nullable dynamicLink, NSError * _Nullable error) {
             if (error != nil){
                 NSLog(@"Failed to handle universal link: %@", [error localizedDescription]);
                 reject(@"links/failure", @"Failed to handle universal link", error);
             }
             else {
                 NSString* urlString = dynamicLink ? dynamicLink.url.absoluteString : userActivity.webpageURL.absoluteString;
                 NSLog(@"initial link is: %@", urlString);
                 resolve(urlString);
             }
         }];
    }
    else {
        NSLog(@"no initial link");
        resolve((id)kCFNull);
    }
}

RCT_EXPORT_METHOD(getInitialLink:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey]) {
        NSURL* url = (NSURL*)self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey];
        [self handleInitialLinkFromCustomSchemeURL:url resolver:resolve rejecter:reject];
        
    } else {
        NSDictionary *userActivityDictionary =
        self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
        [self handleInitialLinkFromUniversalLinkURL:userActivityDictionary resolver:resolve rejecter:reject];
    }
}

RCT_EXPORT_METHOD(createDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];
    
    if (components == nil) {
        reject(@"links/failure", @"Failed to create Dynamic Link", nil);
    } else {
        NSURL *longLink =  components.url;
        NSLog(@"created long dynamic link: %@", longLink.absoluteString);
        resolve(longLink.absoluteString);
    }
}

RCT_EXPORT_METHOD(createShortDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];
    
    [components shortenWithCompletion:^(NSURL *_Nullable shortURL,
                                        NSArray *_Nullable warnings,
                                        NSError *_Nullable error) {
        if (error) {
            NSLog(@"create short dynamic link failure %@", [error localizedDescription]);
            reject(@"links/failure", @"Failed to create Short Dynamic Link", error);
        }
        NSURL *shortLink = shortURL;
        NSLog(@"created short dynamic link: %@", shortLink.absoluteString);
        resolve(shortLink.absoluteString);
    }];
}

- (FIRDynamicLinkComponents *)getDynamicLinkComponentsFromMetadata:(NSDictionary *)metadata {
    NSURL *link = [NSURL URLWithString:metadata[@"link"]];
    FIRDynamicLinkComponents *components =
    [FIRDynamicLinkComponents componentsWithLink:link domain:metadata[@"dynamicLinkDomain"]];
    [self setAndroidParameters:metadata components:components];
    [self setIosParameters:metadata components:components];
    [self setSocialMetaTagParameters:metadata components:components];
    [self setSuffixParameters:metadata components:components];
    return components;
}

- (void)setAndroidParameters:(NSDictionary *)metadata
                  components:(FIRDynamicLinkComponents *)components {
    NSDictionary *androidParametersDict = metadata[@"androidInfo"];
    if (androidParametersDict && androidParametersDict[@"packageName"]) {
        FIRDynamicLinkAndroidParameters *androidParams = [FIRDynamicLinkAndroidParameters
                                                          parametersWithPackageName: androidParametersDict[@"packageName"]];
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
    if (iosParametersDict && iosParametersDict[@"iosBundleId"]) {
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

@end

#else
@implementation RNFirebaseLinks
@end
#endif
