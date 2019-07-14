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

import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.KEY_BOUNDING_BOX;
import static io.invertase.firebase.ml.vision.UniversalFirebaseMLVisionCommon.KEY_CORNER_POINTS;

class UniversalFirebaseMLVisionBarcodeDetectorModule extends UniversalFirebaseModule {

  public static final String KEY_FORMAT = "format";
  public static final String KEY_DISPLAY_VALUE = "displayValue";
  public static final String KEY_RAW_VALUE = "rawValue";

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
      barcodeMap.put(KEY_BOUNDING_BOX, barcode.getBoundingBox());
      barcodeMap.put(KEY_CORNER_POINTS, barcode.getCornerPoints());
      barcodeMap.put(KEY_FORMAT, barcode.getFormat());
      barcodeMap.put("valueType", barcode.getValueType());
      barcodeMap.put(KEY_DISPLAY_VALUE, barcode.getDisplayValue());
      barcodeMap.put(KEY_RAW_VALUE, barcode.getRawValue());

      // TODO calendar event
      addContactInfoFromBarcodeToMap(barcode, barcodeMap);

      detectedBarcodesFormatted.add(barcodeMap);
    }

    return detectedBarcodesFormatted;
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

    barcodeMap.put("contactInfo", contactInfoMap);
  }

  private Map<String, Object> getPersonNameMap(FirebaseVisionBarcode.PersonName personName) {
    Map<String, Object> personNameMap = new HashMap<>();
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
    Map<String, Object> emailMap = new HashMap<>();
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
