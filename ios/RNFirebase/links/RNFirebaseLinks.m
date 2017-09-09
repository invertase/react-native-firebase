#import "RNFirebaseLinks.h"
#import "Firebase.h"

#if __has_include(<FirebaseDynamicLinks/FIRDynamicLink.h>)
@implementation RNFirebaseLinks

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createDynamicLink: (NSDictionary *) metadata resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    FIRDynamicLinkComponents *components = [self getDynamicLinkComponentsFromMetadata:metadata];

    if (components == nil) {
        reject(@"links/failure", @"error", nil);
    } else {
        NSURL *longLink =  components.url;
        NSLog(@"Long URL: %@", longLink.absoluteString);
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
        NSLog(@"Short URL: %@", shortLink.absoluteString);
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
    [self setAnalyticsParameters:metadata components:components];
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

- (void)setAnalyticsParameters:(NSDictionary *)metadata
                    components:(FIRDynamicLinkComponents *)components {
    NSDictionary *analyticsParametersDict = metadata[@"analyticsInfo"];
    if (analyticsParametersDict) {
        [self setGoogleAnalyticsParameters:metadata components:components];
        [self setItunesConnectAnalyticsParameters:metadata components:components];
    }
}

- (void)setGoogleAnalyticsParameters:(NSDictionary *)metadata
                          components:(FIRDynamicLinkComponents *)components {
    NSDictionary *analyticsParametersDict = metadata[@"googlePlayAnalytics"];
    if (analyticsParametersDict) {
        FIRDynamicLinkGoogleAnalyticsParameters *analyticsParams = [FIRDynamicLinkGoogleAnalyticsParameters parameters];
        if (analyticsParametersDict[@"utmSource"]) {
            analyticsParams.source = analyticsParametersDict[@"utmSource"];
        }
        if (analyticsParametersDict[@"utmMedium"]) {
            analyticsParams.medium = analyticsParametersDict[@"utmMedium"];
        }
        if (analyticsParametersDict[@"utmCampaign"]) {
            analyticsParams.campaign = analyticsParametersDict[@"utmCampaign"];
        }
        if (analyticsParametersDict[@"utmTerm"]) {
            analyticsParams.term = analyticsParametersDict[@"utmTerm"];
        }
        if (analyticsParametersDict[@"utmContent"]) {
            analyticsParams.content = analyticsParametersDict[@"utmContent"];
        }
        components.analyticsParameters = analyticsParams;
    }
}

- (void)setItunesConnectAnalyticsParameters:(NSDictionary *)metadata
                                 components:(FIRDynamicLinkComponents *)components {
    NSDictionary *appStoreParametersDict = metadata[@"itunesConnectAnalytics"];
    if (appStoreParametersDict) {
        FIRDynamicLinkItunesConnectAnalyticsParameters *appStoreParams = [FIRDynamicLinkItunesConnectAnalyticsParameters parameters];
        if (appStoreParametersDict[@"at"]) {
            appStoreParams.affiliateToken = appStoreParametersDict[@"at"];
        }
        if (appStoreParametersDict[@"ct"]) {
            appStoreParams.campaignToken = appStoreParametersDict[@"ct"];
        }
        if (appStoreParametersDict[@"pt"]) {
            appStoreParams.providerToken = appStoreParametersDict[@"pt"];
        }
        components.iTunesConnectParameters = appStoreParams;
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
