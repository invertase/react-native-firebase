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

@implementation RCTConvert (FIROptions)

+ (FIROptions *)convertRawOptions:(NSDictionary *)rawOptions {
  FIROptions *firOptions =
      [[FIROptions alloc] initWithGoogleAppID:[rawOptions valueForKey:@"appId"]
                                  GCMSenderID:[rawOptions valueForKey:@"messagingSenderId"]];
  firOptions.APIKey = [rawOptions valueForKey:@"apiKey"];
  firOptions.projectID = [rawOptions valueForKey:@"projectId"];
  firOptions.clientID = [rawOptions valueForKey:@"clientId"];
  firOptions.trackingID = [rawOptions valueForKey:@"gaTrackingId"];
  firOptions.databaseURL = [rawOptions valueForKey:@"databaseURL"];
  firOptions.storageBucket = [rawOptions valueForKey:@"storageBucket"];
  firOptions.androidClientID = [rawOptions valueForKey:@"androidClientId"];
  firOptions.deepLinkURLScheme = [rawOptions valueForKey:@"deepLinkURLScheme"];
  firOptions.bundleID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"];
  return firOptions;
}

RCT_CUSTOM_CONVERTER(FIROptions *, FIROptions, [self convertRawOptions:[self NSDictionary:json]]);
@end
