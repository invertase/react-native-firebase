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

  visionFaceContourDict[@"type"] = visionFaceContour.type;

  NSMutableArray *pointsFormatted = [[NSMutableArray alloc] init];
  for (FIRVisionPoint *point in visionFaceContour.points) {
    [pointsFormatted addObject:[self visionPointArray:point]];
  }

  visionFaceContourDict[@"points"] = pointsFormatted;

  return visionFaceContourDict;
}

+ (NSArray *)visionPointArray:(FIRVisionPoint *)point {
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
