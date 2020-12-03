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

#import <React/RCTUtils.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBMLTextRecognizerModule.h"
#import "RNFBMLCommon.h"

@implementation RNFBMLTextRecognizerModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Methods

RCT_EXPORT_METHOD(cloudTextRecognizerProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)cloudTextRecognizerOptions
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  [RNFBMLCommon UIImageForFilePath:filePath completion:^(NSArray *errorCodeMessageArray, UIImage *image) {
    if (errorCodeMessageArray != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
          @"code": errorCodeMessageArray[0],
          @"message": errorCodeMessageArray[1],
      }];
      return;
    }

    FIRVisionImage *visionImage = [[FIRVisionImage alloc] initWithImage:image];
    FIRVision *vision = [FIRVision visionForApp:firebaseApp];

    FIRVisionCloudTextRecognizerOptions *options = [[FIRVisionCloudTextRecognizerOptions alloc] init];

    if (cloudTextRecognizerOptions[@"hintedLanguages"]) {
      options.languageHints = cloudTextRecognizerOptions[@"hintedLanguages"];
    }

    if (cloudTextRecognizerOptions[@"apiKeyOverride"]) {
      options.APIKeyOverride = cloudTextRecognizerOptions[@"apiKeyOverride"];
    }

    NSInteger *modelType = [cloudTextRecognizerOptions[@"modelType"] pointerValue];
    if (modelType == (NSInteger *) 1) {
      options.modelType = FIRVisionCloudTextModelTypeSparse;
    } else if (modelType == (NSInteger *) 2) {
      options.modelType = FIRVisionCloudTextModelTypeDense;
    }

    FIRVisionTextRecognizer *textRecognizer = [vision cloudTextRecognizerWithOptions:options];

    [textRecognizer processImage:visionImage completion:^(FIRVisionText *text, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      resolve([self getFirebaseMLTextMap:text]);
    }];
  }];
}

- (NSDictionary *)getFirebaseMLTextMap:(FIRVisionText *)text {
  NSMutableDictionary *firebaseMLTextMap = [[NSMutableDictionary alloc] init];

  firebaseMLTextMap[@"text"] = text.text;
  firebaseMLTextMap[@"blocks"] = [self getMLTextBlocksList:text.blocks];

  return firebaseMLTextMap;
}

- (NSArray *)getMLTextBlocksList:(NSArray <FIRVisionTextBlock *> *)blocks {
  NSMutableArray *blockListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionTextBlock *block in blocks) {
    NSMutableDictionary *textBlockFormatted = [[NSMutableDictionary alloc] init];

    textBlockFormatted[@"text"] = block.text;
    textBlockFormatted[@"confidence"] = block.confidence;
    textBlockFormatted[@"boundingBox"] = [RNFBMLCommon rectToIntArray:block.frame];
    textBlockFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:block.recognizedLanguages];
    textBlockFormatted[@"cornerPoints"] = [RNFBMLCommon pointsToArray:block.cornerPoints];
    textBlockFormatted[@"lines"] = [self getLinesList:block.lines];

    [blockListFormatted addObject:textBlockFormatted];
  }

  return blockListFormatted;
}

- (NSArray *)getLinesList:(NSArray <FIRVisionTextLine *> *)lines {
  NSMutableArray *lineListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionTextLine *line in lines) {
    NSMutableDictionary *lineFormatted = [[NSMutableDictionary alloc] init];

    lineFormatted[@"boundingBox"] = [RNFBMLCommon rectToIntArray:line.frame];
    lineFormatted[@"text"] = line.text;
    lineFormatted[@"confidence"] = line.confidence;
    lineFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:line.recognizedLanguages];
    lineFormatted[@"cornerPoints"] = [RNFBMLCommon pointsToArray:line.cornerPoints];
    lineFormatted[@"elements"] = [self getElementsList:line.elements];

    [lineListFormatted addObject:lineFormatted];
  }

  return lineListFormatted;
}

- (NSArray *)getElementsList:(NSArray <FIRVisionTextElement *> *)elements {
  NSMutableArray *elementsListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionTextElement *element in elements) {
    NSMutableDictionary *elementFormatted = [[NSMutableDictionary alloc] init];

    elementFormatted[@"boundingBox"] = [RNFBMLCommon rectToIntArray:element.frame];
    elementFormatted[@"text"] = element.text;
    elementFormatted[@"confidence"] = element.confidence;
    elementFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:element.recognizedLanguages];
    elementFormatted[@"cornerPoints"] = [RNFBMLCommon pointsToArray:element.cornerPoints];

    [elementsListFormatted addObject:elementFormatted];
  }

  return elementsListFormatted;
}

- (NSArray *)getLanguageCodesList:(NSArray<FIRVisionTextRecognizedLanguage *> *)languages {
  NSMutableArray *languageCodes = [[NSMutableArray alloc] init];

  for (FIRVisionTextRecognizedLanguage *language in languages) {
    if (language.languageCode != nil) {
      [languageCodes addObject:language.languageCode];
    }
  }

  return languageCodes;
}

@end
