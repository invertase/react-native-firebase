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

#import "RNFBCrashlyticsInitProvider.h"
#import "Crashlytics.h"
#import "RNFBPreferences.h"
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "FIROptions.h"
#import "FIRApp.h"
#import "Fabric.h"


NSString *const KEY_CRASHLYTICS_DEBUG_ENABLED = @"crashlytics_debug_enabled";
NSString *const KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED = @"crashlytics_auto_collection_enabled";

@implementation RNFBCrashlyticsInitProvider

  + (void)load {
    if ([self isCrashlyticsCollectionEnabled]) {
      // TODO(salakar): Without dispatch `[FIRApp configure];` breaks Detox and causes a crash on start (cannot read a userDefaults key)
      dispatch_async(dispatch_get_main_queue(), ^{
        FIROptions *defaultFirebaseOptions = [FIROptions defaultOptions];
        if (defaultFirebaseOptions == nil) return;

        NSString *googleAppID = defaultFirebaseOptions.googleAppID;
        if (googleAppID == nil) return;

        // TODO(salakar): Option to disable auto init
        // TODO(salakar): If disabled; when the default app is initialized from JS land then init crashlytics (register a block handler somehow in RNFBApp?)
        if ([FIRApp defaultApp] == nil) {
          [FIRApp configure];
        }

        if ([[RNFBJSON shared] contains:KEY_CRASHLYTICS_DEBUG_ENABLED]) {
          [Crashlytics sharedInstance].debugMode = [[RNFBJSON shared] getBooleanValue:KEY_CRASHLYTICS_DEBUG_ENABLED defaultValue:NO];
        }

        [Fabric with:@[[Crashlytics class]]];
      });
    }
  }

  + (BOOL)isCrashlyticsCollectionEnabled {
    BOOL enabled;

    if ([[RNFBPreferences shared] contains:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED]) {
      enabled = [[RNFBPreferences shared] getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    } else if ([[RNFBJSON shared] contains:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED]) {
      enabled = [[RNFBJSON shared] getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    } else {
      enabled = [RNFBMeta getBooleanValue:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED defaultValue:YES];
    }

    return enabled;
  }

@end
