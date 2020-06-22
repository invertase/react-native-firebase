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
#import "RNFBMLVisionFaceDetectorModule.h"
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionFaceDetectorModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

RCT_EXPORT_METHOD(faceDetectorProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)faceDetectorOptions
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

    FIRVisionFaceDetectorOptions *options = [[FIRVisionFaceDetectorOptions alloc] init];

    NSInteger *classificationMode = [faceDetectorOptions[@"classificationMode"] integerValue];
    if (classificationMode == 1) {
      options.classificationMode = FIRVisionFaceDetectorClassificationModeNone;
    } else if (classificationMode == 2) {
      options.classificationMode = FIRVisionFaceDetectorClassificationModeAll;
    }

    NSInteger *contourMode = [faceDetectorOptions[@"contourMode"] integerValue];
    if (contourMode == 1) {
      options.contourMode = FIRVisionFaceDetectorContourModeNone;
    } else if (contourMode == 2) {
      options.contourMode = FIRVisionFaceDetectorContourModeAll;
    }

    NSInteger *landmarkMode = [faceDetectorOptions[@"landmarkMode"] integerValue];
    if (landmarkMode == 1) {
      options.landmarkMode = FIRVisionFaceDetectorLandmarkModeNone;
    } else if (landmarkMode == 2) {
      options.landmarkMode = FIRVisionFaceDetectorLandmarkModeAll;
    }

    NSInteger *performanceMode = [faceDetectorOptions[@"performanceMode"] integerValue];
    if (performanceMode == 1) {
      options.performanceMode = FIRVisionFaceDetectorPerformanceModeFast;
    } else if (performanceMode == 2) {
      options.performanceMode = FIRVisionFaceDetectorPerformanceModeAccurate;
    }
      
    options.minFaceSize = [faceDetectorOptions[@"minFaceSize"] doubleValue];

    FIRVisionFaceDetector *faceDetector = [vision faceDetectorWithOptions:options];
    [faceDetector processImage:visionImage completion:^(NSArray<FIRVisionFace *> *faces, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      NSMutableArray *facesFormatted = [[NSMutableArray alloc] init];

      for (FIRVisionFace *face in faces) {
        NSMutableDictionary *visionFace = [[NSMutableDictionary alloc] init];

        visionFace[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:face.frame];

        visionFace[@"headEulerAngleY"] = face.hasHeadEulerAngleY ? @(face.headEulerAngleY) : @(-1);
        visionFace[@"headEulerAngleZ"] = face.hasHeadEulerAngleZ ? @(face.headEulerAngleZ) : @(-1);
        visionFace[@"leftEyeOpenProbability"] = face.hasLeftEyeOpenProbability ? @(face.leftEyeOpenProbability) : @(-1);
        visionFace[@"rightEyeOpenProbability"] = face.hasRightEyeOpenProbability ? @(face.rightEyeOpenProbability) : @(-1);
        visionFace[@"smilingProbability"] = face.hasSmilingProbability ? @(face.smilingProbability) : @(-1);
        visionFace[@"trackingId"] = face.hasTrackingID ? @(face.trackingID) : @(-1);

        // Contours
        NSMutableArray *faceContours = [[NSMutableArray alloc] init];
        if (contourMode == (NSInteger *) 2) {
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeAll]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeFace]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeLeftEyebrowTop]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeLeftEyebrowBottom]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeRightEyebrowTop]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeRightEyebrowBottom]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeLeftEye]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeRightEye]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeUpperLipTop]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeUpperLipBottom]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeLowerLipTop]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeLowerLipBottom]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeNoseBridge]]];
          [faceContours addObject:[RNFBMLVisionCommon contourToDict:[face contourOfType:FIRFaceContourTypeNoseBottom]]];
        }
        visionFace[@"faceContours"] = faceContours;

        // Face Landmarks
        NSMutableArray *faceLandmarks = [[NSMutableArray alloc] init];
        if (landmarkMode == (NSInteger *) 2) {
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeMouthBottom]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeMouthRight]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeMouthLeft]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeRightEye]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeLeftEye]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeRightCheek]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeLeftCheek]]];
          [faceLandmarks addObject:[RNFBMLVisionCommon landmarkToDict:[face landmarkOfType:FIRFaceLandmarkTypeNoseBase]]];
        }
        visionFace[@"landmarks"] = faceLandmarks;

        [facesFormatted addObject:visionFace];
      }

      resolve(facesFormatted);
    }];
  }];
}

@end
