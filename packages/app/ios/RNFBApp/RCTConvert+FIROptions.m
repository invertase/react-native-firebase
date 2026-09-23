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

#import "RCTConvert+FIROptions.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

/**
 * Adapts `[[FIROptions alloc] initWithGoogleAppID:GCMSenderID:]` for `RCTConvertFIROptions`.
 */
@interface RNFBFIROptionsFactoryAdapter : NSObject <RNFBFIROptionsCreating>
@end

@implementation RNFBFIROptionsFactoryAdapter

- (id<RNFBFIROptionsConfiguring>)createWithGoogleAppID:(NSString *)googleAppID
                                           gcmSenderID:(NSString *)gcmSenderID {
  return (id<RNFBFIROptionsConfiguring>)[[FIROptions alloc] initWithGoogleAppID:googleAppID
                                                                    GCMSenderID:gcmSenderID];
}

@end

/**
 * Adapts mainBundle CFBundleIdentifier for `RCTConvertFIROptions`.
 */
@interface RNFBMainBundleIdentifierProvider : NSObject <RNFBBundleIdentifierProviding>
@end

@implementation RNFBMainBundleIdentifierProvider

- (NSString *)bundleIdentifier {
  return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"];
}

@end

/**
 * Empty category: live `FIROptions` already exposes the configuring properties.
 */
@interface FIROptions (RNFBFIROptionsConfiguring) <RNFBFIROptionsConfiguring>
@end

@implementation FIROptions (RNFBFIROptionsConfiguring)
@end

static id<RNFBFIROptionsCreating> RNFBFIROptionsFactory(void) {
  static RNFBFIROptionsFactoryAdapter *sharedFactory;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedFactory = [[RNFBFIROptionsFactoryAdapter alloc] init];
  });
  return sharedFactory;
}

static id<RNFBBundleIdentifierProviding> RNFBMainBundleIDProvider(void) {
  static RNFBMainBundleIdentifierProvider *sharedProvider;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedProvider = [[RNFBMainBundleIdentifierProvider alloc] init];
  });
  return sharedProvider;
}

@implementation RCTConvert (FIROptions)

+ (FIROptions *)convertRawOptions:(NSDictionary *)rawOptions {
  return (FIROptions *)[RCTConvertFIROptions convertRawOptions:rawOptions
                                                optionsFactory:RNFBFIROptionsFactory()
                                              bundleIDProvider:RNFBMainBundleIDProvider()];
}

RCT_CUSTOM_CONVERTER(FIROptions *, FIROptions, [self convertRawOptions:[self NSDictionary:json]]);
@end
