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

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRDatabase`/`FIRDatabaseReference` for the main database module. This
// keeps `RNFBDatabaseModule.mm` free of Firebase Database imports, which is
// required because `FirebaseDatabase` is a Swift-only SPM product and
// `@import` for Swift-only products is unusable from Objective-C++ (.mm)
// files when C++ modules are disabled (required by React Native's JSI
// headers).
@interface RNFBDatabaseModuleHelper : NSObject

+ (void)goOnline:(NSString *)app dbURL:(NSString *)dbURL;

+ (void)goOffline:(NSString *)app dbURL:(NSString *)dbURL;

+ (void)useEmulator:(NSString *)app
              dbURL:(NSString *)dbURL
               host:(NSString *)host
               port:(NSInteger)port;

@end
