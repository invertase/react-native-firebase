package io.invertase.firebase.common;

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

public class ErrorUtils {
  /**
   * Wrap a message string with the specified service name e.g. 'Database'
   *
   * @param message
   * @param service
   * @param fullCode
   * @return
   */
  public static String getMessageWithService(String message, String service, String fullCode) {
    // Service: Error message (service/code).
    return service + ": " + message + " (" + fullCode.toLowerCase() + ").";
  }

  /**
   * Generate a service error code string e.g. 'DATABASE/PERMISSION-DENIED'
   *
   * @param service
   * @param code
   * @return
   */
  public static String getCodeWithService(String service, String code) {
    return service.toLowerCase() + "/" + code.toLowerCase();
  }
}
