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

#import <Firebase/Firebase.h>
#import <Foundation/Foundation.h>
// clang-format off
// React headers must be imported before any RNFBApp header: under
// use_frameworks!, RNFBApp's framework module absorbs the React headers its
// public headers include, hiding their declarations and macros from this file
// if the RNFBApp module is loaded first.
#import <React/RCTBridgeModule.h>
// clang-format on
#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBFirestoreCommon.h"
#import "RNFBFirestoreSerialize.h"

@interface RNFBFirestoreDocumentModule : NSObject <RCTBridgeModule>

@end
