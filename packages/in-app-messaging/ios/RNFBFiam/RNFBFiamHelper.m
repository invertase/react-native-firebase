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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#define RNFB_FIAM_SDK_AVAILABLE 1
#elif !TARGET_OS_MACCATALYST
// SPM on iOS/tvOS: FirebaseInAppMessaging is a Swift product — use @import in
// this plain .m (needs -fmodules only). Do not move @import into the .mm
// TurboModule (that would require -fcxx-modules).
@import FirebaseCore;
@import FirebaseInAppMessaging;
#define RNFB_FIAM_SDK_AVAILABLE 1
#else
// Product module absent under Mac Catalyst + SPM. Upstream Package.swift omits
// .macCatalyst from FirebaseInAppMessagingTarget; CocoaPods historically
// masked this via the Firebase umbrella. Temporary stubs pending
// https://github.com/firebase/firebase-ios-sdk/pull/16468 (or permanent if
// upstream declines). When that PR lands, drop the TARGET_OS_MACCATALYST
// gate and use the @import path on Catalyst too.
#define RNFB_FIAM_SDK_AVAILABLE 0
#endif

#import "RNFBFiamHelper.h"

@implementation RNFBFiamHelper

+ (BOOL)isMessageDisplaySuppressed {
#if RNFB_FIAM_SDK_AVAILABLE
  return [FIRInAppMessaging inAppMessaging].messageDisplaySuppressed;
#else
  return NO;
#endif
}

+ (BOOL)isAutomaticDataCollectionEnabled {
#if RNFB_FIAM_SDK_AVAILABLE
  return [FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled;
#else
  return NO;
#endif
}

+ (void)setAutomaticDataCollectionEnabled:(BOOL)enabled {
#if RNFB_FIAM_SDK_AVAILABLE
  [FIRInAppMessaging inAppMessaging].automaticDataCollectionEnabled = enabled;
#else
  (void)enabled;
#endif
}

+ (void)setMessageDisplaySuppressed:(BOOL)enabled {
#if RNFB_FIAM_SDK_AVAILABLE
  [FIRInAppMessaging inAppMessaging].messageDisplaySuppressed = enabled;
#else
  (void)enabled;
#endif
}

+ (void)triggerEvent:(NSString *)eventId {
#if RNFB_FIAM_SDK_AVAILABLE
  [[FIRInAppMessaging inAppMessaging] triggerEvent:eventId];
#else
  (void)eventId;
#endif
}

@end
