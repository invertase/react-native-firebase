/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Mirrors Firebase Analytics `kFIRParameter*` / `FIRConsentType*` /
 * `FIRConsentStatus*` string values and enough of `FIRAnalytics` for
 * compiling `RNFBAnalyticsHelper.m` without linking the real SDK.
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

@interface FIRAnalytics : NSObject

+ (void)logEventWithName:(NSString *)name
              parameters:(nullable NSDictionary<NSString *, id> *)parameters;
+ (void)setAnalyticsCollectionEnabled:(BOOL)enabled;
+ (void)setUserID:(nullable NSString *)userID;
+ (void)setUserPropertyString:(nullable NSString *)value forName:(NSString *)name;
+ (void)resetAnalyticsData;
+ (void)setSessionTimeoutInterval:(NSTimeInterval)sessionTimeoutInterval;
+ (nullable NSString *)appInstanceID;
+ (void)sessionIDWithCompletion:(void (^)(int64_t sessionID, NSError *_Nullable error))completion;
+ (void)setDefaultEventParameters:(nullable NSDictionary<NSString *, id> *)parameters;
+ (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress;
+ (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSData *)hashedEmailAddress;
+ (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber;
+ (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSData *)hashedPhoneNumber;
+ (void)setConsent:(NSDictionary<FIRConsentType, FIRConsentStatus> *)consentSettings;

/** Test seams */
@property(class, nonatomic, copy, nullable) NSString *lastLogEventName;
@property(class, nonatomic, copy, nullable) NSDictionary *lastLogEventParameters;
@property(class, nonatomic, assign) BOOL analyticsCollectionEnabledValue;
@property(class, nonatomic, copy, nullable) NSString *userIDValue;
@property(class, nonatomic, copy, nullable) NSMutableDictionary *userProperties;
@property(class, nonatomic, assign) NSUInteger resetAnalyticsDataCallCount;
@property(class, nonatomic, assign) NSTimeInterval sessionTimeoutIntervalValue;
@property(class, nonatomic, copy, nullable) NSString *appInstanceIDValue;
@property(class, nonatomic, assign) int64_t sessionIDCompletionValue;
@property(class, nonatomic, copy, nullable) NSError *sessionIDCompletionError;
@property(class, nonatomic, assign) BOOL sessionIDCompletionDeferred;
@property(class, nonatomic, copy, nullable) NSDictionary *lastDefaultEventParameters;
@property(class, nonatomic, copy, nullable) NSString *lastConversionEmail;
@property(class, nonatomic, copy, nullable) NSData *lastHashedEmail;
@property(class, nonatomic, copy, nullable) NSString *lastConversionPhone;
@property(class, nonatomic, copy, nullable) NSData *lastHashedPhone;
@property(class, nonatomic, copy, nullable) NSDictionary *lastConsent;
@property(class, nonatomic, assign) BOOL shouldThrowOnNextCall;

+ (void)resetTestState;
+ (void)flushDeferredSessionIDCompletion;

@end
