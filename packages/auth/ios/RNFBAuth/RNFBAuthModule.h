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

// This header is intentionally Firebase-free. See RNFBAuthHelper.h for why:
// FirebaseAuth's core `FIRAuth`/`FIRUser` classes are implemented in Swift, so
// `@import FirebaseAuth` (the only way to get their real interface) can't be
// used from an Objective-C++ (.mm) TurboModule when C++ modules are disabled
// (required by React Native's JSI headers). All Firebase Auth calls are routed
// through RNFBAuthHelper instead. See docs/ios-spm.md and
// okf-bundle/ios-spm-native-imports.md.
#import <Foundation/Foundation.h>
#import "RNFBAuthTurboModules.h"

@interface RNFBAuthModule : NSObject <NativeRNFBTurboAuthSpec>
@end
