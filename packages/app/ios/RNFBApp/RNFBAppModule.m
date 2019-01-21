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
#import <Firebase/Firebase.h>

#import "RNFBAppModule.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBSharedUtils.h"


@implementation RNFBAppModule

#pragma mark -
#pragma mark Statics

  static NSString *const DEFAULT_APP_DISPLAY_NAME = @"[DEFAULT]";
  static NSString *const DEFAULT_APP_NAME = @"__FIRAPP_DEFAULT";

#pragma mark -
#pragma mark Module Setup

  RCT_EXPORT_MODULE();

  - (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
  }

  - (void)setBridge:(RCTBridge *)bridge {
    [RNFBRCTEventEmitter shared].bridge = bridge;
  }

  - (RCTBridge *)bridge {
    return [RNFBRCTEventEmitter shared].bridge;
  }

#pragma mark -
#pragma mark Event Methods

  RCT_EXPORT_METHOD(addListener:
    (NSString *) eventName) {
    [[RNFBRCTEventEmitter shared] addListener:eventName];
  }

  RCT_EXPORT_METHOD(removeListeners:
    (NSInteger) count) {
    [[RNFBRCTEventEmitter shared] removeListeners:count];
  }

#pragma mark -
#pragma mark Firebase App Methods

  RCT_EXPORT_METHOD(initializeApp:
    (FIROptions *) firOptions
        appConfig:
        (NSDictionary *) appConfig
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    RCTUnsafeExecuteOnMainQueueSync(^{
      FIRApp *firApp;
      NSString *appName = [appConfig valueForKey:@"name"];

      if (!appName || [appName isEqualToString:DEFAULT_APP_DISPLAY_NAME]) {
        [FIRApp configureWithOptions:firOptions];
        firApp = [FIRApp defaultApp];

      } else {
        [FIRApp configureWithName:appName options:firOptions];
        firApp = [FIRApp appNamed:appName];
      }

      firApp.dataCollectionDefaultEnabled = (BOOL) [appConfig valueForKey:@"automaticDataCollectionEnabled"];

      resolve([RNFBSharedUtils firAppToDictionary:firApp]);
    });
  }

@end
