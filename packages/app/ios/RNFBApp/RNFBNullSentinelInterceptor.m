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

#import "RNFBNullSentinelInterceptor.h"
#import <objc/runtime.h>
#import "RNFBNullSentinelDecoder.h"

@implementation RNFBNullSentinelInterceptor

+ (void)load {
  [self scheduleSwizzleOnMainQueue];
}

+ (void)scheduleSwizzleOnMainQueue {
  static dispatch_once_t onceToken;
  [self scheduleSwizzleOnMainQueueWithOnceToken:&onceToken turboConvertClass:Nil];
}

+ (void)scheduleSwizzleOnMainQueueWithOnceToken:(dispatch_once_t *)onceToken
                              turboConvertClass:(Class)turboConvertClass {
  dispatch_async(dispatch_get_main_queue(), ^{
    dispatch_once(onceToken, ^{
      if (turboConvertClass) {
        [self swizzleTurboModuleConversions:turboConvertClass];
      } else {
        [self swizzleRCTConvertMethods];
      }
    });
  });
}

+ (void)swizzleRCTConvertMethods {
  // For TurboModules: Swizzle RCTCxxConvert to intercept all conversion methods
  Class cxxConvertClass = NSClassFromString(@"RCTCxxConvert");
  if (cxxConvertClass) {
    [self swizzleTurboModuleConversions:cxxConvertClass];
  }
}

+ (void)swizzleTurboModuleConversions:(Class)cxxConvertClass {
  // Get all methods from RCTCxxConvert
  unsigned int methodCount = 0;
  Method *methods = class_copyMethodList(object_getClass(cxxConvertClass), &methodCount);

  for (unsigned int i = 0; i < methodCount; i++) {
    Method method = methods[i];
    SEL selector = method_getName(method);
    NSString *selectorName = NSStringFromSelector(selector);

    // Intercept TurboModule data conversion methods (they follow pattern:
    // JS_NativeRNFBTurbo*_Spec*)
    if ([selectorName hasPrefix:@"JS_NativeRNFBTurbo"] && [selectorName containsString:@"_Spec"]) {
      // Create a swizzled version using IMP
      IMP originalIMP = method_getImplementation(method);

      // Replace with our wrapper that decodes nulls
      IMP newIMP = imp_implementationWithBlock(^id(id self, id json) {
        // Decode null sentinels before passing to original conversion
        id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:json];

        // Call original implementation with decoded data
        typedef id (*OriginalFunc)(id, SEL, id);
        OriginalFunc originalFunc = (OriginalFunc)originalIMP;
        return originalFunc(self, selector, decoded);
      });

      method_setImplementation(method, newIMP);
    }
  }

  free(methods);
}

@end
