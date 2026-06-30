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
#import "RNFBAppTurboModules.h"
#import "RNFBUtilsModule.h"

@interface RNFBUtilsModule () <NativeRNFBTurboUtilsSpec>
@end

@implementation RNFBUtilsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboUtils)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboUtilsSpecJSI>(params);
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Constants

- (NSString *)getPathForDirectory:(int)directory {
  NSArray *paths =
      NSSearchPathForDirectoriesInDomains((NSSearchPathDirectory)directory, NSUserDomainMask, YES);
  return [paths firstObject];
}

- (NSDictionary *)utilsConstantsDictionary {
  return @{
    @"isRunningInTestLab" : @NO,
    @"MAIN_BUNDLE" : [[NSBundle mainBundle] bundlePath],
    @"CACHES_DIRECTORY" : [self getPathForDirectory:NSCachesDirectory],
    @"DOCUMENT_DIRECTORY" : [self getPathForDirectory:NSDocumentDirectory],
    @"PICTURES_DIRECTORY" : [self getPathForDirectory:NSPicturesDirectory],
    @"MOVIES_DIRECTORY" : [self getPathForDirectory:NSMoviesDirectory],
    @"TEMP_DIRECTORY" : NSTemporaryDirectory(),
    @"LIBRARY_DIRECTORY" : [self getPathForDirectory:NSLibraryDirectory],
  };
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants::Builder>)
    constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self utilsConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

#pragma mark -
#pragma mark Android-only stubs

- (void)androidGetPlayServicesStatus:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  resolve(@{
    @"isAvailable" : @YES,
    @"status" : @0,
    @"hasResolution" : @NO,
    @"isUserResolvableError" : @NO,
  });
}

- (void)androidPromptForPlayServices:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  resolve(nil);
}

- (void)androidResolutionForPlayServices:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  resolve(nil);
}

- (void)androidMakePlayServicesAvailable:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  resolve(nil);
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
    NSArray *queryItems = components.queryItems;
    NSString *assetId = [self valueForKey:@"id" fromQueryItems:queryItems];
    asset = [[PHAsset fetchAssetsWithLocalIdentifiers:@[ assetId ] options:nil] firstObject];
  }

  return asset;
}

@end
