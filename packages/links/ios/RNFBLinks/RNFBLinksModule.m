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


#import "RNFBLinksModule.h"
#import "RNFBLinksAppDelegateInterceptor.h"

@implementation RNFBLinksModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Links Methods

RCT_EXPORT_METHOD(buildLink:
  (NSDictionary *) dynamicLinkDict
    :(RCTPromiseResolveBlock)resolve
    :(RCTPromiseRejectBlock)reject) {
  // TODO
}

RCT_EXPORT_METHOD(buildShortLink:
  (NSDictionary *) dynamicLinkDict
    :(NSString *)shortLinkType
    :(RCTPromiseResolveBlock)resolve
    :(RCTPromiseRejectBlock)reject) {
  // TODO
}

RCT_EXPORT_METHOD(getInitialLink:
  (RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock)reject) {
  NSDictionary *launchOptions = self.bridge.launchOptions;

  if (launchOptions[UIApplicationLaunchOptionsURLKey]) {
    NSURL *url = (NSURL *) launchOptions[UIApplicationLaunchOptionsURLKey];
    FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];

    if (dynamicLink && dynamicLink.url) resolve(dynamicLink.url.absoluteString);
    else resolve([NSNull null]);

    return;
  }

  NSDictionary *userActivityDict = launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
  if (userActivityDict && [userActivityDict[UIApplicationLaunchOptionsUserActivityTypeKey] isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    NSUserActivity *userActivity = (NSUserActivity *) userActivityDict[@"UIApplicationLaunchOptionsUserActivityKey"];

    id completion = ^(FIRDynamicLink *_Nullable dynamicLink, NSError *_Nullable error) {
      if (!error && dynamicLink && dynamicLink.url) {
        resolve(dynamicLink.url.absoluteString);
      } else if (!error) {
        resolve([NSNull null]);
      } else {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"initial-link-error",
            @"message": [error localizedDescription],
        }];
      }
    };

    [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL completion:completion];

    return;
  }

  if ([RNFBLinksAppDelegateInterceptor shared].initialLink) {
    resolve([RNFBLinksAppDelegateInterceptor shared].initialLink);
  } else {
    resolve([NSNull null]);
  }
}

- (FIRDynamicLinkComponents *)createDynamicLinkComponents:(NSDictionary *)dynamicLinkDict {

}

@end
