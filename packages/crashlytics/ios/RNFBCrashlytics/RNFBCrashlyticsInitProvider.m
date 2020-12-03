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

#import <FirebaseCore/FIRAppInternal.h>
#import <Firebase/Firebase.h>
#import "RNFBCrashlyticsInitProvider.h"
#import "RNFBPreferences.h"
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "RNFBApp/RNFBSharedUtils.h"

NSString *const KEY_CRASHLYTICS_DEBUG_ENABLED = @"crashlytics_debug_enabled";
NSString *const KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED = @"crashlytics_auto_collection_enabled";

@implementation RNFBCrashlyticsInitProvider

+ (void)load {
  [FIRApp registerInternalLibrary:self withName:@"react-native-firebase-crashlytics" withVersion:@"6.0.0"];
}

+ (BOOL)isCrashlyticsCollectionEnabled {
  BOOL enabled;

  if ([[RNFBPreferences shared] contains:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED]) {
    enabled = [[RNFBPreferences shared] getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    DLog(@"isCrashlyticsCollectionEnabled via RNFBPreferences: %d", enabled);
  } else if ([[RNFBJSON shared] contains:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED]) {
    enabled = [[RNFBJSON shared] getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    DLog(@"isCrashlyticsCollectionEnabled via RNFBJSON: %d", enabled);
  } else {
    // Note that if we're here, and the key is not set on the app's bundle, we default to "YES"
    enabled = [RNFBMeta getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    DLog(@"isCrashlyticsCollectionEnabled via RNFBMeta: %d", enabled);
  }

  DLog(@"isCrashlyticsCollectionEnabled: %d", enabled);

  return enabled;
}

+ (NSArray<FIRComponent *> *)componentsToRegister {
  return @[];
}

/*
 * configureWithApp is automatically invoked by Firebase as this app is a registered FIRLibrary with the SDK.
 *
 * At this point "configure" has already been called on the FIRApp instance. This behavior is meant to mirror
 * what is done in ReactNativeFirebaseCrashlyticsInitProvider.java
 *
 * This pattern may not be supported long term https://github.com/firebase/firebase-ios-sdk/issues/2933
 */
+ (void)configureWithApp:(FIRApp *)app {
  // This setting is sticky. setCrashlyticsCollectionEnabled persists the setting to disk until it is explicitly set otherwise or the app is deleted.
  // Jump to the setCrashlyticsCollectionEnabled definition to see implementation details.
  [[FIRCrashlytics crashlytics] setCrashlyticsCollectionEnabled:self.isCrashlyticsCollectionEnabled];
  DLog(@"initialization successful");
}

@end
