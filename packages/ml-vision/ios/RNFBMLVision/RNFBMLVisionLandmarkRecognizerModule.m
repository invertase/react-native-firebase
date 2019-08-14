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
#import "RNFBMLVisionLandmarkRecognizerModule.h"
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionLandmarkRecognizerModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

RCT_EXPORT_METHOD(cloudLandmarkRecognizerProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)cloudLandmarkRecognizerOptions
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

    FIRVisionCloudDetectorOptions *options = [[FIRVisionCloudDetectorOptions alloc] init];
    options.maxResults = [cloudLandmarkRecognizerOptions[@"maxResults"] unsignedIntegerValue];

    if (cloudLandmarkRecognizerOptions[@"apiKeyOverride"]) {
      options.APIKeyOverride = cloudLandmarkRecognizerOptions[@"apiKeyOverride"];
    }

    NSInteger *model = [cloudLandmarkRecognizerOptions[@"model"] pointerValue];

    if (model == (NSInteger *) 1) {
      options.modelType = FIRVisionCloudModelTypeStable;
    } else if (model == (NSInteger *) 2) {
      options.modelType = FIRVisionCloudModelTypeLatest;
    }

    FIRVisionCloudLandmarkDetector *landmarkDetector = [vision cloudLandmarkDetectorWithOptions:options];
    [landmarkDetector detectInImage:visionImage completion:^(NSArray<FIRVisionCloudLandmark *> *landmarks, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      NSMutableArray *landmarksFormatted = [[NSMutableArray alloc] init];

      for (FIRVisionCloudLandmark *landmark in landmarks) {
        NSMutableDictionary *visionLandmark = [[NSMutableDictionary alloc] init];

        visionLandmark[@"confidence"] = landmark.confidence;
        visionLandmark[@"entityId"] = landmark.entityId;
        visionLandmark[@"landmark"] = landmark.landmark;
        visionLandmark[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:landmark.frame];

        NSMutableArray *locations = [[NSMutableArray alloc] init];
        for (FIRVisionLatitudeLongitude *location in landmark.locations) {
          NSMutableArray *loc = [[NSMutableArray alloc] init];
          [loc addObject:@([location.latitude doubleValue])];
          [loc addObject:@([location.longitude doubleValue])];
          [locations addObject:loc];
        }

        visionLandmark[@"locations"] = locations;

        [landmarksFormatted addObject:visionLandmark];
      }

      resolve(landmarksFormatted);
    }];
  }];
}

@end
