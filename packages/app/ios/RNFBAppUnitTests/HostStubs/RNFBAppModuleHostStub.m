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
 */

#import "RNFBAppModule.h"

@interface RNFBAppModule (Testing)
+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName;
+ (void)resetCustomDomainsForTesting;
@end

@implementation RNFBAppModule

static NSMutableDictionary<NSString *, NSString *> *RNFBAppModuleCustomDomains(void) {
  static NSMutableDictionary<NSString *, NSString *> *domains;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    domains = [NSMutableDictionary new];
  });
  return domains;
}

+ (NSString *)getCustomDomain:(NSString *)appName {
  if (appName == nil) {
    return nil;
  }
  return RNFBAppModuleCustomDomains()[appName];
}

+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName {
  if (appName == nil) {
    return;
  }
  if (domain == nil) {
    [RNFBAppModuleCustomDomains() removeObjectForKey:appName];
  } else {
    RNFBAppModuleCustomDomains()[appName] = [domain copy];
  }
}

+ (void)resetCustomDomainsForTesting {
  [RNFBAppModuleCustomDomains() removeAllObjects];
}

- (void)setLogLevel:(NSString *)logLevel {
  (void)logLevel;
}

@end
