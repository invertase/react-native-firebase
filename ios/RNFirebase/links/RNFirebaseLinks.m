#import "RNFirebaseLinks.h"

#if __has_include(<FirebaseDynamicLinks/FirebaseDynamicLinks.h>)
#import <Firebase.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"

@implementation RNFirebaseLinks

static RNFirebaseLinks *theRNFirebaseLinks = nil;
static NSString *initialLink = nil;
static bool jsReady = FALSE;

+ (nonnull instancetype)instance {
    // If an event comes in before the bridge has initialised the native module
    // then we create a temporary instance which handles events until the bridge
    // and JS side are ready
    if (theRNFirebaseLinks == nil) {
        theRNFirebaseLinks = [[RNFirebaseLinks alloc] init];
    }
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
    FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];
    if (dynamicLink && dynamicLink.url) {
        NSURL* url = dynamicLink.url;
        [self sendJSEvent:self name:LINKS_LINK_RECEIVED body:url.absoluteString];
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
                    if (dynamicLink && dynamicLink.url && error == nil) {
                        NSURL* url = dynamicLink.url;
                        [self sendJSEvent:self name:LINKS_LINK_RECEIVED body:url.absoluteString];
                    } else {
                        NSLog(@"Failed to handle universal link: %@", userActivity.webpageURL);
                    }
                }];
    }
    return NO;
}
// *******************************************************
// ** Finish AppDelegate methods
// *******************************************************

- (void)sendLink:(NSString *)link {
    [self sendJSEvent:self name:LINKS_LINK_RECEIVED body:link];
}

// ** Start React Module methods **
RCT_EXPORT_METHOD(createDynamicLink:(NSDictionary *)linkData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        FIRDynamicLinkComponents *dynamicLink = [self buildDynamicLink:linkData];
        
        if (dynamicLink == nil) {
            reject(@"links/failure", @"Failed to create Dynamic Link", nil);
        } else {
            NSString *longLink = dynamicLink.url.absoluteString;
            NSLog(@"created long dynamic link: %@", longLink);
            resolve(longLink);
        }
    }
    @catch(NSException * e) {
        NSLog(@"create dynamic link failure %@", e);
        reject(@"links/failure",[e reason], nil);
    }
}

RCT_EXPORT_METHOD(createShortDynamicLink:(NSDictionary *)linkData
                  type:(NSString *)type
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @try {
        FIRDynamicLinkComponents *components = [self buildDynamicLink:linkData];
        if (type) {
            FIRDynamicLinkComponentsOptions *options = [FIRDynamicLinkComponentsOptions options];
            if ([type isEqual: @"SHORT"]) {
                options.pathLength = FIRShortDynamicLinkPathLengthShort;
            } else if ([type isEqual: @"UNGUESSABLE"]) {
                options.pathLength = FIRShortDynamicLinkPathLengthUnguessable;
            }
            components.options = options;
        }
        [components shortenWithCompletion:^(NSURL *_Nullable shortURL, NSArray *_Nullable warnings, NSError *_Nullable error) {
            if (error) {
                NSLog(@"create short dynamic link failure %@", [error localizedDescription]);
                reject(@"links/failure", @"Failed to create Short Dynamic Link", error);
            } else {
                NSString *shortLink = shortURL.absoluteString;
                NSLog(@"created short dynamic link: %@", shortLink);
                resolve(shortLink);
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
        resolve(dynamicLink ? dynamicLink.url.absoluteString : initialLink);
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
        resolve(initialLink);
    }
}

RCT_EXPORT_METHOD(jsInitialised:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    jsReady = TRUE;
    resolve(nil);
}

// ** Start internals **

// Because of the time delay between the app starting and the bridge being initialised
// we catch any events that are received before the JS is ready to receive them
- (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(id)body {
    if (emitter.bridge && jsReady) {
        [RNFirebaseUtil sendJSEvent:emitter name:name body:body];
    } else if (!initialLink) {
        initialLink = body;
    } else {
        NSLog(@"Multiple link events received before the JS links module has been initialised");
    }
}

- (FIRDynamicLinkComponents *)buildDynamicLink:(NSDictionary *)linkData {
    @try {
        NSURL *link = [NSURL URLWithString:linkData[@"link"]];
        FIRDynamicLinkComponents *components = [FIRDynamicLinkComponents componentsWithLink:link domain:linkData[@"dynamicLinkDomain"]];
        
        [self setAnalyticsParameters:linkData[@"analytics"] components:components];
        [self setAndroidParameters:linkData[@"android"] components:components];
        [self setIosParameters:linkData[@"ios"] components:components];
        [self setITunesParameters:linkData[@"itunes"] components:components];
        [self setNavigationParameters:linkData[@"navigation"] components:components];
        [self setSocialParameters:linkData[@"social"] components:components];
        
        return components;
    }
    @catch(NSException * e) {
        NSLog(@"error while building componets from meta data %@", e);
        @throw;
    }
}

- (void)setAnalyticsParameters:(NSDictionary *)analyticsData
                    components:(FIRDynamicLinkComponents *)components {
    FIRDynamicLinkGoogleAnalyticsParameters *analyticsParams = [FIRDynamicLinkGoogleAnalyticsParameters parameters];
    
    if (analyticsData[@"campaign"]) {
        analyticsParams.campaign = analyticsData[@"campaign"];
    }
    if (analyticsData[@"content"]) {
        analyticsParams.content = analyticsData[@"content"];
    }
    if (analyticsData[@"medium"]) {
        analyticsParams.medium = analyticsData[@"medium"];
    }
    if (analyticsData[@"source"]) {
        analyticsParams.source = analyticsData[@"source"];
    }
    if (analyticsData[@"term"]) {
        analyticsParams.term = analyticsData[@"term"];
    }
    components.analyticsParameters = analyticsParams;
}

- (void)setAndroidParameters:(NSDictionary *)androidData
                  components:(FIRDynamicLinkComponents *)components {
    if (androidData[@"packageName"]) {
        FIRDynamicLinkAndroidParameters *androidParams = [FIRDynamicLinkAndroidParameters parametersWithPackageName: androidData[@"packageName"]];
        
        if (androidData[@"fallbackUrl"]) {
            androidParams.fallbackURL = [NSURL URLWithString:androidData[@"fallbackUrl"]];
        }
        if (androidData[@"minimumVersion"]) {
            androidParams.minimumVersion = [androidData[@"minimumVersion"] integerValue];
        }
        components.androidParameters = androidParams;
    }
}

- (void)setIosParameters:(NSDictionary *)iosData
              components:(FIRDynamicLinkComponents *)components {
    if (iosData[@"bundleId"]) {
        FIRDynamicLinkIOSParameters *iOSParams = [FIRDynamicLinkIOSParameters parametersWithBundleID:iosData[@"bundleId"]];
        if (iosData[@"appStoreId"]) {
            iOSParams.appStoreID = iosData[@"appStoreId"];
        }
        if (iosData[@"customScheme"]) {
            iOSParams.customScheme = iosData[@"customScheme"];
        }
        if (iosData[@"fallbackUrl"]) {
            iOSParams.fallbackURL = [NSURL URLWithString:iosData[@"fallbackUrl"]];
        }
        if (iosData[@"iPadBundleId"]) {
            iOSParams.iPadBundleID = iosData[@"iPadBundleId"];
        }
        if (iosData[@"iPadFallbackUrl"]) {
            iOSParams.iPadFallbackURL = [NSURL URLWithString:iosData[@"iPadFallbackUrl"]];
        }
        if (iosData[@"minimumVersion"]) {
            iOSParams.minimumAppVersion = iosData[@"minimumVersion"];
        }
        components.iOSParameters = iOSParams;
    }
}

- (void)setITunesParameters:(NSDictionary *)itunesData
                 components:(FIRDynamicLinkComponents *)components {
    FIRDynamicLinkItunesConnectAnalyticsParameters *itunesParams = [FIRDynamicLinkItunesConnectAnalyticsParameters parameters];
    if (itunesData[@"affiliateToken"]) {
        itunesParams.affiliateToken = itunesData[@"affiliateToken"];
    }
    if (itunesData[@"campaignToken"]) {
        itunesParams.campaignToken = itunesData[@"campaignToken"];
    }
    if (itunesData[@"providerToken"]) {
        itunesParams.providerToken = itunesData[@"providerToken"];
    }
    components.iTunesConnectParameters = itunesParams;
}

- (void)setNavigationParameters:(NSDictionary *)navigationData
                     components:(FIRDynamicLinkComponents *)components {
    FIRDynamicLinkNavigationInfoParameters *navigationParams = [FIRDynamicLinkNavigationInfoParameters parameters];
    if (navigationData[@"forcedRedirectEnabled"]) {
        navigationParams.forcedRedirectEnabled = navigationData[@"forcedRedirectEnabled"];
    }
    components.navigationInfoParameters = navigationParams;
}

- (void)setSocialParameters:(NSDictionary *)socialData
                 components:(FIRDynamicLinkComponents *)components {
    FIRDynamicLinkSocialMetaTagParameters *socialParams = [FIRDynamicLinkSocialMetaTagParameters parameters];
    if (socialData[@"descriptionText"]) {
        socialParams.descriptionText = socialData[@"descriptionText"];
    }
    if (socialData[@"imageUrl"]) {
        socialParams.imageURL = [NSURL URLWithString:socialData[@"imageUrl"]];
    }
    if (socialData[@"title"]) {
        socialParams.title = socialData[@"title"];
    }
    components.socialMetaTagParameters = socialParams;
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
