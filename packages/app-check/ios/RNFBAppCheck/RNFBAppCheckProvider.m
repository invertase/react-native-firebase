/**
 * Copyright (c) 2023-present Invertase Limited & Contributors
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
#import "RNFBAppCheckProvider.h"
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBAppCheckProvider

- (id)initWithApp:app {
  DLog(@"RNFBAppCheck init with app %@", [app name]);
  self = [super init];
  if (self) {
    self.app = app;
  }
  return self;
}

- (void)configure:(FIRApp *)app
     providerName:(NSString *)providerName
       debugToken:(NSString *)debugToken {
  DLog(@"appName/providerName/debugToken: %@/%@/%@", app.name, providerName,
       (debugToken == nil ? @"null" : @"(not shown)"));

  DLog(@"appName %@", app.name);

  // - determine if debugToken is provided via nullable arg
  if ([providerName isEqualToString:@"debug"]) {
    // TODO: Currently not handling debugToken argument, relying on existing environment
    //       variable configuration style.
    //     - maybe directly setting an environment variable could work?
    //     https://stackoverflow.com/questions/27139589/whats-the-idiomatic-way-of-setting-an-environment-variable-in-objective-c-coco
    //     - ...otherwise if env var does not work
    //       - subclass style: RNFBAppCheckDebugProvider, and we should print local token
    //       - if a debugToken parameter was supplied, set
    //       RNFBAppCheckDebugProvider.configuredDebugToken
    //     - print local token
    //     https://github.com/firebase/firebase-ios-sdk/blob/c7e95996ff/FirebaseAppCheck/Sources/DebugProvider/FIRAppCheckDebugProviderFactory.m
    //     - print if current token in provided by configuration, by environment variable, or local
    //     token?

    self.delegateProvider = [[FIRAppCheckDebugProvider new] initWithApp:app];
  }

  if ([providerName isEqualToString:@"deviceCheck"]) {
    self.delegateProvider = [[FIRDeviceCheckProvider new] initWithApp:app];
  }

  if ([providerName isEqualToString:@"appAttest"]) {
    if (@available(iOS 14.0, macCatalyst 14.0, tvOS 15.0, watchOS 9.0, *)) {
      self.delegateProvider = [[FIRAppAttestProvider alloc] initWithApp:app];
    } else {
      // This is not a valid configuration.
      DLog(@"AppAttest unavailable: it requires iOS14+, macCatalyst14+ or tvOS15+. Installing "
           @"debug provider to guarantee invalid tokens in this invalid configuration.");
      self.delegateProvider = [[FIRAppCheckDebugProvider new] initWithApp:app];
    }
  }

  if ([providerName isEqualToString:@"appAttestWithDeviceCheckFallback"]) {
    if (@available(iOS 14.0, *)) {
      self.delegateProvider = [[FIRAppAttestProvider alloc] initWithApp:app];
    } else {
      self.delegateProvider = [[FIRDeviceCheckProvider alloc] initWithApp:app];
    }
  }
}

- (void)getTokenWithCompletion:(nonnull void (^)(FIRAppCheckToken *_Nullable,
                                                 NSError *_Nullable))handler {
  DLog(@"proxying to delegateProvider...");
  [self.delegateProvider getTokenWithCompletion:handler];
}

@end
