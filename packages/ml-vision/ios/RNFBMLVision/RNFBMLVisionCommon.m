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


#import <React/RCTConvert.h>
#import <FirebaseMLVision/FirebaseMLVision.h>
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionCommon

+ (NSArray *)rectToIntArray:(CGRect)rect {
  CGSize size = rect.size;
  CGPoint point = rect.origin;
  return @[@(point.x), @(point.y), @(point.x + size.width), @(point.y + size.height)];
}

+ (NSDictionary *)contourToDict:(FIRVisionFaceContour *)visionFaceContour {
  NSMutableDictionary *visionFaceContourDict = [[NSMutableDictionary alloc] init];

  if (visionFaceContour == nil) {
    return visionFaceContourDict;
  }

  NSMutableArray *pointsFormatted = [[NSMutableArray alloc] init];
  for (FIRVisionPoint *point in visionFaceContour.points) {
    [pointsFormatted addObject:[self arrayForFIRVisionPoint:point]];
  }

  visionFaceContourDict[@"type"] = [self contourTypeToInt:visionFaceContour.type];
  visionFaceContourDict[@"points"] = pointsFormatted;

  return visionFaceContourDict;
}

+ (NSNumber *)contourTypeToInt:(NSString *)faceContourType {
  if ([@"All" isEqualToString:faceContourType]) {
    return @1;
  }
  if ([@"Face" isEqualToString:faceContourType]) {
    return @2;
  }
  if ([@"LeftEyebrowTop" isEqualToString:faceContourType]) {
    return @3;
  }
  if ([@"LeftEyebrowBottom" isEqualToString:faceContourType]) {
    return @4;
  }
  if ([@"RightEyebrowTop" isEqualToString:faceContourType]) {
    return @5;
  }
  if ([@"RightEyebrowBottom" isEqualToString:faceContourType]) {
    return @6;
  }
  if ([@"LeftEye" isEqualToString:faceContourType]) {
    return @7;
  }
  if ([@"RightEye" isEqualToString:faceContourType]) {
    return @8;
  }
  if ([@"UpperLipTop" isEqualToString:faceContourType]) {
    return @9;
  }
  if ([@"UpperLipBottom" isEqualToString:faceContourType]) {
    return @10;
  }
  if ([@"LowerLipTop" isEqualToString:faceContourType]) {
    return @11;
  }
  if ([@"LowerLipBottom" isEqualToString:faceContourType]) {
    return @12;
  }
  if ([@"NoseBridge" isEqualToString:faceContourType]) {
    return @13;
  }
  if ([@"NoseBottom" isEqualToString:faceContourType]) {
    return @14;
  }
  return @-1;
}

+ (NSDictionary *)landmarkToDict:(FIRVisionFaceLandmark *)visionFaceLandmark {
  NSMutableDictionary *visionFaceLandmarkDict = [[NSMutableDictionary alloc] init];

  if (visionFaceLandmark == nil) {
    return visionFaceLandmarkDict;
  }

  visionFaceLandmarkDict[@"type"] = [self landmarkTypeToInt:visionFaceLandmark.type];
  visionFaceLandmarkDict[@"position"] = [self arrayForFIRVisionPoint:visionFaceLandmark.position];
  return visionFaceLandmarkDict;
}

+ (NSNumber *)landmarkTypeToInt:(NSString *)faceLandmarkType {
  if ([@"MouthBottom" isEqualToString:faceLandmarkType]) {
    return @0;
  }
  if ([@"MouthRight" isEqualToString:faceLandmarkType]) {
    return @11;
  }
  if ([@"MouthLeft" isEqualToString:faceLandmarkType]) {
    return @5;
  }
  if ([@"LeftEar" isEqualToString:faceLandmarkType]) {
    return @3;
  }
  if ([@"RightEar" isEqualToString:faceLandmarkType]) {
    return @9;
  }
  if ([@"LeftEye" isEqualToString:faceLandmarkType]) {
    return @4;
  }
  if ([@"RightEye" isEqualToString:faceLandmarkType]) {
    return @10;
  }
  if ([@"LeftCheek" isEqualToString:faceLandmarkType]) {
    return @1;
  }
  if ([@"RightCheek" isEqualToString:faceLandmarkType]) {
    return @7;
  }
  if ([@"NoseBase" isEqualToString:faceLandmarkType]) {
    return @6;
  }
  return @-1;
}

+ (NSArray *)visionPointsToArray:(NSArray <NSValue *> *_Nullable)points {
  if (points == nil) {
    return @[];
  }

  NSMutableArray *pointsArray = [[NSMutableArray alloc] init];
  for (NSValue *point in points) {
    [pointsArray addObject:[self arrayForCGPoint:point.CGPointValue]];
  }

  return pointsArray;
}

+ (NSArray *)arrayForCGPoint:(CGPoint)point {
  return @[@(point.x), @(point.y)];
}

+ (NSArray *)arrayForFIRVisionPoint:(FIRVisionPoint *)point {
  return @[point.x, point.y];
}

+ (void)UIImageForFilePath:(NSString *)localFilePath completion:(void (^)(
    NSArray *errorCodeMessageArray,
    UIImage *image
))completion {
  if (![[NSFileManager defaultManager] fileExistsAtPath:localFilePath]) {
    completion(@[@"file-not-found", @"The local file specified does not exist on the device."], nil);
  } else {
    dispatch_async(dispatch_get_main_queue(), ^{
      completion(nil, [RCTConvert UIImage:localFilePath]);
    });
  }
}

@end
