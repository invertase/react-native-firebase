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
#import "RNFBMLCommon.h"

@implementation RNFBMLCommon

+ (NSArray *)rectToIntArray:(CGRect)rect {
  CGSize size = rect.size;
  CGPoint point = rect.origin;
  return @[@(point.x), @(point.y), @(point.x + size.width), @(point.y + size.height)];
}

+ (NSArray *)pointsToArray:(NSArray <NSValue *> *_Nullable)points {
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
