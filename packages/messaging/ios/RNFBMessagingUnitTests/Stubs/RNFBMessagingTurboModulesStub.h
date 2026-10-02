/**
 * Host-test stand-in for the codegen'd RNFBMessagingTurboModules.h. Declares just enough
 * Obj-C++ surface for RNFBMessagingModule.mm to compile without ReactCommon / JSI.
 *
 * This file is deliberately NOT named RNFBMessagingTurboModules.h: the spec/native parity helper
 * (packages/app/__tests__/specNativeParityHelper.ts) requires exactly one file matching
 * /^RNFB.*TurboModules\.h$/ under packages/messaging/ios (build output included). A clang VFS
 * overlay (rnfb-messaging-vfs-overlay.yaml, wired via -ivfsoverlay in the project) exposes this
 * file as a virtual RNFBMessagingTurboModules.h so the production
 * `#import "RNFBMessagingTurboModules.h"` resolves unchanged without a second physical copy.
 */

#ifndef __cplusplus
#error This file must be compiled as Obj-C++.
#endif

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <UserNotifications/UserNotifications.h>
#import <memory>
#import <optional>

// Some UserNotifications constants are marked unavailable on macOS; requestPermission: and
// hasPermission: (not under test) still name them.
#define UNAuthorizationOptionAnnouncement ((UNAuthorizationOptions)0)
#define UNAuthorizationOptionCarPlay ((UNAuthorizationOptions)0)
#define UNAuthorizationStatusEphemeral ((UNAuthorizationStatus)3)

namespace JS {
namespace NativeRNFBTurboMessaging {
struct Constants {};

struct IOSPermissions {
  std::optional<bool> alert() const { return std::nullopt; }
  std::optional<bool> announcement() const { return std::nullopt; }
  std::optional<bool> badge() const { return std::nullopt; }
  std::optional<bool> carPlay() const { return std::nullopt; }
  std::optional<bool> criticalAlert() const { return std::nullopt; }
  std::optional<bool> provisional() const { return std::nullopt; }
  std::optional<bool> sound() const { return std::nullopt; }
  std::optional<bool> providesAppNotificationSettings() const { return std::nullopt; }
};
}  // namespace NativeRNFBTurboMessaging
}  // namespace JS

namespace facebook {
namespace react {

template <typename T>
struct ModuleConstants {
  NSDictionary *dictionary;
  ModuleConstants(id value) : dictionary(value) {}
};

class TurboModule {
 public:
  virtual ~TurboModule() = default;
};

struct ObjCTurboModule {
  struct InitParams {};
};

class NativeRNFBTurboMessagingSpecJSI : public TurboModule {
 public:
  NativeRNFBTurboMessagingSpecJSI(const ObjCTurboModule::InitParams &) {}
};

}  // namespace react
}  // namespace facebook

@interface _RCTTypedModuleConstants : NSObject
+ (instancetype)newWithUnsafeDictionary:(NSDictionary *)dictionary;
@end

@protocol NativeRNFBTurboMessagingSpec <RCTBridgeModule>
@end
