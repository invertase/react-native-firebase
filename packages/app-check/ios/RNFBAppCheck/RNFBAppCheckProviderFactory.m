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

#import "RNFBAppCheckProviderFactory.h"
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBAppCheckProviderFactory

- (nullable id<FIRAppCheckProvider>)createProviderWithApp:(FIRApp *)app {
  DLog(@"appName %@", app.name);

  // Firebase may call this during FirebaseApp.configure() before JS runs
  // configureProvider. Install a pending facade only (AppCheck-AD-1).
  if (self.providers == nil) {
    DLog(@"providers dictionary initializing for app %@", app.name);
    self.providers = [NSMutableDictionary new];
  }

  if (self.providers[app.name] == nil) {
    // AppCheck-AD-1 / AD-2: facade only until configureProvider; no real provider
    // (debug/App Attest/etc.) before JS/native configure. Same path DEBUG and release.
    DLog(@"provider initializing (pending, no delegate) for app %@", app.name);
    self.providers[app.name] = [RNFBAppCheckProvider new];
  }

  return self.providers[app.name];
}

- (void)configure:(FIRApp *)app
     providerName:(NSString *)providerName
       debugToken:(NSString *)debugToken {
  DLog(@"appName/providerName/debugToken: %@/%@/%@", app.name, providerName,
       (debugToken == nil ? @"null" : @"(not shown)"));
  if (self.providers == nil) {
    self.providers = [NSMutableDictionary new];
  }

  if (self.providers[app.name] == nil) {
    self.providers[app.name] = [RNFBAppCheckProvider new];
  }

  RNFBAppCheckProvider *provider = self.providers[app.name];
  [provider configure:app providerName:providerName debugToken:debugToken];
}

- (RNFBAppCheckProvider *)providerForApp:(FIRApp *)app {
  if (app == nil || self.providers == nil) {
    return nil;
  }
  return self.providers[app.name];
}

@end
