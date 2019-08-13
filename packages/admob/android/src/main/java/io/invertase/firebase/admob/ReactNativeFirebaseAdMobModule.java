package io.invertase.firebase.admob;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;

import java.util.Objects;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

public class ReactNativeFirebaseAdMobModule extends ReactNativeFirebaseModule {
  private static final String SERVICE = "AdMob";

  ReactNativeFirebaseAdMobModule(ReactApplicationContext reactContext) {
    super(reactContext, SERVICE);
  }

  private RequestConfiguration buildRequestConfiguration(ReadableMap requestConfiguration) {
    RequestConfiguration.Builder builder = new RequestConfiguration.Builder();

    if (requestConfiguration.hasKey("maxAdContentRating")) {
      String rating = requestConfiguration.getString("maxAdContentRating");

      switch (Objects.requireNonNull(rating)) {
        case "G":
          builder.setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G);
          break;
        case "PG":
          builder.setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG);
          break;
        case "T":
          builder.setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_T);
          break;
        case "MA":
          builder.setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_MA);
          break;
      }
    }

    if (requestConfiguration.hasKey("tagForChildDirectedTreatment")) {
      boolean tagForChildDirectedTreatment = requestConfiguration.getBoolean("tagForChildDirectedTreatment");
      if (tagForChildDirectedTreatment) {
        builder.setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE);
      } else {
        builder.setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_FALSE);
      }
    } else {
      builder.setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_UNSPECIFIED);
    }

    if (requestConfiguration.hasKey("tagForUnderAgeOfConsent")) {
      boolean tagForUnderAgeOfConsent = requestConfiguration.getBoolean("tagForUnderAgeOfConsent");
      if (tagForUnderAgeOfConsent) {
        builder.setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE);
      } else {
        builder.setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_FALSE);
      }
    } else {
      builder.setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_UNSPECIFIED);
    }

    return builder.build();
  }

  @ReactMethod
  public void setRequestConfiguration(ReadableMap requestConfiguration, Promise promise) {
    MobileAds.setRequestConfiguration(buildRequestConfiguration(requestConfiguration));
    promise.resolve(null);
  }
}
