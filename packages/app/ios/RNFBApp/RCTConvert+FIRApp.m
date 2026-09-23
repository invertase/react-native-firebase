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

#import "RCTConvert+FIRApp.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

/**
 * Adapts `[FIRApp defaultApp]` / `[FIRApp appNamed:]` for `RCTConvertFIRApp`.
 */
@interface RNFBFIRAppRegistryAdapter : NSObject <RNFBFIRAppLookingUp>
@end

@implementation RNFBFIRAppRegistryAdapter

- (NSObject *)defaultApp {
  return [FIRApp defaultApp];
}

- (NSObject *)appNamed:(NSString *)name {
  return [FIRApp appNamed:name];
}

@end

static id<RNFBFIRAppLookingUp> RNFBFIRAppRegistry(void) {
  static RNFBFIRAppRegistryAdapter *sharedRegistry;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedRegistry = [[RNFBFIRAppRegistryAdapter alloc] init];
  });
  return sharedRegistry;
}

@implementation RCTConvert (FIRApp)
+ (FIRApp *)firAppFromString:(NSString *)appName {
  return (FIRApp *)[RCTConvertFIRApp firAppFromString:appName registry:RNFBFIRAppRegistry()];
}

RCT_CUSTOM_CONVERTER(FIRApp *, FIRApp, [self firAppFromString:[self NSString:json]]);
@end
