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

import Foundation
import XCTest

final class RNFBPerfHttpMethodMapperTests: XCTestCase {
  /// `FIRHTTPMethodGET`
  private let getMethod = 0
  /// `FIRHTTPMethodPUT`
  private let putMethod = 1
  /// `FIRHTTPMethodPOST`
  private let postMethod = 2
  /// `FIRHTTPMethodDELETE`
  private let deleteMethod = 3
  /// `FIRHTTPMethodHEAD`
  private let headMethod = 4
  /// `FIRHTTPMethodPATCH`
  private let patchMethod = 5
  /// `FIRHTTPMethodOPTIONS`
  private let optionsMethod = 6
  /// `FIRHTTPMethodTRACE`
  private let traceMethod = 7
  /// `FIRHTTPMethodCONNECT`
  private let connectMethod = 8

  func testPutMapsToPut() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "put"), putMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "PUT"), putMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "Put"), putMethod)
  }

  func testPostMapsToPost() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "post"), postMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "POST"), postMethod)
  }

  func testHeadMapsToHead() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "head"), headMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "HEAD"), headMethod)
  }

  func testTraceMapsToTrace() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "trace"), traceMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "TRACE"), traceMethod)
  }

  func testPatchMapsToPatch() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "patch"), patchMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "PATCH"), patchMethod)
  }

  func testDeleteMapsToDelete() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "delete"), deleteMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "DELETE"), deleteMethod)
  }

  func testOptionsMapsToOptions() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "options"), optionsMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "OPTIONS"), optionsMethod)
  }

  func testConnectMapsToConnect() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "connect"), connectMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "CONNECT"), connectMethod)
  }

  func testGetAndUnknownDefaultToGet() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "get"), getMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "GET"), getMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "bogus"), getMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: "unknown"), getMethod)
  }

  func testNilAndEmptyDefaultToGet() {
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: nil), getMethod)
    XCTAssertEqual(RNFBPerfHttpMethodMapper.httpMethodRawValue(forString: ""), getMethod)
  }
}
