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

/**
 * Host-only stub for the codegen `RNFBAppTurboModules.h` (macOS XCTest). It models only the
 * TurboModule types the shipped `RNFBAppModule.mm` / `RNFBUtilsModule.mm` shells name, so
 * those files compile unchanged in the unit-test target. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#include <memory>

namespace facebook {
namespace react {

class TurboModule {
 public:
  virtual ~TurboModule() = default;
};

class ObjCTurboModule : public TurboModule {
 public:
  struct InitParams {
    const char *moduleName = "";
  };
  explicit ObjCTurboModule(const InitParams &params) : moduleName_(params.moduleName) {}
  const char *moduleName() const { return moduleName_; }

 private:
  const char *moduleName_;
};

class NativeRNFBTurboAppSpecJSI : public ObjCTurboModule {
 public:
  explicit NativeRNFBTurboAppSpecJSI(const InitParams &params) : ObjCTurboModule(params) {}
};

class NativeRNFBTurboUtilsSpecJSI : public ObjCTurboModule {
 public:
  explicit NativeRNFBTurboUtilsSpecJSI(const InitParams &params) : ObjCTurboModule(params) {}
};

/** Untyped storage the host `_RCTTypedModuleConstants` returns. */
struct ModuleConstantsStorage {
  NSDictionary *dictionary = nil;
};

template <typename T>
struct ModuleConstants {
  NSDictionary *dictionary = nil;
  ModuleConstants() = default;
  ModuleConstants(const ModuleConstantsStorage &storage) : dictionary(storage.dictionary) {}
};

}  // namespace react
}  // namespace facebook

namespace JS {
namespace NativeRNFBTurboApp {
struct Constants {};
}  // namespace NativeRNFBTurboApp
namespace NativeRNFBTurboUtils {
struct Constants {};
}  // namespace NativeRNFBTurboUtils
}  // namespace JS

@interface _RCTTypedModuleConstants : NSObject
+ (facebook::react::ModuleConstantsStorage)newWithUnsafeDictionary:(NSDictionary *)dictionary;
@end

@protocol NativeRNFBTurboAppSpec <RCTBridgeModule>
@end

@protocol NativeRNFBTurboUtilsSpec <RCTBridgeModule>
@end
