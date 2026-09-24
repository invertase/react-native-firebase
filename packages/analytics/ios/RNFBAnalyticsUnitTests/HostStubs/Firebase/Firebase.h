/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Mirrors Firebase Analytics `kFIRParameter*` string values used by
 * `RNFBAnalyticsJavascriptParamsCleaner` so Foundation-only tests can
 * assert key parity without linking FirebaseAnalytics.
 */
#import <Foundation/Foundation.h>

static NSString *const kFIRParameterQuantity = @"quantity";
static NSString *const kFIRParameterIndex = @"index";
static NSString *const kFIRParameterLevel = @"level";
static NSString *const kFIRParameterNumberOfNights = @"number_of_nights";
static NSString *const kFIRParameterNumberOfPassengers = @"number_of_passengers";
static NSString *const kFIRParameterNumberOfRooms = @"number_of_rooms";
static NSString *const kFIRParameterScore = @"score";
static NSString *const kFIRParameterItems = @"items";
static NSString *const kFIRParameterSuccess = @"success";
static NSString *const kFIRParameterExtendSession = @"extend_session";
