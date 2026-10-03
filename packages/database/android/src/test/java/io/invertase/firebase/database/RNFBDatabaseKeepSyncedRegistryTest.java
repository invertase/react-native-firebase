package io.invertase.firebase.database;

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

public class RNFBDatabaseKeepSyncedRegistryTest {
  private static final String LOCATION = "[DEFAULT]|https://db.example.com/users/1";
  private static final String OTHER_LOCATION = "[DEFAULT]|https://db.example.com/users/2";

  private final RNFBDatabaseKeepSyncedRegistry registry = new RNFBDatabaseKeepSyncedRegistry();
  private final List<String> applied = new ArrayList<>();

  private void keepSynced(String location, String queryKey, boolean enabled) {
    registry.keepSynced(location, queryKey, enabled, () -> applied.add(queryKey + "=" + enabled));
  }

  @Test
  public void beginNativeGet_nothingKeptSynced_returnsTrue() {
    assertTrue(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void beginNativeGet_locationKeptSynced_returnsFalse() {
    keepSynced(LOCATION, "plain", true);
    assertFalse(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void beginNativeGet_queryAtLocationKeptSynced_returnsFalse() {
    keepSynced(LOCATION, "limitToLast(1)", true);
    assertFalse(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void beginNativeGet_otherLocationKeptSynced_returnsTrue() {
    keepSynced(OTHER_LOCATION, "plain", true);
    assertTrue(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void beginNativeGet_afterKeepSyncedFalse_returnsTrue() {
    keepSynced(LOCATION, "plain", true);
    keepSynced(LOCATION, "plain", false);
    assertTrue(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void beginNativeGet_untilEveryQueryAtLocationIsCleared_returnsFalse() {
    keepSynced(LOCATION, "plain", true);
    keepSynced(LOCATION, "limitToLast(1)", true);
    keepSynced(LOCATION, "plain", false);
    assertFalse(registry.beginNativeGet(LOCATION));
    keepSynced(LOCATION, "limitToLast(1)", false);
    assertTrue(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void keepSynced_noNativeGetInFlight_appliesNow() {
    keepSynced(LOCATION, "plain", true);
    assertEquals(Collections.singletonList("plain=true"), applied);
  }

  @Test
  public void keepSynced_nativeGetInFlight_waitsForItInCallOrder() {
    registry.beginNativeGet(LOCATION);
    keepSynced(LOCATION, "plain", true);
    keepSynced(LOCATION, "limitToLast(1)", true);
    keepSynced(LOCATION, "plain", false);
    assertTrue(applied.isEmpty());

    registry.endNativeGet(LOCATION);
    assertEquals(Arrays.asList("plain=true", "limitToLast(1)=true", "plain=false"), applied);
  }

  @Test
  public void keepSynced_nativeGetInFlight_makesLaterGetsUseOnce() {
    registry.beginNativeGet(LOCATION);
    keepSynced(LOCATION, "plain", true);
    assertFalse(registry.beginNativeGet(LOCATION));
  }

  @Test
  public void keepSynced_nativeGetInFlightAtOtherLocation_appliesNow() {
    registry.beginNativeGet(OTHER_LOCATION);
    keepSynced(LOCATION, "plain", true);
    assertEquals(Collections.singletonList("plain=true"), applied);
  }

  @Test
  public void endNativeGet_waitsForTheLastGetAtLocation() {
    registry.beginNativeGet(LOCATION);
    registry.beginNativeGet(LOCATION);
    keepSynced(LOCATION, "plain", true);

    registry.endNativeGet(LOCATION);
    assertTrue(applied.isEmpty());
    registry.endNativeGet(LOCATION);
    assertEquals(Collections.singletonList("plain=true"), applied);

    keepSynced(LOCATION, "plain", false);
    assertEquals(Arrays.asList("plain=true", "plain=false"), applied);
  }
}
