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

#import "RNFBCrashlyticsModule.h"
#import "RNFBCrashlyticsInitProvider.h"
#import "RCTConvert.h"
#import "RNFBPreferences.h"

@implementation RNFBCrashlyticsModule
#pragma mark -
#pragma mark Module Setup

  RCT_EXPORT_MODULE();

  - (NSDictionary *)constantsToExport {
    NSMutableDictionary *constants = [NSMutableDictionary new];
    constants[@"isCrashlyticsCollectionEnabled"] = @([RCTConvert BOOL:@([RNFBCrashlyticsInitProvider isCrashlyticsCollectionEnabled])]);
    return constants;
  }

  + (BOOL)requiresMainQueueSetup {
    return NO;
  }

#pragma mark -
#pragma mark Firebase Crashlytics Methods

  RCT_EXPORT_METHOD(setCrashlyticsCollectionEnabled:
    (BOOL) enabled) {
    [[RNFBPreferences shared] setBooleanValue:@"crashlytics_auto_collection_enabled" boolValue:enabled];
  }

@end
