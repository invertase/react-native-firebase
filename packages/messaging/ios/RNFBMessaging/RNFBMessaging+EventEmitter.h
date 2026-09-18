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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Thin Objective-C bridge so Swift code inside this pod (RNFBMessaging) can
/// send events through `RNFBRCTEventEmitter` (packages/app) without Swift
/// itself needing `import RNFBApp`.
///
/// `RNFBApp` -- like every other RNFB pod, including this one's own
/// `RNFBMessaging+*.h` headers -- declares (almost) all of its headers
/// `private_header_files` in its podspec. CocoaPods only feeds a framework's
/// *public* headers into its generated umbrella header, and Swift's
/// `import <Module>` only sees symbols reachable from that umbrella header --
/// so `import RNFBApp` from a Swift file exposes nothing (confirmed:
/// `RNFBApp-umbrella.h` only contains the module version constants).
/// Objective-C(++) files aren't affected by this: `#import
/// <RNFBApp/RNFBRCTEventEmitter.h>` is a plain textual header lookup via
/// header search paths, not a Clang module import -- which is why every other
/// `.m`/`.mm` file in RNFB has always been able to reach another pod's
/// "private" headers directly.
///
/// This class lives in RNFBMessaging (not RNFBApp, out of scope for this
/// refactor) and is itself an ordinary Objective-C class, so it's
/// automatically visible to this pod's own Swift files via the pod's
/// implicit bridging header -- no explicit import needed on the Swift side.
@interface RNFBMessagingEventEmitter : NSObject

+ (void)sendTokenRefreshEventWithToken:(NSString *)token NS_SWIFT_NAME(sendTokenRefreshEvent(token:));

@end

NS_ASSUME_NONNULL_END
