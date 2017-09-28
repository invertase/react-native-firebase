#import "RNFirebaseLinks.h"
#import "Firebase.h"

#if __has_include(<FirebaseDynamicLinks/FIRDynamicLink.h>)
#import "RNFirebaseEvents.h"


static void sendDynamicLink(NSURL *url, id sender) {
    [[NSNotificationCenter defaultCenter] postNotificationName:LINKS_DYNAMIC_LINK_RECEIVED
                                                        object:sender
                                                      userInfo:@{@"url": url.absoluteString}];
    NSLog(@"sendDynamicLinkSuccess: %@", url.absoluteString);
}

@implementation RNFirebaseLinks

RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        NSLog(@"Setting up RNFirebaseLinks instance");
        [self initializeLinks];
    }
    return self;
}

- (void)initializeLinks {
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
    sendDynamicLink(url, self);
    return YES;
}

+ (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation
{
    sendDynamicLink(url, self);
    return YES;
}

+ (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler
{
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        sendDynamicLink(userActivity.webpageURL, self);
    }
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[LINKS_DYNAMIC_LINK_RECEIVED];
}

- (void)sendDynamicLinkEvent:(NSNotification *)notification {
    [self sendEventWithName:LINKS_DYNAMIC_LINK_RECEIVED body:notification.userInfo[@"url"]];
}

RCT_EXPORT_METHOD(getInitialLink:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSURL *initialLink = nil;
    if (self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey]) {
        initialLink = self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey];
    } else {
        NSDictionary *userActivityDictionary =
        self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
        if ([userActivityDictionary[UIApplicationLaunchOptionsUserActivityTypeKey] isEqual:NSUserActivityTypeBrowsingWeb]) {
            initialLink = ((NSUserActivity*) userActivityDictionary[@"UIApplicationLaunchOptionsUserActivityKey"]).webpageURL;
        }
    }
    NSString* initialLinkString = initialLink ? initialLink.absoluteString : (id)kCFNull;
    NSLog(@"getInitialLink: link is: %@", initialLinkString);
    resolve(initialLinkString);
}

RCT_EXPORT_METHOD(createDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];

    if (components == nil) {
        reject(@"links/failure", @"error", nil);
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
            NSLog(@"create short dynamic link failure %@", error.description);
            reject(@"links/failure", error.description, nil);
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
