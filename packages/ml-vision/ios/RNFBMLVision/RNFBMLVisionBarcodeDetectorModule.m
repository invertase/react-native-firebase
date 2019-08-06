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
#import <RNFBApp/RNFBSharedUtils.h>
#import "RNFBMLVisionBarcodeDetectorModule.h"
#import "RNFBMLVisionCommon.h"

@implementation RNFBMLVisionBarcodeDetectorModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase ML Kit Vision Methods

RCT_EXPORT_METHOD(barcodeDetectorProcessImage:
  (FIRApp *) firebaseApp
    : (NSString *)filePath
    : (NSDictionary *)barcodeDetectorOptions
    : (RCTPromiseResolveBlock)resolve
    : (RCTPromiseRejectBlock)reject
) {
  [RNFBMLVisionCommon UIImageForFilePath:filePath completion:^(NSArray *errorCodeMessageArray, UIImage *image) {
    if (errorCodeMessageArray != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
          @"code": errorCodeMessageArray[0],
          @"message": errorCodeMessageArray[1],
      }];
      return;
    }

    FIRVisionImage *visionImage = [[FIRVisionImage alloc] initWithImage:image];
    FIRVision *vision = [FIRVision visionForApp:firebaseApp];

    FIRVisionBarcodeDetectorOptions *options = [[FIRVisionBarcodeDetectorOptions alloc] initWithFormats:FIRVisionBarcodeFormatQRCode | FIRVisionBarcodeFormatAztec];

    FIRVisionBarcodeDetector *barcodeDetector = [vision barcodeDetectorWithOptions:options];
    [barcodeDetector detectInImage:visionImage completion:^(NSArray<FIRVisionBarcode *> *barcodes, NSError *error) {
      if (error != nil) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
            @"code": @"unknown",
            @"message": [error localizedDescription],
        }];
        return;
      }

      if (barcodes == nil) {
        resolve(@[]);
        return;
      }

      resolve([self getBarcodesList:barcodes]);
    }];
  }];
}

- (NSArray *)getBarcodesList:(NSArray<FIRVisionBarcode *> *)barcodes {
  NSMutableArray *barcodeListFormatted = [[NSMutableArray alloc] init];

  for (FIRVisionBarcode *barcode in barcodes) {
    NSMutableDictionary *formattedBarcode = [[NSMutableDictionary alloc] init];

    formattedBarcode[@"boundingBox"] = [RNFBMLVisionCommon rectToIntArray:barcode.frame];
    formattedBarcode[@"cornerPoints"] = [RNFBMLVisionCommon visionPointsToArray:barcode.cornerPoints];
    formattedBarcode[@"format"] = @(barcode.format);
    formattedBarcode[@"valueType"] = @(barcode.valueType);
    formattedBarcode[@"displayValue"] = barcode.displayValue;
    formattedBarcode[@"rawValue"] = barcode.rawValue;

    if (barcode.email != nil) formattedBarcode[@"email"] = [self getEmailMap:barcode.email];
    if (barcode.phone != nil) formattedBarcode[@"phone"] = [self getPhoneMap:barcode.phone];
    if (barcode.sms != nil) formattedBarcode[@"sms"] = [self getSMSMap:barcode.sms];
    if (barcode.URL != nil) formattedBarcode[@"url"] = [self getURLMap:barcode.URL];
    if (barcode.wifi != nil) formattedBarcode[@"wifi"] = [self getWiFiMap:barcode.wifi];
    if (barcode.geoPoint != nil) formattedBarcode[@"geoPoint"] = [self getGeoPointList:barcode.geoPoint];
    if (barcode.contactInfo != nil) formattedBarcode[@"contactInfo"] = [self getContactInfoMap:barcode.contactInfo];
    if (barcode.calendarEvent != nil) formattedBarcode[@"calendarEvent"] = [self getCalendarEventMap:barcode.calendarEvent];
    if (barcode.driverLicense != nil) formattedBarcode[@"driverLicense"] = [self getDriverLicenseMap:barcode.driverLicense];

    [barcodeListFormatted addObject:formattedBarcode];
  }

  return barcodeListFormatted;
}

- (NSDictionary *)getEmailMap:(FIRVisionBarcodeEmail *)email {
  return @{
      @"address": email.address,
      @"body": email.body,
      @"subject": email.subject,
  };
}

- (NSDictionary *)getPhoneMap:(FIRVisionBarcodePhone *)phone {
  return @{
      @"number": phone.number,
      @"type": @(phone.type),
  };
}

- (NSDictionary *)getSMSMap:(FIRVisionBarcodeSMS *)sms {
  return @{
      @"message": sms.message,
      @"phoneNumber": sms.phoneNumber,
  };
}

- (NSDictionary *)getURLMap:(FIRVisionBarcodeURLBookmark *)url {
  return @{
      @"title": url.title,
      @"url": url.url,
  };
}

- (NSDictionary *)getWiFiMap:(FIRVisionBarcodeWiFi *)wifi {
  return @{
      @"encryptionType": @(wifi.type),
      @"password": wifi.password,
      @"ssid": wifi.ssid,
  };
}

- (NSArray *)getGeoPointList:(FIRVisionBarcodeGeoPoint *)geoPoint {
  return @[@(geoPoint.latitude), @(geoPoint.longitude)];
}

- (NSDictionary *)getPersonNameMap:(FIRVisionBarcodePersonName *)name {
  return @{
      @"first": name.first,
      @"formatted": name.formattedName,
      @"last": name.last,
      @"middle": name.middle,
      @"prefix": name.prefix,
      @"pronunciation": name.pronounciation,
      @"suffix": name.suffix,
  };
}

- (NSDictionary *)getAddressMap:(FIRVisionBarcodeAddress *)address {
  return @{
      @"lines": address.addressLines,
      @"type": @(address.type),
  };
}

- (NSDictionary *)getContactInfoMap:(FIRVisionBarcodeContactInfo *)contactInfo {
  NSMutableDictionary *contactInfoFormatted = [@{
      @"title": contactInfo.jobTitle,
      @"organisation": contactInfo.organization,
  } mutableCopy];

  // Name
  if (contactInfo.name != nil) {
    contactInfoFormatted[@"name"] = [self getPersonNameMap:contactInfo.name];
  }

  // URLs
  NSMutableArray *urls = [@[] mutableCopy];
  if (contactInfo.urls != nil) {
    for (NSString *url in contactInfo.urls) {
      [urls addObject:url];
    }
  }
  contactInfoFormatted[@"urls"] = urls;

  // Phones
  NSMutableArray *phones = [@[] mutableCopy];
  if (contactInfo.phones != nil) {
    for (FIRVisionBarcodePhone *phone in contactInfo.phones) {
      [phones addObject:[self getPhoneMap:phone]];
    }
  }
  contactInfoFormatted[@"phones"] = phones;

  // Emails
  NSMutableArray *emails = [@[] mutableCopy];
  if (contactInfo.emails != nil) {
    for (FIRVisionBarcodeEmail *email in contactInfo.emails) {
      [emails addObject:[self getEmailMap:email]];
    }
  }
  contactInfoFormatted[@"emails"] = phones;

  // Addresses
  NSMutableArray *addresses = [@[] mutableCopy];
  if (contactInfo.addresses != nil) {
    for (FIRVisionBarcodeAddress *address in contactInfo.addresses) {
      [emails addObject:[self getAddressMap:address]];
    }
  }
  contactInfoFormatted[@"addresses"] = addresses;

  return contactInfoFormatted;
}

- (NSDictionary *)getCalendarEventMap:(FIRVisionBarcodeCalendarEvent *)event {
  return @{
      @"description": event.description,
      @"end": [RNFBSharedUtils getISO8601String:event.end],
      @"location": event.location,
      @"organizer": event.organizer,
      @"start": [RNFBSharedUtils getISO8601String:event.start],
      @"status": event.status,
      @"summary": event.summary,
  };
}

- (NSDictionary *)getDriverLicenseMap:(FIRVisionBarcodeDriverLicense *)license {
  return @{
      @"addressCity": license.addressCity,
      @"addressState": license.addressState,
      @"addressZip": license.addressZip,
      @"birthDate": license.birthDate,
      @"documentType": license.documentType,
      @"expiryDate": license.expiryDate,
      @"firstName": license.firstName,
      @"gender": license.gender,
      @"issueDate": license.issuingDate,
      @"issuingCountry": license.issuingCountry,
      @"lastName": license.lastName,
      @"licenseNumber": license.licenseNumber,
      @"middleName": license.middleName,
  };
}

@end
