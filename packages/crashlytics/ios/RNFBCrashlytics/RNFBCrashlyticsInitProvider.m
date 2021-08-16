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
#import <Firebase/Firebase.h>
#import <FirebaseCore/FIRAppInternal.h>
#import "RNFBJSON.h"
#import "RNFBMeta.h"
#import "RNFBPreferences.h"
#import "RNFBSharedUtils.h"
#import "RNFBVersion.h"

NSString *const KEY_APP_DATA_COLLECTION_DEFAULT_ENABLED = @"app_data_collection_default_enabled";
NSString *const KEY_CRASHLYTICS_DEBUG_ENABLED = @"crashlytics_debug_enabled";
NSString *const KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED = @"crashlytics_auto_collection_enabled";
NSString *const KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED =
    @"crashlytics_is_error_generation_on_js_crash_enabled";
NSString *const KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED =
    @"crashlytics_javascript_exception_handler_chaining_enabled";

@implementation RNFBCrashlyticsInitProvider

+ (void)load {
  [FIRApp registerInternalLibrary:self
                         withName:@"react-native-firebase-crashlytics"
                      withVersion:[RNFBVersionString copy]];
}

+ (BOOL)isCrashlyticsCollectionEnabled {
#ifdef DEBUG
  if (![RNFBSharedUtils getConfigBooleanValue:@"RNFBCrashlyticsInit"
                                          key:KEY_CRASHLYTICS_DEBUG_ENABLED
                                 defaultValue:NO]) {
    DLog(@"RNFBCrashlyticsInit isCrashlyticsCollectionEnabled after checking %@: %d",
         KEY_CRASHLYTICS_DEBUG_ENABLED, FALSE);
    return FALSE;
  }
#endif

  if ([RNFBSharedUtils configContains:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED]) {
    return [RNFBSharedUtils getConfigBooleanValue:@"RNFBCrashlyticsInit"
                                              key:KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED
                                     defaultValue:YES];
  }
  DLog(@"RNFBCrashlyticsInit specific key %@ not set, falling back to general key %@ with default "
       @"%d if it does not exist.",
       KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, KEY_APP_DATA_COLLECTION_DEFAULT_ENABLED, YES);
  return [RNFBSharedUtils getConfigBooleanValue:@"RNFBCrashlyticsInit"
                                            key:KEY_APP_DATA_COLLECTION_DEFAULT_ENABLED
                                   defaultValue:YES];
}

+ (BOOL)isErrorGenerationOnJSCrashEnabled {
  return
      [RNFBSharedUtils getConfigBooleanValue:@"RNFBCrashlyticsInit"
                                         key:KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED
                                defaultValue:YES];
}

+ (BOOL)isCrashlyticsJavascriptExceptionHandlerChainingEnabled {
  return [RNFBSharedUtils
      getConfigBooleanValue:@"RNFBCrashlyticsInit"
                        key:KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED
               defaultValue:YES];
}

+ (NSArray<FIRComponent *> *)componentsToRegister {
  return @[];
}

/*
 * configureWithApp is automatically invoked by Firebase as this app is a registered FIRLibrary with
 * the SDK.
 *
 * At this point "configure" has already been called on the FIRApp instance. This behavior is meant
 * to mirror what is done in ReactNativeFirebaseCrashlyticsInitProvider.java
 *
 * This pattern may not be supported long term
 * https://github.com/firebase/firebase-ios-sdk/issues/2933
 */
+ (void)configureWithApp:(FIRApp *)app {
  // This setting is sticky. setCrashlyticsCollectionEnabled persists the setting to disk until it
  // is explicitly set otherwise or the app is deleted. Jump to the setCrashlyticsCollectionEnabled
  // definition to see implementation details.
  [[FIRCrashlytics crashlytics]
      setCrashlyticsCollectionEnabled:self.isCrashlyticsCollectionEnabled];
  DLog(@"RNFBCrashlyticsInit initialization successful");
}

@end
