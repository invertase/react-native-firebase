/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Mirrors Firebase Analytics `kFIRParameter*` and `FIRConsentType*` /
 * `FIRConsentStatus*` string values used by
 * `RNFBAnalyticsJavascriptParamsCleaner` and
 * `RNFBAnalyticsConsentSettingsMapper` so Foundation-only tests can
 * assert key/status parity without linking FirebaseAnalytics.
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

typedef NSString *FIRConsentType;
typedef NSString *FIRConsentStatus;

static FIRConsentType const FIRConsentTypeAdStorage = @"ad_storage";
static FIRConsentType const FIRConsentTypeAnalyticsStorage = @"analytics_storage";
static FIRConsentType const FIRConsentTypeAdUserData = @"ad_user_data";
static FIRConsentType const FIRConsentTypeAdPersonalization = @"ad_personalization";
static FIRConsentStatus const FIRConsentStatusDenied = @"denied";
static FIRConsentStatus const FIRConsentStatusGranted = @"granted";
