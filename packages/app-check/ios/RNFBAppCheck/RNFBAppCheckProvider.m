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
    // The firebase-ios-sdk debug app check provider will take a token from environment if it
    // exists:
    if (debugToken != nil) {
      // We have a debug token, so just need to stuff it in the environment and it will hook up
      char *key = "FIRAAppCheckDebugToken", *value = (char *)[debugToken UTF8String];
      int overwrite = 1;
      setenv(key, value, overwrite);
    }

    self.delegateProvider = [[FIRAppCheckDebugProvider alloc] initWithApp:app];
  }

  if ([providerName isEqualToString:@"deviceCheck"]) {
    self.delegateProvider = [[FIRDeviceCheckProvider alloc] initWithApp:app];
  }

  if ([providerName isEqualToString:@"appAttest"]) {
    if (@available(iOS 14.0, macOS 11.0, macCatalyst 14.0, tvOS 15.0, watchOS 9.0, *)) {
      self.delegateProvider = [[FIRAppAttestProvider alloc] initWithApp:app];
    } else {
      // This is not a valid configuration.
      DLog(@"AppAttest unavailable: it requires iOS14+, macOS 11+, macCatalyst14+ or tvOS15+. "
           @"Installing "
           @"debug provider to guarantee invalid tokens in this invalid configuration.");
      self.delegateProvider = [[FIRAppCheckDebugProvider alloc] initWithApp:app];
    }
  }

  if ([providerName isEqualToString:@"appAttestWithDeviceCheckFallback"]) {
    if (@available(iOS 14.0, macOS 11.0, macCatalyst 14.0, tvOS 15.0, watchOS 9.0, *)) {
      self.delegateProvider = [[FIRAppAttestProvider alloc] initWithApp:app];
    } else {
      self.delegateProvider = [[FIRDeviceCheckProvider alloc] initWithApp:app];
    }
  }
}

- (void)getTokenWithCompletion:(nonnull void (^)(FIRAppCheckToken *_Nullable,
                                                 NSError *_Nullable))handler {
  DLog(@"proxying getTokenWithCompletion to delegateProvider...");
  [self.delegateProvider getTokenWithCompletion:handler];
}

- (void)getLimitedUseTokenWithCompletion:(nonnull void (^)(FIRAppCheckToken *_Nullable,
                                                           NSError *_Nullable))handler {
  DLog(@"proxying getLimitedUseTokenWithCompletion to delegateProvider...");
  [self.delegateProvider getLimitedUseTokenWithCompletion:handler];
}

@end
