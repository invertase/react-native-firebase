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

#import <Photos/Photos.h>
#import <XCTest/XCTest.h>
#import <objc/runtime.h>

#import "RNFBAppTurboModules.h"
#import "RNFBUtilsModule.h"
#import "RNFBUtilsModuleImplementation.h"

/**
 * Exercises the shipped `RNFBUtilsModule.mm` shell, the Android-only stubs in
 * `RNFBUtilsModuleImplementation.m` and the PhotoKit category in
 * `RNFBUtilsModule+PhotoAssets.m`. All three are compiled into this target.
 */
@interface RNFBUtilsModule (ShellTesting)
- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants>)constantsToExport;
- (facebook::react::ModuleConstants<JS::NativeRNFBTurboUtils::Constants>)getConstants;
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params;
+ (BOOL)requiresMainQueueSetup;
+ (NSString *)moduleName;
- (void)androidGetPlayServicesStatus:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject;
- (void)androidPromptForPlayServices:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject;
- (void)androidResolutionForPlayServices:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject;
- (void)androidMakePlayServicesAvailable:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject;
@end

/** `PHFetchResult` stand-in whose `firstObject` is controlled by the test. */
@interface RNFBFakeFetchResult : PHFetchResult
@property(nonatomic, strong, nullable) PHAsset *stubbedFirstObject;
@end

@implementation RNFBFakeFetchResult
- (id)firstObject {
  return self.stubbedFirstObject;
}
@end

static SEL PHAssetFetchSelector(void) {
  return @selector(fetchAssetsWithLocalIdentifiers:options:);
}

@interface RNFBUtilsModuleShellTests : XCTestCase
@property(nonatomic, strong) PHAsset *fakeAsset;
@property(nonatomic, strong) NSMutableArray<NSArray<NSString *> *> *fetchedIdentifiers;
@property(nonatomic, strong) NSMutableArray<NSNumber *> *fetchedOptionsWereNil;
@property(nonatomic, assign) IMP originalFetchImplementation;
@end

@implementation RNFBUtilsModuleShellTests

#pragma mark - Module shell

- (void)testExportedModuleNameAndMainQueueSetup {
  XCTAssertEqualObjects([RNFBUtilsModule moduleName], @"NativeRNFBTurboUtils");
  XCTAssertFalse([RNFBUtilsModule requiresMainQueueSetup]);
}

- (void)testGetTurboModuleCreatesTheUtilsSpecModule {
  RNFBUtilsModule *module = [[RNFBUtilsModule alloc] init];
  facebook::react::ObjCTurboModule::InitParams params;

  auto turboModule = [module getTurboModule:params];

  XCTAssertTrue(turboModule != nullptr);
  XCTAssertTrue(std::dynamic_pointer_cast<facebook::react::NativeRNFBTurboUtilsSpecJSI>(
                    turboModule) != nullptr);
}

- (void)testConstantsToExportAndGetConstantsReturnUtilsConstants {
  RNFBUtilsModule *module = [[RNFBUtilsModule alloc] init];

  auto exported = [module constantsToExport];
  auto fetched = [module getConstants];

  for (NSDictionary *constants in @[ exported.dictionary, fetched.dictionary ]) {
    XCTAssertEqualObjects(constants[@"isRunningInTestLab"], @NO);
    XCTAssertNotNil(constants[@"MAIN_BUNDLE"]);
    XCTAssertNotNil(constants[@"TEMP_DIRECTORY"]);
    XCTAssertNotNil(constants[@"CACHES_DIRECTORY"]);
  }
  XCTAssertEqualObjects(RNFBUtilsModuleConstantsDictionary()[@"isRunningInTestLab"], @NO);
}

#pragma mark - Android-only stubs

- (void)testAndroidPlayServicesStatusReportsAvailableOnIOS {
  RNFBUtilsModule *module = [[RNFBUtilsModule alloc] init];
  __block NSDictionary *viaModule = nil;
  __block NSDictionary *viaFunction = nil;

  [module
      androidGetPlayServicesStatus:^(id result) {
        viaModule = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      }];
  RNFBUtilsModuleAndroidGetPlayServicesStatus(
      ^(id result) {
        viaFunction = result;
      },
      ^(NSString *code, NSString *message, NSError *error) {
        XCTFail(@"unexpected reject %@", message);
      });

  NSDictionary *expected = @{
    @"isAvailable" : @YES,
    @"status" : @0,
    @"hasResolution" : @NO,
    @"isUserResolvableError" : @NO,
  };
  XCTAssertEqualObjects(viaModule, expected);
  XCTAssertEqualObjects(viaFunction, expected);
}

- (void)testAndroidPromptResolutionAndMakeAvailableResolveNil {
  RNFBUtilsModule *module = [[RNFBUtilsModule alloc] init];
  RCTPromiseRejectBlock failOnReject = ^(NSString *code, NSString *message, NSError *error) {
    XCTFail(@"unexpected reject %@", message);
  };
  __block NSUInteger resolveCount = 0;
  __block BOOL sawNonNil = NO;
  RCTPromiseResolveBlock countNil = ^(id result) {
    resolveCount += 1;
    sawNonNil = sawNonNil || result != nil;
  };

  [module androidPromptForPlayServices:countNil reject:failOnReject];
  [module androidResolutionForPlayServices:countNil reject:failOnReject];
  [module androidMakePlayServicesAvailable:countNil reject:failOnReject];
  RNFBUtilsModuleAndroidPromptForPlayServices(countNil, failOnReject);
  RNFBUtilsModuleAndroidResolutionForPlayServices(countNil, failOnReject);
  RNFBUtilsModuleAndroidMakePlayServicesAvailable(countNil, failOnReject);

  XCTAssertEqual(resolveCount, 6);
  XCTAssertFalse(sawNonNil);
}

#pragma mark - PhotoKit category

- (void)testAssetsLibraryPathsAreUnsupportedAndNeverQueryPhotos {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:self.fakeAsset]];

  // The one-time warning is suppressed on later calls; the result stays nil and PhotoKit is never
  // consulted for the removed `assets-library://` scheme, even when an id is present.
  XCTAssertNil([RNFBUtilsModule fetchAssetForPath:@"assets-library://asset/asset.JPG?id=1"]);
  XCTAssertNil([RNFBUtilsModule fetchAssetForPath:@"assets-library://asset/asset.JPG?id=2"]);

  XCTAssertEqual(self.fetchedIdentifiers.count, 0);
}

- (void)testPhotoLibraryPathPassesEverythingAfterTheSchemeToPhotoKit {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:self.fakeAsset]];

  PHAsset *asset = [RNFBUtilsModule fetchAssetForPath:@"ph://ABC-123/L0/001"];

  XCTAssertEqual(asset, self.fakeAsset);
  XCTAssertEqualObjects(self.fetchedIdentifiers, @[ @[ @"ABC-123/L0/001" ] ]);
  XCTAssertEqual(self.fetchedOptionsWereNil.count, 1);
  XCTAssertEqualObjects(self.fetchedOptionsWereNil.firstObject, @YES);
}

- (void)testPhotoLibraryPathWithNoMatchingAssetReturnsNil {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:nil]];

  XCTAssertNil([RNFBUtilsModule fetchAssetForPath:@"ph://missing-local-identifier"]);
  XCTAssertEqualObjects(self.fetchedIdentifiers, @[ @[ @"missing-local-identifier" ] ]);
}

- (void)testPhotoLibraryPathWithNoIdentifierLooksUpTheEmptyIdentifier {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:nil]];

  XCTAssertNil([RNFBUtilsModule fetchAssetForPath:@"ph://"]);
  XCTAssertEqualObjects(self.fetchedIdentifiers, @[ @[ @"" ] ]);
}

- (void)testOtherPathsLookUpTheIdQueryItem {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:self.fakeAsset]];

  PHAsset *asset =
      [RNFBUtilsModule fetchAssetForPath:@"file:///asset.jpg?w=100&id=local-identifier&h=50"];

  XCTAssertEqual(asset, self.fakeAsset);
  XCTAssertEqualObjects(self.fetchedIdentifiers, @[ @[ @"local-identifier" ] ]);
  XCTAssertEqualObjects(self.fetchedOptionsWereNil.firstObject, @YES);
}

- (void)testOtherPathsWithNoMatchingAssetReturnNil {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:nil]];

  XCTAssertNil(
      [RNFBUtilsModule fetchAssetForPath:@"file:///asset.jpg?id=missing-local-identifier"]);
  XCTAssertEqualObjects(self.fetchedIdentifiers, @[ @[ @"missing-local-identifier" ] ]);
}

- (void)testOtherPathsWithoutAnIdQueryItemRaiseBeforeQueryingPhotos {
  [self stubPhotoLibraryReturning:[self fetchResultContaining:self.fakeAsset]];

  // Pre-port parity: a missing `id` yields a nil identifier and the `@[ assetId ]` literal
  // raises. `RNFBStorageCommon` only reaches this method for `ph://` / `assets-library://`
  // paths (`isRemoteAsset:`), so this is not reachable from the storage upload flow.
  for (NSString *path in @[ @"file:///asset.jpg", @"file:///asset.jpg?other=1", @"" ]) {
    XCTAssertThrowsSpecificNamed([RNFBUtilsModule fetchAssetForPath:path], NSException,
                                 NSInvalidArgumentException, @"%@", path);
  }
  XCTAssertEqual(self.fetchedIdentifiers.count, 0);
}

- (void)testRealPhotoLibraryReturnsNilForUnknownIdentifiers {
  // No stub: the unauthorised / empty host library resolves nothing for either lookup branch.
  XCTAssertNil([RNFBUtilsModule fetchAssetForPath:@"ph://missing-local-identifier"]);
  XCTAssertNil(
      [RNFBUtilsModule fetchAssetForPath:@"file:///asset.jpg?id=missing-local-identifier"]);
}

#pragma mark - PhotoKit stubbing

- (void)setUp {
  [super setUp];
  self.fakeAsset = (PHAsset *)class_createInstance([PHAsset class], 0);
  self.fetchedIdentifiers = [NSMutableArray array];
  self.fetchedOptionsWereNil = [NSMutableArray array];
}

- (void)tearDown {
  if (self.originalFetchImplementation != NULL) {
    Method method = class_getClassMethod([PHAsset class], PHAssetFetchSelector());
    method_setImplementation(method, self.originalFetchImplementation);
    self.originalFetchImplementation = NULL;
  }
  [super tearDown];
}

- (id)fetchResultContaining:(PHAsset *)asset {
  RNFBFakeFetchResult *result =
      (RNFBFakeFetchResult *)class_createInstance([RNFBFakeFetchResult class], 0);
  result.stubbedFirstObject = asset;
  return result;
}

/** Replaces `+[PHAsset fetchAssetsWithLocalIdentifiers:options:]`, recording each call. */
- (void)stubPhotoLibraryReturning:(id)fetchResult {
  Method method = class_getClassMethod([PHAsset class], PHAssetFetchSelector());
  self.originalFetchImplementation = method_getImplementation(method);
  __weak RNFBUtilsModuleShellTests *weakSelf = self;
  IMP stub = imp_implementationWithBlock(
      ^id(id _self, NSArray<NSString *> *identifiers, PHFetchOptions *options) {
        [weakSelf.fetchedIdentifiers addObject:identifiers];
        [weakSelf.fetchedOptionsWereNil addObject:@(options == nil)];
        return fetchResult;
      });
  method_setImplementation(method, stub);
}

@end
