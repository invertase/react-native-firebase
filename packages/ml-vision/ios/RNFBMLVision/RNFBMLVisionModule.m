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

// TODO do this for optional vision deps
#if __has_include(<FirebaseMLNLLanguageID/FIRLanguageIdentificationOptions.h>)

#import <React/RCTUtils.h>
#import "RNFBSharedUtils.h"
#import "RNFBMLVisionModule.h"

#define DEPENDENCY_EXISTS=1
#endif


@implementation RNFBMLVisionModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

#ifdef DEPENDENCY_EXISTS

// TODO react methods here

#endif

@end
