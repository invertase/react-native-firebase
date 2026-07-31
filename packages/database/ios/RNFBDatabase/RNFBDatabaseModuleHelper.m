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
#else
@import FirebaseCore;
@import FirebaseDatabaseInternal;
#endif

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseModuleHelper.h"

static __strong NSMutableDictionary *emulatorSettings;

@implementation RNFBDatabaseModuleHelper

+ (void)goOnline:(NSString *)app dbURL:(NSString *)dbURL {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOnline];
}

+ (void)goOffline:(NSString *)app dbURL:(NSString *)dbURL {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOffline];
}

+ (void)useEmulator:(NSString *)app
              dbURL:(NSString *)dbURL
               host:(NSString *)host
               port:(NSInteger)port {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  if (emulatorSettings == nil) {
    emulatorSettings = [NSMutableDictionary dictionary];
  }

  NSMutableString *configKey = [firebaseApp.name mutableCopy];
  if (dbURL != nil && dbURL.length > 0) {
    [configKey appendString:dbURL];
  }

  if (!emulatorSettings[configKey]) {
    [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] useEmulatorWithHost:host
                                                                                   port:port];
    emulatorSettings[configKey] = @YES;
  }
}

@end
