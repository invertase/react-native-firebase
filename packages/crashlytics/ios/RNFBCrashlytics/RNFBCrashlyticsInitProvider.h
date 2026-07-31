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

// This header is intentionally Firebase-free. It's imported by
// RNFBCrashlyticsModule.mm (Objective-C++), which only ever calls the three
// plain BOOL class methods below. The `<FIRLibrary>` conformance and
// `+componentsToRegister` (which needs `FIRComponent`/`FIRLibrary` from
// FirebaseCoreExtension) are declared privately in RNFBCrashlyticsInitProvider.m
// instead -- they're only invoked by Firebase's own component/DI runtime via
// reflection, never called directly by RNFB code, so they don't need to be
// visible here. This avoids `FirebaseCoreExtension/FIRLibrary.h` (whose
// `__has_include` check is unreliable under this repo's hybrid SPM+CocoaPods
// setup, since FirebaseCoreExtension is only a transitive SPM dependency and
// can't be declared as its own SPM product -- see
// okf-bundle/ios-spm-native-imports.md) ever being parsed from a `.mm` file,
// which is what previously failed with "use of '@import' when C++ modules are
// disabled".
@interface RNFBCrashlyticsInitProvider : NSObject

+ (BOOL)isCrashlyticsCollectionEnabled;

+ (BOOL)isErrorGenerationOnJSCrashEnabled;

+ (BOOL)isCrashlyticsJavascriptExceptionHandlerChainingEnabled;

@end
