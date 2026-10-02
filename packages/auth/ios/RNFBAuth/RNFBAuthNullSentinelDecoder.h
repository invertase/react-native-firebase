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

/**
 * Decodes New Architecture null sentinels for updateProfile. Foundation only so unit tests can
 * compile it without the Firebase SDK.
 */
@interface RNFBAuthNullSentinelDecoder : NSObject

/**
 * Decode sentinels and turn NSNull into nil before profileChangeRequest writes.
 * FIRUserProfileChangeRequest clears a field when the property is set to nil (not the same as
 * leaving it unassigned). NSDictionary cannot store nil, so cleared keys are omitted and
 * subscript returns nil, the same value updateProfile reads.
 * displayName/photoURL null arrive as { __rnfbNull: true } and/or NSNull after decode.
 */
+ (NSDictionary *)decodedProfileProps:(NSDictionary *)props;

/**
 * photoURL clear arm: omitted/nil decoded value must become nil (not @""), not URLWithString:.
 */
+ (NSURL *)photoURLFromDecodedValue:(id)value;

@end
