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

#import "RNFBDynamicLinksAppDelegateInterceptor.h"
#import <GoogleUtilities/GULAppDelegateSwizzler.h>
#import <RNFBApp/RNFBRCTEventEmitter.h>

@implementation RNFBDynamicLinksAppDelegateInterceptor

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  static RNFBDynamicLinksAppDelegateInterceptor *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBDynamicLinksAppDelegateInterceptor alloc] init];
    sharedInstance.initialLinkUrl = nil;
    sharedInstance.initialLinkMinimumAppVersion = nil;
    sharedInstance.initialLinkUtmParametersDictionary = @{};
    [GULAppDelegateSwizzler proxyOriginalDelegate];
    [GULAppDelegateSwizzler registerAppDelegateInterceptor:sharedInstance];
  });
  return sharedInstance;
}

- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<NSString *, id> *)options {
  FIRDynamicLink *dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromCustomSchemeURL:url];

  if (!dynamicLink) {
    dynamicLink = [[FIRDynamicLinks dynamicLinks] dynamicLinkFromUniversalLinkURL:url];
  }

  if (!dynamicLink) {
    return NO;
  }

  if (dynamicLink.url) {
    if (_initialLinkUrl == nil) {
      _initialLinkUrl = dynamicLink.url.absoluteString;
      _initialLinkMinimumAppVersion = dynamicLink.minimumAppVersion;
      _initialLinkUtmParametersDictionary = dynamicLink.utmParametersDictionary;
    }
    [[RNFBRCTEventEmitter shared]
        sendEventWithName:LINK_RECEIVED_EVENT
                     body:@{
                       @"url" : dynamicLink.url.absoluteString,
                       @"minimumAppVersion" : dynamicLink.minimumAppVersion == nil
                           ? [NSNull null]
                           : dynamicLink.minimumAppVersion,
                       @"utmParameters" : dynamicLink.utmParametersDictionary == nil
                           ? @{}
                           : dynamicLink.utmParametersDictionary,
                     }];
  }

  // results of this are ORed and NO doesn't affect other delegate interceptors' result
  return NO;
}

#pragma mark - User Activities overridden handler methods

- (BOOL)application:(UIApplication *)application
    continueUserActivity:(NSUserActivity *)userActivity
      restorationHandler:
          (void (^_Nonnull __strong)(NSArray<id<UIUserActivityRestoring>>
                                         *_Nullable __strong restorableObjects))restorationHandler {
  __block BOOL retried = NO;

  id completion = ^(FIRDynamicLink *_Nullable dynamicLink, NSError *_Nullable error) {
    if (!error && dynamicLink && dynamicLink.url) {
      if (self->_initialLinkUrl == nil) {
        self->_initialLinkUrl = dynamicLink.url.absoluteString;
        self->_initialLinkMinimumAppVersion = dynamicLink.minimumAppVersion;
        self->_initialLinkUtmParametersDictionary = dynamicLink.utmParametersDictionary;
      }
      [[RNFBRCTEventEmitter shared]
          sendEventWithName:LINK_RECEIVED_EVENT
                       body:@{
                         @"url" : dynamicLink.url.absoluteString,
                         @"minimumAppVersion" : dynamicLink.minimumAppVersion == nil
                             ? [NSNull null]
                             : dynamicLink.minimumAppVersion,
                         @"utmParameters" : dynamicLink.utmParametersDictionary == nil
                             ? @{}
                             : dynamicLink.utmParametersDictionary,
                       }];
    };

    // Per Apple Tech Support, a network failure could occur when returning from background on
    // iOS 12. https://github.com/AFNetworking/AFNetworking/issues/4279#issuecomment-447108981 So
    // we'll retry the request once
    if (error && !retried && [NSPOSIXErrorDomain isEqualToString:error.domain] &&
        error.code == 53) {
      retried = YES;
      [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL
                                               completion:completion];
    }

    // TODO: We could send this to JS and maybe have a onDynamicLinkError listener but there's also
    // a good chance the
    // TODO: `userActivity.webpageURL` might not be for a Firebase dynamic link, which needs
    // consideration - so we'll
    // TODO: log this for now, logging will get picked up by Crashlytics automatically if its
    // integrated.
    if (error)
      NSLog(@"RNFBDynamicLinks: Unknown error occurred when attempting to handle a universal link: "
            @"%@",
            error);
  };

  [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL
                                           completion:completion];

  // results of this are ORed and NO doesn't affect other delegate interceptors' result
  return NO;
}

@end
