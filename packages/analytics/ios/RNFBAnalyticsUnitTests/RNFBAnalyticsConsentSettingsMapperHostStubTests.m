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

#import <XCTest/XCTest.h>

#import <Firebase/Firebase.h>

#if __has_include("RNFBAnalyticsJavascriptParamsCleaner-Swift.inc")
#import "RNFBAnalyticsJavascriptParamsCleaner-Swift.inc"
#elif __has_include("RNFBAnalyticsUnitTests-Swift.h")
#import "RNFBAnalyticsUnitTests-Swift.h"
#else
#error "RNFBAnalyticsConsentSettingsMapper Swift interface not found"
#endif

@interface RNFBAnalyticsConsentSettingsMapperHostStubTests : XCTestCase
@end

@implementation RNFBAnalyticsConsentSettingsMapperHostStubTests

- (void)testConsentConstants_matchHostStubFirebaseConstants {
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentTypeAnalyticsStorageValue,
                        FIRConsentTypeAnalyticsStorage);
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentTypeAdStorageValue,
                        FIRConsentTypeAdStorage);
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentTypeAdUserDataValue,
                        FIRConsentTypeAdUserData);
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentTypeAdPersonalizationValue,
                        FIRConsentTypeAdPersonalization);
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentStatusGrantedValue,
                        FIRConsentStatusGranted);
  XCTAssertEqualObjects(RNFBAnalyticsConsentSettingsMapper.consentStatusDeniedValue,
                        FIRConsentStatusDenied);
}

- (void)testConsentDictionary_usesHostStubConsentTypeAndStatusKeys {
  NSDictionary *consent = [RNFBAnalyticsConsentSettingsMapper consentDictionaryFromSettings:@{
    @"analytics_storage" : @YES,
    @"ad_storage" : @NO,
    @"ad_user_data" : @YES,
    @"ad_personalization" : @NO,
  }];
  XCTAssertEqualObjects(consent[FIRConsentTypeAnalyticsStorage], FIRConsentStatusGranted);
  XCTAssertEqualObjects(consent[FIRConsentTypeAdStorage], FIRConsentStatusDenied);
  XCTAssertEqualObjects(consent[FIRConsentTypeAdUserData], FIRConsentStatusGranted);
  XCTAssertEqualObjects(consent[FIRConsentTypeAdPersonalization], FIRConsentStatusDenied);
}

@end
