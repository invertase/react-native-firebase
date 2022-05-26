/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import "RNFBDynamicLinksModule.h"
#import "RNFBDynamicLinksAppDelegateInterceptor.h"

@implementation RNFBDynamicLinksModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

#pragma mark -
#pragma mark Firebase Links Methods

// required to init app delegate interceptor as early as possible
+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    // access shared instance to initialize app delegate interceptor
    [RNFBDynamicLinksAppDelegateInterceptor sharedInstance];
  });
  return self;
}

RCT_EXPORT_METHOD(buildLink
                  : (NSDictionary *)dynamicLinkDict
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRDynamicLinkComponents *linkComponents;

  @try {
    linkComponents = [self createDynamicLinkComponents:dynamicLinkDict];
  } @catch (NSException *exception) {
    DLog(@"Building dynamic link failed %@", exception);
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"build-failed",
                                        @"message" : [exception description],
                                      }];
    return;
  }

  if (!linkComponents || !linkComponents.url) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:(NSMutableDictionary *)@{
                           @"code" : @"build-failed",
                           @"message" : @"Failed to build dynamic link for unknown reason",
                         }];
    return;
  }

  resolve(linkComponents.url.absoluteString);
}

RCT_EXPORT_METHOD(buildShortLink
                  : (NSDictionary *)dynamicLinkDict
                  : (NSString *)shortLinkType
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRDynamicLinkComponents *linkComponents;

  @try {
    linkComponents = [self createDynamicLinkComponents:dynamicLinkDict];
  } @catch (NSException *exception) {
    DLog(@"Building short dynamic link failed %@", exception);
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"build-failed",
                                        @"message" : [exception description],
                                      }];
    return;
  }

  FIRDynamicLinkComponentsOptions *componentsOptions = [FIRDynamicLinkComponentsOptions options];

  if ([shortLinkType isEqual:@"SHORT"]) {
    componentsOptions.pathLength = FIRShortDynamicLinkPathLengthShort;
  } else if ([shortLinkType isEqual:@"UNGUESSABLE"]) {
    componentsOptions.pathLength = FIRShortDynamicLinkPathLengthUnguessable;
  } else {
    componentsOptions.pathLength = FIRShortDynamicLinkPathLengthDefault;
  }
  linkComponents.options = componentsOptions;

  [linkComponents shortenWithCompletion:^(NSURL *_Nullable shortURL, NSArray *_Nullable warnings,
                                          NSError *_Nullable error) {
    if (error) {
      DLog(@"Building short dynamic link failed %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"build-failed",
                                          @"message" : [error localizedDescription],
                                        }];
    } else {
      resolve(shortURL.absoluteString);
    }
  }];
}

// TODO refactor to reduce duplication
RCT_EXPORT_METHOD(getInitialLink
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSDictionary *launchOptions = self.bridge.launchOptions;

  if (launchOptions[UIApplicationLaunchOptionsURLKey]) {
    NSURL *url = (NSURL *)launchOptions[UIApplicationLaunchOptionsURLKey];
    FIRDynamicLink *dynamicLink =
        [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];

    if (dynamicLink && dynamicLink.url) {
      resolve(@{
        @"url" : dynamicLink.url.absoluteString,
        @"minimumAppVersion" : dynamicLink.minimumAppVersion == nil ? [NSNull null]
                                                                    : dynamicLink.minimumAppVersion,
        @"utmParameters" : dynamicLink.utmParametersDictionary == nil
            ? @{}
            : dynamicLink.utmParametersDictionary,
      });
    } else if ([RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl != nil) {
      resolve(@{
        @"url" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl,
        @"minimumAppVersion" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                    .initialLinkMinimumAppVersion == nil
            ? [NSNull null]
            : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkMinimumAppVersion,
        @"utmParameters" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                    .initialLinkUtmParametersDictionary == nil
            ? @{}
            : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                  .initialLinkUtmParametersDictionary,
      });
    } else {
      resolve([NSNull null]);
    }

    return;
  }

  NSDictionary *userActivityDict =
      launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
  if (userActivityDict && [userActivityDict[UIApplicationLaunchOptionsUserActivityTypeKey]
                              isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    NSUserActivity *userActivity =
        (NSUserActivity *)userActivityDict[@"UIApplicationLaunchOptionsUserActivityKey"];

    id completion = ^(FIRDynamicLink *_Nullable dynamicLink, NSError *_Nullable error) {
      if (!error && dynamicLink && dynamicLink.url) {
        resolve(@{
          @"url" : dynamicLink.url.absoluteString,
          @"minimumAppVersion" : dynamicLink.minimumAppVersion == nil
              ? [NSNull null]
              : dynamicLink.minimumAppVersion,
          @"utmParameters" : dynamicLink.utmParametersDictionary == nil
              ? @{}
              : dynamicLink.utmParametersDictionary,
        });
      } else if (!error &&
                 [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl != nil) {
        resolve(@{
          @"url" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl,
          @"minimumAppVersion" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                      .initialLinkMinimumAppVersion == nil
              ? [NSNull null]
              : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                    .initialLinkMinimumAppVersion,
          @"utmParameters" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                      .initialLinkUtmParametersDictionary == nil
              ? @{}
              : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                    .initialLinkUtmParametersDictionary,
        });
      } else if (error) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                          userInfo:(NSMutableDictionary *)@{
                                            @"code" : @"initial-link-error",
                                            @"message" : [error localizedDescription],
                                          }];
      } else {
        resolve([NSNull null]);
      }
    };

    [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL
                                             completion:completion];

    return;
  }

  if ([RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl != nil) {
    resolve(@{
      @"url" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkUrl,
      @"minimumAppVersion" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                  .initialLinkMinimumAppVersion == nil
          ? [NSNull null]
          : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance].initialLinkMinimumAppVersion,
      @"utmParameters" : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                  .initialLinkUtmParametersDictionary == nil
          ? @{}
          : [RNFBDynamicLinksAppDelegateInterceptor sharedInstance]
                .initialLinkUtmParametersDictionary,
    });
  } else {
    resolve([NSNull null]);
  }
}

RCT_EXPORT_METHOD(performDiagnostics) { [FIRDynamicLinks performDiagnosticsWithCompletion:nil]; }

RCT_EXPORT_METHOD(resolveLink
                  : (NSString *)link
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  id completion = ^(FIRDynamicLink *_Nullable dynamicLink, NSError *_Nullable error) {
    if (!error && dynamicLink && dynamicLink.url) {
      resolve(@{
        @"url" : dynamicLink.url.absoluteString,
        @"minimumAppVersion" : dynamicLink.minimumAppVersion == nil ? [NSNull null]
                                                                    : dynamicLink.minimumAppVersion,
        @"utmParameters" : dynamicLink.utmParametersDictionary == nil
            ? @{}
            : dynamicLink.utmParametersDictionary,
      });
    } else if (!error ||
               (error && [error.localizedDescription containsString:@"dynamicLinks error 404"])) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"not-found",
                                          @"message" : @"Dynamic link not found"
                                        }];
    } else {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"resolve-link-error",
                                          @"message" : [error localizedDescription]
                                        }];
    }
  };

  [[FIRDynamicLinks dynamicLinks] handleUniversalLink:[NSURL URLWithString:link]
                                           completion:completion];
}

- (FIRDynamicLinkComponents *)createDynamicLinkComponents:(NSDictionary *)dynamicLinkDict {
  NSURL *link = [NSURL URLWithString:dynamicLinkDict[@"link"]];
  FIRDynamicLinkComponents *linkComponents =
      [FIRDynamicLinkComponents componentsWithLink:link
                                   domainURIPrefix:dynamicLinkDict[@"domainUriPrefix"]];

  [self buildAnalyticsParameters:dynamicLinkDict[@"analytics"] components:linkComponents];
  [self buildAndroidParameters:dynamicLinkDict[@"android"] components:linkComponents];
  [self buildIosParameters:dynamicLinkDict[@"ios"] components:linkComponents];
  [self buildItunesParameters:dynamicLinkDict[@"itunes"] components:linkComponents];
  [self buildNavigationParameters:dynamicLinkDict[@"navigation"] components:linkComponents];
  [self buildSocialParameters:dynamicLinkDict[@"social"] components:linkComponents];

  return linkComponents;
}

- (void)buildAnalyticsParameters:(NSDictionary *)analyticsDict
                      components:(FIRDynamicLinkComponents *)linkComponents {
  if (analyticsDict == nil) return;

  FIRDynamicLinkGoogleAnalyticsParameters *analyticsParams =
      [FIRDynamicLinkGoogleAnalyticsParameters parameters];

  if (analyticsDict[@"campaign"]) {
    analyticsParams.campaign = analyticsDict[@"campaign"];
  }

  if (analyticsDict[@"content"]) {
    analyticsParams.content = analyticsDict[@"content"];
  }

  if (analyticsDict[@"medium"]) {
    analyticsParams.medium = analyticsDict[@"medium"];
  }

  if (analyticsDict[@"source"]) {
    analyticsParams.source = analyticsDict[@"source"];
  }

  if (analyticsDict[@"term"]) {
    analyticsParams.term = analyticsDict[@"term"];
  }

  linkComponents.analyticsParameters = analyticsParams;
}

- (void)buildAndroidParameters:(NSDictionary *)androidDict
                    components:(FIRDynamicLinkComponents *)linkComponents {
  if (androidDict == nil) return;

  FIRDynamicLinkAndroidParameters *androidParams =
      [FIRDynamicLinkAndroidParameters parametersWithPackageName:androidDict[@"packageName"]];

  if (androidDict[@"fallbackUrl"]) {
    androidParams.fallbackURL = [NSURL URLWithString:androidDict[@"fallbackUrl"]];
  }

  if (androidDict[@"minimumVersion"]) {
    androidParams.minimumVersion = [androidDict[@"minimumVersion"] integerValue];
  }

  linkComponents.androidParameters = androidParams;
}

- (void)buildIosParameters:(NSDictionary *)iosDict
                components:(FIRDynamicLinkComponents *)linkComponents {
  if (iosDict == nil) return;

  FIRDynamicLinkIOSParameters *iOSParams =
      [FIRDynamicLinkIOSParameters parametersWithBundleID:iosDict[@"bundleId"]];

  if (iosDict[@"appStoreId"]) {
    iOSParams.appStoreID = iosDict[@"appStoreId"];
  }

  if (iosDict[@"customScheme"]) {
    iOSParams.customScheme = iosDict[@"customScheme"];
  }

  if (iosDict[@"fallbackUrl"]) {
    iOSParams.fallbackURL = [NSURL URLWithString:iosDict[@"fallbackUrl"]];
  }

  if (iosDict[@"iPadBundleId"]) {
    iOSParams.iPadBundleID = iosDict[@"iPadBundleId"];
  }

  if (iosDict[@"iPadFallbackUrl"]) {
    iOSParams.iPadFallbackURL = [NSURL URLWithString:iosDict[@"iPadFallbackUrl"]];
  }

  if (iosDict[@"minimumVersion"]) {
    iOSParams.minimumAppVersion = iosDict[@"minimumVersion"];
  }

  linkComponents.iOSParameters = iOSParams;
}

- (void)buildItunesParameters:(NSDictionary *)itunesDict
                   components:(FIRDynamicLinkComponents *)linkComponents {
  if (itunesDict == nil) return;

  FIRDynamicLinkItunesConnectAnalyticsParameters *itunesParams =
      [FIRDynamicLinkItunesConnectAnalyticsParameters parameters];

  if (itunesDict[@"affiliateToken"]) {
    itunesParams.affiliateToken = itunesDict[@"affiliateToken"];
  }

  if (itunesDict[@"campaignToken"]) {
    itunesParams.campaignToken = itunesDict[@"campaignToken"];
  }

  if (itunesDict[@"providerToken"]) {
    itunesParams.providerToken = itunesDict[@"providerToken"];
  }

  linkComponents.iTunesConnectParameters = itunesParams;
}

- (void)buildNavigationParameters:(NSDictionary *)navigationDict
                       components:(FIRDynamicLinkComponents *)linkComponents {
  if (navigationDict == nil) return;

  FIRDynamicLinkNavigationInfoParameters *navigationParams =
      [FIRDynamicLinkNavigationInfoParameters parameters];

  if (navigationDict[@"forcedRedirectEnabled"]) {
    navigationParams.forcedRedirectEnabled = [navigationDict[@"forcedRedirectEnabled"] boolValue];
  }

  linkComponents.navigationInfoParameters = navigationParams;
}

- (void)buildSocialParameters:(NSDictionary *)socialDict
                   components:(FIRDynamicLinkComponents *)linkComponents {
  if (socialDict == nil) return;

  FIRDynamicLinkSocialMetaTagParameters *socialParams =
      [FIRDynamicLinkSocialMetaTagParameters parameters];
  if (socialDict[@"descriptionText"]) {
    socialParams.descriptionText = socialDict[@"descriptionText"];
  }

  if (socialDict[@"imageUrl"]) {
    socialParams.imageURL = [NSURL URLWithString:socialDict[@"imageUrl"]];
  }

  if (socialDict[@"title"]) {
    socialParams.title = socialDict[@"title"];
  }

  linkComponents.socialMetaTagParameters = socialParams;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[];
}

// TODO document or add a method to call this:
//     [FIRDynamicLinks performDiagnosticsWithCompletion:nil];
//     ref: https://firebase.google.com/docs/dynamic-links/debug#ios_self-diagnostic_tool

@end
