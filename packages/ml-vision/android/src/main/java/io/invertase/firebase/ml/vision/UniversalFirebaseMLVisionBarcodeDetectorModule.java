package io.invertase.firebase.ml.vision;

/*
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


import android.content.Context;
import android.os.Bundle;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.ml.vision.FirebaseVision;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcode;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetector;
import com.google.firebase.ml.vision.barcode.FirebaseVisionBarcodeDetectorOptions;
import com.google.firebase.ml.vision.common.FirebaseVisionImage;
import io.invertase.firebase.common.SharedUtils;
import io.invertase.firebase.common.UniversalFirebaseModule;

import java.util.*;

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.*;

@SuppressWarnings("ConstantConditions")
class UniversalFirebaseMLVisionBarcodeDetectorModule extends UniversalFirebaseModule {

  UniversalFirebaseMLVisionBarcodeDetectorModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<List<Map<String, Object>>> barcodeDetectorProcessImage(String appName, String stringUri, Bundle barcodeDetectorOptions) {
    return Tasks.call(getExecutor(), () -> {
      FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
      FirebaseVisionBarcodeDetectorOptions options = getBarcodeDetectorOptions(barcodeDetectorOptions);

      FirebaseVisionBarcodeDetector visionBarcodeDetector = FirebaseVision.getInstance(firebaseApp)
        .getVisionBarcodeDetector(options);

      FirebaseVisionImage image = FirebaseVisionImage.fromFilePath(
        getContext(),
        SharedUtils.getUri(stringUri)
      );

      List<FirebaseVisionBarcode> detectedBarcodesRaw = Tasks.await(visionBarcodeDetector.detectInImage(image));

      return getBarcodesList(detectedBarcodesRaw);
    });
  }

  private List<Map<String, Object>> getBarcodesList(List<FirebaseVisionBarcode> detectedBarcodesRaw) {
    List<Map<String, Object>> detectedBarcodesFormatted = new ArrayList<>(detectedBarcodesRaw.size());

    for (FirebaseVisionBarcode barcode : detectedBarcodesRaw) {
      Map<String, Object> barcodeMap = new HashMap<>();
      barcodeMap.put(KEY_BOUNDING_BOX, SharedUtils.rectToIntArray(barcode.getBoundingBox()));
      barcodeMap.put(KEY_CORNER_POINTS, SharedUtils.pointsToIntsList(barcode.getCornerPoints()));
      barcodeMap.put(KEY_FORMAT, barcode.getFormat());
      barcodeMap.put(KEY_VALUE_TYPE, barcode.getValueType());
      barcodeMap.put(KEY_DISPLAY_VALUE, barcode.getDisplayValue());
      barcodeMap.put(KEY_RAW_VALUE, barcode.getRawValue());

      // `calendarEvent`
      addCalendarEventFromBarcodeToMap(barcode, barcodeMap);

      // `contactInfo`
      addContactInfoFromBarcodeToMap(barcode, barcodeMap);

      // driverLicense
      addDriverLicenseFromBarcodeToMap(barcode, barcodeMap);

      // email
      addEmailFromBarcodeToMap(barcode, barcodeMap);

      // geoPoint
      addGeoPointFromBarcodeToMap(barcode, barcodeMap);

      // phone
      addPhoneFromBarcodeToMap(barcode, barcodeMap);

      // sms
      addSmsFromBarcodeToMap(barcode, barcodeMap);

      // url
      addUrlFromBarcodeToMap(barcode, barcodeMap);

      // wifi
      addWifiFromBarcodeToMap(barcode, barcodeMap);

      detectedBarcodesFormatted.add(barcodeMap);
    }

    return detectedBarcodesFormatted;
  }

  private void addDriverLicenseFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getDriverLicense() == null) return;
    Map<String, Object> driverLicenseMap = new HashMap<>();
    FirebaseVisionBarcode.DriverLicense driverLicense = barcode.getDriverLicense();
    driverLicenseMap.put("addressCity", driverLicense.getAddressCity());
    driverLicenseMap.put("addressState", driverLicense.getAddressState());
    driverLicenseMap.put("addressStreet", driverLicense.getAddressStreet());
    driverLicenseMap.put("addressZip", driverLicense.getAddressZip());
    driverLicenseMap.put("birthDate", driverLicense.getBirthDate());
    driverLicenseMap.put("documentType", driverLicense.getDocumentType());
    driverLicenseMap.put("expiryDate", driverLicense.getExpiryDate());
    driverLicenseMap.put("firstName", driverLicense.getFirstName());
    driverLicenseMap.put("gender", driverLicense.getGender());
    driverLicenseMap.put("issueDate", driverLicense.getIssueDate());
    driverLicenseMap.put("issuingCountry", driverLicense.getIssuingCountry());
    driverLicenseMap.put("lastName", driverLicense.getLastName());
    driverLicenseMap.put("licenseNumber", driverLicense.getLicenseNumber());
    driverLicenseMap.put("middleName", driverLicense.getMiddleName());
    barcodeMap.put("driverLicense", driverLicenseMap);
  }

  private void addGeoPointFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getGeoPoint() == null) return;
    List<Double> latLng = new ArrayList<>(2);
    FirebaseVisionBarcode.GeoPoint geoPoint = barcode.getGeoPoint();
    latLng.add(geoPoint.getLat());
    latLng.add(geoPoint.getLng());
    barcodeMap.put(KEY_GEO_POINT, latLng);
  }

  private void addSmsFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getSms() == null) return;
    Map<String, Object> smsMap = new HashMap<>();
    FirebaseVisionBarcode.Sms sms = barcode.getSms();
    smsMap.put("message", sms.getMessage());
    smsMap.put("phoneNumber", sms.getPhoneNumber());
    barcodeMap.put(KEY_SMS, smsMap);
  }

  private void addUrlFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getUrl() == null) return;
    Map<String, Object> urlMap = new HashMap<>();
    FirebaseVisionBarcode.UrlBookmark url = barcode.getUrl();
    urlMap.put("title", url.getTitle());
    urlMap.put("url", url.getUrl());
    barcodeMap.put(KEY_URL, urlMap);
  }

  private void addWifiFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getWifi() == null) return;
    Map<String, Object> wifiMap = new HashMap<>();
    FirebaseVisionBarcode.WiFi wiFi = barcode.getWifi();
    wifiMap.put("encryptionType", wiFi.getEncryptionType());
    wifiMap.put("password", wiFi.getPassword());
    wifiMap.put("ssid", wiFi.getSsid());
    barcodeMap.put(KEY_WIFI, wifiMap);
  }

  private void addEmailFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getEmail() == null) return;
    barcodeMap.put(KEY_EMAIL, getEmailMap(barcode.getEmail()));
  }

  private void addPhoneFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getPhone() == null) return;
    barcodeMap.put(KEY_PHONE, getPhoneMap(barcode.getPhone()));
  }

  private void addCalendarEventFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getCalendarEvent() == null) return;
    Map<String, Object> calendarEventMap = new HashMap<>();
    FirebaseVisionBarcode.CalendarEvent calendarEvent = barcode.getCalendarEvent();
    calendarEventMap.put("description", calendarEvent.getDescription());
    calendarEventMap.put("end", calendarEvent.getEnd().getRawValue());
    calendarEventMap.put("location", calendarEvent.getLocation());
    calendarEventMap.put("organizer", calendarEvent.getOrganizer());
    calendarEventMap.put("start", calendarEvent.getStart().getRawValue());
    calendarEventMap.put("status", calendarEvent.getStatus());
    calendarEventMap.put("summary", calendarEvent.getSummary());
    barcodeMap.put(KEY_CALENDAR_EVENT, calendarEventMap);
  }

  private void addContactInfoFromBarcodeToMap(FirebaseVisionBarcode barcode, Map<String, Object> barcodeMap) {
    if (barcode.getContactInfo() == null) return;
    FirebaseVisionBarcode.ContactInfo contactInfo = barcode.getContactInfo();
    Map<String, Object> contactInfoMap = new HashMap<>();

    contactInfoMap.put("title", contactInfo.getTitle());
    contactInfoMap.put("organization", contactInfo.getOrganization());
    if (contactInfo.getUrls() == null) {
      contactInfoMap.put("urls", new String[]{});
    } else {
      contactInfoMap.put("urls", contactInfo.getUrls());
    }

    // phones
    List<FirebaseVisionBarcode.Phone> phonesListRaw = contactInfo.getPhones();
    List<Map<String, Object>> phonesListFormatted = new ArrayList<>(phonesListRaw.size());
    for (FirebaseVisionBarcode.Phone phone : phonesListRaw) {
      phonesListFormatted.add(getPhoneMap(phone));
    }
    contactInfoMap.put("phones", phonesListFormatted);

    // emails
    List<FirebaseVisionBarcode.Email> emailsListRaw = contactInfo.getEmails();
    List<Map<String, Object>> emailsListFormatted = new ArrayList<>(emailsListRaw.size());
    for (FirebaseVisionBarcode.Email email : emailsListRaw) {
      emailsListFormatted.add(getEmailMap(email));
    }
    contactInfoMap.put("emails", emailsListFormatted);

    // person name
    contactInfoMap.put("name", getPersonNameMap(contactInfo.getName()));

    // addresses
    List<FirebaseVisionBarcode.Address> addressListRaw = contactInfo.getAddresses();
    List<Map<String, Object>> addressListFormatted = new ArrayList<>(addressListRaw.size());
    for (FirebaseVisionBarcode.Address email : addressListRaw) {
      addressListFormatted.add(getAddressMap(email));
    }
    contactInfoMap.put("addresses", addressListFormatted);

    barcodeMap.put(KEY_CONTACT_INFO, contactInfoMap);
  }

  private Map<String, Object> getAddressMap(FirebaseVisionBarcode.Address address) {
    Map<String, Object> addressMap = new HashMap<>();
    addressMap.put("lines", address.getAddressLines());
    addressMap.put("type", address.getType());
    return addressMap;
  }

  private Map<String, Object> getPersonNameMap(FirebaseVisionBarcode.PersonName personName) {
    Map<String, Object> personNameMap = new HashMap<>(7);
    personNameMap.put("first", personName.getFirst());
    personNameMap.put("formatted", personName.getFormattedName());
    personNameMap.put("last", personName.getLast());
    personNameMap.put("middle", personName.getMiddle());
    personNameMap.put("prefix", personName.getPrefix());
    personNameMap.put("pronunciation", personName.getPronunciation());
    personNameMap.put("suffix", personName.getSuffix());
    return personNameMap;
  }

  private Map<String, Object> getEmailMap(FirebaseVisionBarcode.Email email) {
    Map<String, Object> emailMap = new HashMap<>(3);
    emailMap.put("address", email.getAddress());
    emailMap.put("body", email.getBody());
    emailMap.put("subject", email.getSubject());
    return emailMap;
  }

  private Map<String, Object> getPhoneMap(FirebaseVisionBarcode.Phone phone) {
    Map<String, Object> phoneMap = new HashMap<>();
    phoneMap.put("number", phone.getNumber());
    phoneMap.put("type", phone.getType());
    return phoneMap;
  }

  private FirebaseVisionBarcodeDetectorOptions getBarcodeDetectorOptions(Bundle barcodeDetectorOptionsBundle) {
    FirebaseVisionBarcodeDetectorOptions.Builder builder = new FirebaseVisionBarcodeDetectorOptions.Builder();

    int[] formats = barcodeDetectorOptionsBundle.getIntArray("barcodeFormats");
    if (formats == null) return builder.build();

    if (formats.length == 1) {
      builder.setBarcodeFormats(formats[0]);
    } else if (formats.length > 1) {
      builder.setBarcodeFormats(formats[0], Arrays.copyOfRange(formats, 1, formats.length));
    }

    return builder.build();
  }
}
