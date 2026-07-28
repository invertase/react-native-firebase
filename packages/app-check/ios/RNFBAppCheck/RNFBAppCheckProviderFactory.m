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
    // This pre-configure default must not be "debug" in release builds. The Expo config
    // plugin emits `RNFBAppCheckModule.sharedInstance()` BEFORE `FirebaseApp.configure()`
    // in AppDelegate, so FIRAppCheckInterop — registered with
    // FIRInstantiationTimingAlwaysEager — instantiates a provider from inside configure(),
    // while providers[app.name] is still nil. Defaulting to debug therefore installs
    // FIRAppCheckDebugProvider on release builds, which exchanges an unregistered debug
    // token against firebaseappcheck.googleapis.com: 403 "App attestation failed", and 429
    // once the per-project debug-token quota saturates. See discussion #7518.
    //
    // DEBUG builds keep the debug default, which local development with debug tokens
    // relies on.
#if DEBUG
    NSString *defaultProviderName = @"debug";
#else
    NSString *defaultProviderName = @"appAttestWithDeviceCheckFallback";
#endif
    DLog(@"provider initializing (with default to %@) for app %@", defaultProviderName, app.name);
    self.providers[app.name] = [RNFBAppCheckProvider new];
    RNFBAppCheckProvider *provider = self.providers[app.name];
    [provider configure:app providerName:defaultProviderName debugToken:nil];
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
