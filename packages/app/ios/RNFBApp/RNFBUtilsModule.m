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

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBUtilsModule.h"

@implementation RNFBUtilsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

#pragma mark -
#pragma mark Firebase Utils Methods

+ (BOOL)isRemoteAsset:(NSString *)localFilePath {
  return [localFilePath hasPrefix:@"assets-library://"] || [localFilePath hasPrefix:@"ph://"];
}

+ (BOOL)unused_isHeic:(NSString *)localFilePath {
  return [[localFilePath pathExtension] caseInsensitiveCompare:@"heic"] == NSOrderedSame;
}

+ (NSString *)valueForKey:(NSString *)key fromQueryItems:(NSArray *)queryItems {
  NSPredicate *predicate = [NSPredicate predicateWithFormat:@"name=%@", key];
  NSURLQueryItem *queryItem = [[queryItems filteredArrayUsingPredicate:predicate] firstObject];
  return queryItem.value;
}

+ (PHAsset *)fetchAssetForPath:(NSString *)localFilePath {
  PHAsset *asset = nil;

  if ([localFilePath hasPrefix:@"assets-library://"] || [localFilePath hasPrefix:@"ph://"]) {
    if ([localFilePath hasPrefix:@"assets-library://"]) {
      NSURL *localFile = [[NSURL alloc] initWithString:localFilePath];
      if (@available(macOS 11, *) || @available(iOS 12, *)) {
        static BOOL hasWarned = NO;
        if (!hasWarned) {
          NSLog(@"'assets-library://' & 'ph://' URLs are not supported in Catalyst-based targets or iOS 12 and higher; returning nil (future warnings will be suppressed)");
          hasWarned = YES;
        }
      } else {
        #if (!TARGET_OS_MACCATALYST)
        asset = [[PHAsset fetchAssetsWithALAssetURLs:@[localFile] options:nil] firstObject];
        #endif
      }
    } else {
      NSString *assetId = [localFilePath substringFromIndex:@"ph://".length];
      asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[assetId] options:nil] firstObject];
    }
  } else {
    NSURLComponents *components = [NSURLComponents componentsWithString:localFilePath];
    NSArray *queryItems = components.queryItems;
    NSString *assetId = [self valueForKey:@"id" fromQueryItems:queryItems];
    asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[assetId] options:nil] firstObject];
  }

  return asset;
}

- (NSString *)getPathForDirectory:(int)directory {
  NSArray *paths = NSSearchPathForDirectoriesInDomains((NSSearchPathDirectory) directory, NSUserDomainMask, YES);
  return [paths firstObject];
}

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [@{
      @"MAIN_BUNDLE": [[NSBundle mainBundle] bundlePath],
      @"CACHES_DIRECTORY": [self getPathForDirectory:NSCachesDirectory],
      @"DOCUMENT_DIRECTORY": [self getPathForDirectory:NSDocumentDirectory],
      @"PICTURES_DIRECTORY": [self getPathForDirectory:NSPicturesDirectory],
      @"MOVIES_DIRECTORY": [self getPathForDirectory:NSMoviesDirectory],
      @"TEMP_DIRECTORY": NSTemporaryDirectory(),
      @"LIBRARY_DIRECTORY": [self getPathForDirectory:NSLibraryDirectory],
  } mutableCopy];

  return constants;
}

@end
