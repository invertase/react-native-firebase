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


#if __has_include(<FirebaseMLNLLanguageID/FIRLanguageIdentificationOptions.h>)

#import <React/RCTUtils.h>
#import "RNFBSharedUtils.h"
#import "RNFBMLNaturalLanguageIdModule.h"

#define DEPENDENCY_EXISTS=1
#endif


@implementation RNFBMLNaturalLanguageIdModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Mlkit Language Id Methods

#ifdef DEPENDENCY_EXISTS

RCT_EXPORT_METHOD(identifyLanguage:
  (FIRApp *) firebaseApp
    : (NSString *)text
    : (FIRLanguageIdentificationOptions *)identificationOptions
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRNaturalLanguage *nL = [FIRNaturalLanguage naturalLanguageForApp:firebaseApp];
  FIRLanguageIdentification *languageId = [nL languageIdentificationWithOptions:identificationOptions];
  FIRIdentifyLanguageCallback completion = ^(NSString *_Nullable languageCode, NSError *_Nullable error) {
    if (error != nil) {
      [self promiseRejectMLKitException:reject error:error];
    } else {
      resolve(languageCode);
    }
  };
  [languageId identifyLanguageForText:text completion:completion];
}

RCT_EXPORT_METHOD(identifyPossibleLanguages:
  (FIRApp *) firebaseApp
    : (NSString *)text
    : (FIRLanguageIdentificationOptions *)identificationOptions
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRNaturalLanguage *nL = [FIRNaturalLanguage naturalLanguageForApp:firebaseApp];
  FIRLanguageIdentification *languageId = [nL languageIdentificationWithOptions:identificationOptions];
  FIRIdentifyPossibleLanguagesCallback completion = ^(NSArray<FIRIdentifiedLanguage *> *identifiedLanguages, NSError *error) {
    if (error != nil) {
      [self promiseRejectMLKitException:reject error:error];
    } else {
      NSMutableArray *languages = [[NSMutableArray alloc] initWithCapacity:identifiedLanguages.count];
      for (FIRIdentifiedLanguage *identifiedLanguage in identifiedLanguages) {
        [languages addObject:@{
            @"language": identifiedLanguage.languageCode,
            @"confidence": @(identifiedLanguage.confidence)
        }];
      }
      resolve(languages);
    }
  };
  [languageId identifyPossibleLanguagesForText:text completion:completion];
}

- (void)promiseRejectMLKitException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  // TODO no way to distinguish between the error codes like Android supports
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
      @"code": @"unknown",
      @"message": [error localizedDescription],
  }];
}

#endif

@end
