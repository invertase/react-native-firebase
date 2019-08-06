//
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
#import "RNFBMLVisionDocumentTextRecognizerModule.h"
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionDocumentTextRecognizerModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

RCT_EXPORT_METHOD(cloudDocumentTextRecognizerProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)cloudDocumentTextRecognizerOptions
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  [RNFBMLVisionCommon UIImageForFilePath:filePath completion:^(NSArray *errorCodeMessageArray, UIImage *image) {
    if (errorCodeMessageArray != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
          @"code": errorCodeMessageArray[0],
          @"message": errorCodeMessageArray[1],
      }];
      return;
    }

    FIRVisionImage *visionImage = [[FIRVisionImage alloc] initWithImage:image];
    FIRVision *vision = [FIRVision visionForApp:firebaseApp];

    FIRVisionCloudDocumentTextRecognizerOptions *options = [[FIRVisionCloudDocumentTextRecognizerOptions alloc] init];

    if (cloudDocumentTextRecognizerOptions[@"hintedLanguages"]) {
      options.languageHints = cloudDocumentTextRecognizerOptions[@"hintedLanguages"];
    }

    FIRVisionDocumentTextRecognizer *textRecognizer = [vision cloudDocumentTextRecognizerWithOptions:options];
    [textRecognizer processImage:visionImage completion:^(FIRVisionDocumentText *_Nullable result, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      if (result == nil) {
        resolve(@{
            @"text": @"",
            @"blocks": @[],
        });
        return;
      }

      resolve(@{
          @"text": result.text,
          @"blocks": [self getVisionDocumentTextBlocksList:result.blocks],
      });
    }];
  }];
}

- (NSArray *)getVisionDocumentTextBlocksList:(NSArray<FIRVisionDocumentTextBlock *> *)blocks {
  NSMutableArray *documentTextBlocksFormattedList = [[NSMutableArray alloc] init];

  for (FIRVisionDocumentTextBlock *block in blocks) {
    NSMutableDictionary *documentTextBlockFormatted = [[NSMutableDictionary alloc] init];

    documentTextBlockFormatted[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:block.frame];
    documentTextBlockFormatted[@"text"] = block.text;
    documentTextBlockFormatted[@"confidence"] = block.confidence;
    documentTextBlockFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:block.recognizedLanguages];
    documentTextBlockFormatted[@"recognizedBreak"] = [self getRecognizedBreakMap:block.recognizedBreak];
    documentTextBlockFormatted[@"paragraphs"] = [self getParagraphsList:block.paragraphs];

    [documentTextBlocksFormattedList addObject:documentTextBlockFormatted];
  }

  return documentTextBlocksFormattedList;
}

- (NSArray *)getLanguageCodesList:(NSArray<FIRVisionTextRecognizedLanguage *> *)languages {
  NSMutableArray *languageCodes = [[NSMutableArray alloc] init];

  for (FIRVisionTextRecognizedLanguage *language in languages) {
    [languageCodes addObject:language.languageCode];
  }

  return languageCodes;
}

- (NSDictionary *)getRecognizedBreakMap:(FIRVisionTextRecognizedBreak *_Nullable)blockBreak {
  if (blockBreak == nil) {
    return (id) [NSNull null];
  }
  NSMutableDictionary *recognizedBreakFormatted = [[NSMutableDictionary alloc] init];
  recognizedBreakFormatted[@"breakType"] = @(blockBreak.type);
  recognizedBreakFormatted[@"isPrefix"] = @(blockBreak.isPrefix);
  return recognizedBreakFormatted;
}

- (NSArray *)getParagraphsList:(NSArray <FIRVisionDocumentTextParagraph *> *)paragraphs {
  NSMutableArray *paragraphListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionDocumentTextParagraph *paragraph in paragraphs) {
    NSMutableDictionary *paragraphFormatted = [[NSMutableDictionary alloc] init];

    paragraphFormatted[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:paragraph.frame];
    paragraphFormatted[@"text"] = paragraph.text;
    paragraphFormatted[@"confidence"] = paragraph.confidence;
    paragraphFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:paragraph.recognizedLanguages];
    paragraphFormatted[@"recognizedBreak"] = [self getRecognizedBreakMap:paragraph.recognizedBreak];
    paragraphFormatted[@"words"] = [self getWordsList:paragraph.words];

    [paragraphListFormatted addObject:paragraphFormatted];
  }

  return paragraphListFormatted;
}

- (NSArray *)getWordsList:(NSArray <FIRVisionDocumentTextWord *> *)words {
  NSMutableArray *wordListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionDocumentTextWord *word in words) {
    NSMutableDictionary *wordFormatted = [[NSMutableDictionary alloc] init];

    wordFormatted[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:word.frame];
    wordFormatted[@"text"] = word.text;
    wordFormatted[@"confidence"] = word.confidence;
    wordFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:word.recognizedLanguages];
    wordFormatted[@"recognizedBreak"] = [self getRecognizedBreakMap:word.recognizedBreak];
    wordFormatted[@"symbols"] = [self getSymbolList:word.symbols];

    [wordListFormatted addObject:wordFormatted];
  }

  return wordListFormatted;
}

- (NSArray *)getSymbolList:(NSArray <FIRVisionDocumentTextSymbol *> *)symbols {
  NSMutableArray *symbolListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionDocumentTextSymbol *symbol in symbols) {
    NSMutableDictionary *symbolFormatted = [[NSMutableDictionary alloc] init];

    symbolFormatted[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:symbol.frame];
    symbolFormatted[@"text"] = symbol.text;
    symbolFormatted[@"confidence"] = symbol.confidence;
    symbolFormatted[@"recognizedLanguages"] = [self getLanguageCodesList:symbol.recognizedLanguages];
    symbolFormatted[@"recognizedBreak"] = [self getRecognizedBreakMap:symbol.recognizedBreak];

    [symbolListFormatted addObject:symbolFormatted];
  }

  return symbolListFormatted;
}

@end
