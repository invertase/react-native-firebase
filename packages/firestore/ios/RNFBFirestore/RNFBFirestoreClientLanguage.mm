/**
 * Copyright (c) 2025-present Invertase Limited & Contributors
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
#import <string>

namespace firebase {
namespace firestore {
namespace api {

class Firestore {
 public:
  static void SetClientLanguage(std::string language_token);
};

}  // namespace api
}  // namespace firestore
}  // namespace firebase

@interface RNFBFirestoreClientLanguage : NSObject
+ (void)setClientLanguage:(NSString *)language;
@end

@implementation RNFBFirestoreClientLanguage
+ (void)setClientLanguage:(NSString *)language {
  if (language == nil) {
    return;
  }
  std::string token = std::string([language UTF8String]);
  firebase::firestore::api::Firestore::SetClientLanguage(token);
}
@end