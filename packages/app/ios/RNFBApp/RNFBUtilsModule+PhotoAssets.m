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
 */

#import <Photos/Photos.h>

#import "RNFBUtilsModule.h"

@implementation RNFBUtilsModule (PhotoAssets)

+ (PHAsset *)fetchAssetForPath:(NSString *)localFilePath {
  PHAsset *asset = nil;

  if ([localFilePath hasPrefix:@"assets-library://"] || [localFilePath hasPrefix:@"ph://"]) {
    if ([localFilePath hasPrefix:@"assets-library://"]) {
      static BOOL hasWarned = NO;
      if (!hasWarned) {
        NSLog(@"'assets-library://' & 'ph://' URLs are not supported in Catalyst-based targets "
              @"or iOS 12 and higher; returning nil (future warnings will be suppressed)");
        hasWarned = YES;
      }
    } else {
      NSString *assetId = [localFilePath substringFromIndex:@"ph://".length];
      asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[ assetId ] options:nil] firstObject];
    }
  } else {
    NSURLComponents *components = [NSURLComponents componentsWithString:localFilePath];
    NSString *assetId = [self valueForKey:@"id" fromQueryItems:components.queryItems];
    asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[ assetId ] options:nil] firstObject];
  }

  return asset;
}

@end
