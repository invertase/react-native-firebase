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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Keeps the native one-shot get away from the app's keepSynced, by location.
 *
 * <p>When Query.get() misses the cache, it turns keepSynced on and then off for the location's
 * default spec. Turning it off removes every keepSynced registration at the location, whatever its
 * query, without unlistening, which cancels the app's keepSynced there (firebase-android-sdk#8433).
 * So a location with anything kept synced is read with once(), and a keepSynced call on a location
 * waits for the native gets in flight there.
 */
final class RNFBDatabaseKeepSyncedRegistry {
  // Keys of the queries kept synced, by location.
  private final Map<String, Set<String>> keptSynced = new HashMap<>();
  // Native gets in flight, by location.
  private final Map<String, Integer> nativeGets = new HashMap<>();
  // keepSynced calls waiting for those gets, in call order, by location.
  private final Map<String, List<Runnable>> deferred = new HashMap<>();

  /**
   * Records keepSynced for the query with this key at the location, and runs {@code apply} (the SDK
   * call) now, or after the location's native gets complete. A native get only starts while nothing
   * at the location is kept synced, so the SDK has no keepSynced there in the meantime.
   */
  synchronized void keepSynced(String location, String queryKey, boolean enabled, Runnable apply) {
    Set<String> queryKeys = keptSynced.get(location);
    if (enabled) {
      if (queryKeys == null) {
        queryKeys = new HashSet<>();
        keptSynced.put(location, queryKeys);
      }
      queryKeys.add(queryKey);
    } else if (queryKeys != null) {
      queryKeys.remove(queryKey);
      if (queryKeys.isEmpty()) {
        keptSynced.remove(location);
      }
    }

    if (!nativeGets.containsKey(location)) {
      apply.run();
      return;
    }
    List<Runnable> waiting = deferred.get(location);
    if (waiting == null) {
      waiting = new ArrayList<>();
      deferred.put(location, waiting);
    }
    waiting.add(apply);
  }

  /** Counts a native get on the location, or returns false if anything there is kept synced. */
  synchronized boolean beginNativeGet(String location) {
    if (keptSynced.containsKey(location)) {
      return false;
    }
    Integer inFlight = nativeGets.get(location);
    nativeGets.put(location, inFlight == null ? 1 : inFlight + 1);
    return true;
  }

  /**
   * Ends a native get. After the location's last one, runs the keepSynced calls that waited for it,
   * in call order.
   */
  synchronized void endNativeGet(String location) {
    int inFlight = nativeGets.get(location) - 1;
    if (inFlight > 0) {
      nativeGets.put(location, inFlight);
      return;
    }
    nativeGets.remove(location);
    List<Runnable> waiting = deferred.remove(location);
    if (waiting != null) {
      for (Runnable apply : waiting) {
        apply.run();
      }
    }
  }
}
