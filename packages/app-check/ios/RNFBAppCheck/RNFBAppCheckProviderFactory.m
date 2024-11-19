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

  // The SDK may try to call this before we have been configured,
  // so we will configure ourselves and set the provider up as a default to start
  // pre-configure
  if (self.providers == nil) {
    DLog(@"providers dictionary initializing for app %@", app.name);
    self.providers = [NSMutableDictionary new];
  }

  if (self.providers[app.name] == nil) {
    DLog(@"provider initializing (with default to debug) for app %@", app.name);
    self.providers[app.name] = [RNFBAppCheckProvider new];
    RNFBAppCheckProvider *provider = self.providers[app.name];
    [provider configure:app providerName:@"debug" debugToken:nil];
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

@end
