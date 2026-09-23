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

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

@interface RNFBAppModule (Testing)
+ (void)setCustomDomain:(nullable NSString *)authDomain forAppName:(NSString *)appName;
+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName;
+ (void)resetCustomDomainsForTesting;
@end

@implementation RNFBAppModule

+ (NSString *)getCustomDomain:(NSString *)appName {
  if (appName == nil) {
    return nil;
  }
  return [RNFBAppCustomAuthDomains getCustomDomain:appName];
}

+ (void)setCustomDomain:(nullable NSString *)authDomain forAppName:(NSString *)appName {
  if (appName == nil) {
    return;
  }
  [RNFBAppCustomAuthDomains setCustomDomain:authDomain forAppName:appName];
}

+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName {
  [self setCustomDomain:domain forAppName:appName];
}

+ (void)resetCustomDomainsForTesting {
  [RNFBAppCustomAuthDomains resetCustomDomainsForTesting];
}

- (void)setLogLevel:(NSString *)logLevel {
  (void)logLevel;
}

@end
