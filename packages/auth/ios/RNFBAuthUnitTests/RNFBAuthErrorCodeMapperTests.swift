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

import XCTest

final class RNFBAuthErrorCodeMapperTests: XCTestCase {
  /// Sample of known FIRAuthErrorCode raw values → JS codes.
  func testSampleKnownCodes() {
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17000),
      "invalid-custom-token"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17008),
      "invalid-email"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17020),
      "network-request-failed"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17057),
      "cancelled-popup-request"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17078),
      "multi-factor-auth-required"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17999),
      "internal-error"
    )
  }

  /// Pre-port quirk: MissingEmail (17034) maps to invalid-email, not missing-email.
  func testMissingEmailMapsToInvalidEmail() {
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17034),
      "invalid-email"
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17008),
      "invalid-email"
    )
  }

  func testUnknownCodeReturnsNil() {
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 0))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 17001))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: 99999))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: -1))
  }

  /// Sample of known FIRAuthErrorCode raw values → JS message overrides.
  func testSampleKnownMessageOverrides() {
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17000),
      "The custom token format is incorrect. Please check the documentation."
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17008),
      "The email address is badly formatted."
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17020),
      "A network error has occurred, please try again."
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17078),
      "Please complete a second factor challenge to finish signing into this account."
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17999),
      "An internal error has occurred, please try again."
    )
    XCTAssertEqual(
      RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17042),
      "The format of the phone number provided is incorrect. "
        + "Please enter the phone number in a format that can be parsed into E.164 format. "
        + "E.164 phone numbers are written in the format [+][country code][subscriber "
        + "number including area code]."
    )
  }

  func testUnknownMessageOverrideReturnsNil() {
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 0))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17001))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 17034))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: 99999))
    XCTAssertNil(RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: -1))
  }

  /// Full table — every pre-port `getJSError:` message override (coverage of switch DA).
  func testAllPrePortMessageOverrides() {
    let expected: [(Int, String)] = [
      (
        17000,
        "The custom token format is incorrect. Please check the documentation."
      ),
      (17002, "The custom token corresponds to a different audience."),
      (17004, "The supplied auth credential is malformed or has expired."),
      (17008, "The email address is badly formatted."),
      (17009, "The password is invalid or the user does not have a password."),
      (
        17024,
        "The supplied credentials do not correspond to the previously signed in user."
      ),
      (
        17014,
        "This operation is sensitive and requires recent authentication. Log in again "
          + "before retrying this request."
      ),
      (
        17078,
        "Please complete a second factor challenge to finish signing into this account."
      ),
      (
        17012,
        "An account already exists with the same email address but different sign-in "
          + "credentials. Sign in using a provider associated with this email address."
      ),
      (17007, "The email address is already in use by another account."),
      (
        17025,
        "This credential is already associated with a different user account."
      ),
      (17005, "The user account has been disabled by an administrator."),
      (
        17021,
        "The user's credential is no longer valid. The user must sign in again."
      ),
      (
        17011,
        "There is no user record corresponding to this identifier. The user may have been "
          + "deleted."
      ),
      (
        17017,
        "The user's credential is no longer valid. The user must sign in again."
      ),
      (17026, "The given password is invalid."),
      (
        17006,
        "This operation is not allowed. You must enable this service in the console."
      ),
      (17020, "A network error has occurred, please try again."),
      (17999, "An internal error has occurred, please try again."),
      (
        17042,
        "The format of the phone number provided is incorrect. "
          + "Please enter the phone number in a format that can be parsed into E.164 format. "
          + "E.164 phone numbers are written in the format [+][country code][subscriber "
          + "number including area code]."
      ),
    ]

    for (code, message) in expected {
      XCTAssertEqual(
        RNFBAuthErrorCodeMapper.jsErrorMessage(forAuthErrorCode: code),
        message,
        "FIRAuthErrorCode raw \(code) message override"
      )
    }
  }

  /// Full table — preserves every pre-port sparse-array entry (coverage of switch DA).
  func testAllPrePortMappings() {
    let expected: [(Int, String)] = [
      (17000, "invalid-custom-token"),
      (17002, "custom-token-mismatch"),
      (17004, "invalid-credential"),
      (17005, "user-disabled"),
      (17006, "operation-not-allowed"),
      (17007, "email-already-in-use"),
      (17008, "invalid-email"),
      (17009, "wrong-password"),
      (17010, "too-many-requests"),
      (17011, "user-not-found"),
      (17012, "account-exists-with-different-credential"),
      (17014, "requires-recent-login"),
      (17015, "provider-already-linked"),
      (17016, "no-such-provider"),
      (17017, "invalid-user-token"),
      (17020, "network-request-failed"),
      (17021, "user-token-expired"),
      (17023, "invalid-api-key"),
      (17024, "user-mismatch"),
      (17025, "credential-already-in-use"),
      (17026, "weak-password"),
      (17028, "app-not-authorized"),
      (17029, "expired-action-code"),
      (17030, "invalid-action-code"),
      (17031, "invalid-message-payload"),
      (17032, "invalid-sender"),
      (17033, "invalid-recipient-email"),
      (17034, "invalid-email"),
      (17036, "missing-ios-bundle-id"),
      (17037, "missing-android-pkg-name"),
      (17038, "unauthorized-domain"),
      (17039, "invalid-continue-uri"),
      (17040, "missing-continue-uri"),
      (17041, "missing-phone-number"),
      (17042, "invalid-phone-number"),
      (17043, "missing-verification-code"),
      (17044, "invalid-verification-code"),
      (17045, "missing-verification-id"),
      (17046, "invalid-verification-id"),
      (17047, "missing-app-credential"),
      (17048, "invalid-app-credential"),
      (17051, "code-expired"),
      (17052, "quota-exceeded"),
      (17053, "missing-apns-token"),
      (17054, "notification-not-forwarded"),
      (17055, "app-not-verified"),
      (17056, "captcha-check-failed"),
      (17057, "cancelled-popup-request"),
      (17058, "popup-closed-by-user"),
      (17059, "app-verification-user-interaction-failure"),
      (17060, "invalid-oauth-client-id"),
      (17061, "network-request-failed"),
      (17062, "internal-error"),
      (17067, "null-user"),
      (17995, "keychain-error"),
      (17999, "internal-error"),
      (18000, "malformed-jwt"),
      (17078, "multi-factor-auth-required"),
    ]

    for (code, js) in expected {
      XCTAssertEqual(
        RNFBAuthErrorCodeMapper.jsErrorCode(forAuthErrorCode: code),
        js,
        "FIRAuthErrorCode raw \(code)"
      )
    }
  }
}
