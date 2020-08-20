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

#import "RCTConvert+FIRLanguageIdentificationOptions.h"

@implementation RCTConvert (FIRApp)
#if __has_include(<FirebaseMLNLLanguageID/FIRLanguageIdentificationOptions.h>)

+ (FIRLanguageIdentificationOptions *)firLanguageIdOptionsFromDict:(NSDictionary *)options {
  if (options[@"confidenceThreshold"] == nil) {
    if (options[@"multipleLanguages"] != nil) {
      return [[FIRLanguageIdentificationOptions alloc] initWithConfidenceThreshold:FIRDefaultIdentifyPossibleLanguagesConfidenceThreshold];
    } else {
      return [[FIRLanguageIdentificationOptions alloc] initWithConfidenceThreshold:FIRDefaultIdentifyLanguageConfidenceThreshold];
    }
  }

  float confidenceThreshold = [options[@"confidenceThreshold"] floatValue];
  return [[FIRLanguageIdentificationOptions alloc] initWithConfidenceThreshold:confidenceThreshold];
}

RCT_CUSTOM_CONVERTER(FIRLanguageIdentificationOptions *, FIRLanguageIdentificationOptions, [self firLanguageIdOptionsFromDict:[self NSDictionary:json]]);
#endif
@end
