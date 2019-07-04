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

#import "RNFBMessagingAppDelegateInterceptor.h"
#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <GoogleUtilities/GULAppDelegateSwizzler.h>

@implementation RNFBMessagingAppDelegateInterceptor

+ (instancetype)shared {
  static dispatch_once_t once;
  static RNFBMessagingAppDelegateInterceptor *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBMessagingAppDelegateInterceptor alloc] init];
  });
  return sharedInstance;
}

+ (void)load {
  [GULAppDelegateSwizzler proxyOriginalDelegateIncludingAPNSMethods];
  [GULAppDelegateSwizzler registerAppDelegateInterceptor:[self shared]];
}


@end
