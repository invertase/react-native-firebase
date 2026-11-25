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
 * Reads the NSError FirebaseDatabase's getData fails with. getData reports every failure as code 1,
 * a denial and "Client is offline." alike, so only the failure reason tells them apart. Foundation
 * only so unit tests can compile it without the Firebase SDK.
 */
@interface RNFBDatabaseGetErrors : NSObject

/**
 * YES when the server rejected the read for permission: the reason is the server's text, or its
 * status (permission_denied) when it sends none. Matched as Android's PERMISSION_DENIED_REASON is.
 */
+ (BOOL)isPermissionDenied:(NSError *)error;

@end
