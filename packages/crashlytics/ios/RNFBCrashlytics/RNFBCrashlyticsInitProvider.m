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
#import <FirebaseCoreExtension/FIRAppInternal.h>
#import <FirebaseCoreExtension/FIRComponent.h>
#import <FirebaseCoreExtension/FIRComponentContainer.h>
#import <FirebaseCoreExtension/FIRComponentType.h>
#import <FirebaseCoreExtension/FIRLibrary.h>
#import <FirebaseCrashlytics/FIRCrashlytics.h>
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

/// Empty protocol to register this provider as a component with Core.
@protocol RNFBCrashlyticsInitProviderProtocol
@end

/// The name of the Crashlytics component in FirebaseCore's component system. Reference:
// https://github.com/firebase/firebase-ios-sdk/blob/main/Crashlytics/Crashlytics/FIRCrashlytics.m#L87-L89
@protocol FIRCrashlyticsInstanceProvider <NSObject>
@end

/// Privately conform to the protocol for component registration.
@interface RNFBCrashlyticsInitProvider () <RNFBCrashlyticsInitProviderProtocol, FIRLibrary>
@end

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
  // Goal: enable or disable crashlytics logging based on firebase.json settings at app startup
  //
  // Problem: We need a correctly instantiated Crashlytics component in order to configure it
  //
  // Solution:
  // 1) put the desired startup logic that requires Crashlytics dependency in deferrable block...
  FIRComponentCreationBlock creationBlock =
      ^id _Nullable(FIRComponentContainer *container, BOOL *isCacheable) {
    if (!container.app.isDefaultApp) {
      return nil;
    }

    // Ensure it's cached so it returns the same instance every time messaging is called.
    *isCacheable = YES;

    // 2) ... ask the SDK component system to get a correctly running dependency...
    // Note: This is a FIRCrashlytics *, directly cast it later for practical use, reference:
    // https://github.com/firebase/firebase-ios-sdk/blob/main/Crashlytics/Crashlytics/FIRCrashlytics.m#L282-L284
    id<FIRCrashlyticsInstanceProvider> crashlytics =
        FIR_COMPONENT(FIRCrashlyticsInstanceProvider, container);

    // This setting is sticky. setCrashlyticsCollectionEnabled persists the setting to disk until it
    // is explicitly set otherwise or the app is deleted. Jump to the
    // setCrashlyticsCollectionEnabled definition to see implementation details.
    [(FIRCrashlytics *)crashlytics
        setCrashlyticsCollectionEnabled:self.isCrashlyticsCollectionEnabled];

    // For testing: filter for this in logs to make sure this block executes via
    // xcrun simctl spawn booted log stream --level debug --style compact |grep RNFBCrashlyticsInit
    DLog(@"RNFBCrashlyticsInit initialization successful");
    return nil;
  };

  // 3) ...finally: register startup block to run w/Crashlytics dependency when ready
  FIRComponent *crashlyticsInitProvider =
      [FIRComponent componentWithProtocol:@protocol(RNFBCrashlyticsInitProviderProtocol)
                      instantiationTiming:FIRInstantiationTimingEagerInDefaultApp
                             dependencies:@[]  // note this will go away in firebase-ios-sdk v11+
                            creationBlock:creationBlock];

  return @[ crashlyticsInitProvider ];
}

@end
