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
#import "RNFBMLVisionImageLabelerModule.h"
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionImageLabelerModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

RCT_EXPORT_METHOD(imageLabelerProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)imageLabelerOptions
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

    FIRVisionOnDeviceImageLabelerOptions *options = [[FIRVisionOnDeviceImageLabelerOptions alloc] init];

    if (imageLabelerOptions[@"confidenceThreshold"]) {
      options.confidenceThreshold = [imageLabelerOptions[@"confidenceThreshold"] floatValue];
    }

    FIRVisionImageLabeler *labeler = [vision onDeviceImageLabelerWithOptions:options];
    [labeler processImage:visionImage completion:^(NSArray<FIRVisionImageLabel *> *_Nullable labels, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      if (labels == nil) {
        resolve(@[]);
        return;
      }

      resolve([self getLabelList:labels]);
    }];
  }];
}

RCT_EXPORT_METHOD(cloudImageLabelerProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)cloudImageLabelerOptions
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

    FIRVisionCloudImageLabelerOptions *options = [[FIRVisionCloudImageLabelerOptions alloc] init];

    if (cloudImageLabelerOptions[@"confidenceThreshold"]) {
      options.confidenceThreshold = [cloudImageLabelerOptions[@"confidenceThreshold"] floatValue];
    }

    if (cloudImageLabelerOptions[@"apiKeyOverride"]) {
      options.APIKeyOverride = cloudImageLabelerOptions[@"apiKeyOverride"];
    }

    FIRVisionImageLabeler *labeler = [vision cloudImageLabelerWithOptions:options];
    [labeler processImage:visionImage completion:^(NSArray<FIRVisionImageLabel *> *_Nullable labels, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      if (labels == nil) {
        resolve(@[]);
        return;
      }

      resolve([self getLabelList:labels]);
    }];
  }];
}

- (NSArray *)getLabelList:(NSArray<FIRVisionImageLabel *> *)labels {
  NSMutableArray *labelListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionImageLabel *label in labels) {
    NSMutableDictionary *formattedLabel = [[NSMutableDictionary alloc] init];

    formattedLabel[@"text"] = label.text;
    formattedLabel[@"entityId"] = label.entityID;
    formattedLabel[@"confidence"] = label.confidence;

    [labelListFormatted addObject:formattedLabel];
  }

  return labelListFormatted;
}

@end
