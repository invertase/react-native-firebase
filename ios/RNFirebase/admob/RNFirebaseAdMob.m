#import "RNFirebaseAdMob.h"

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import "RNFirebaseAdMobInterstitial.h"
#import "RNFirebaseAdMobRewardedVideo.h"

NSString *MALE = @"male";
NSString *FEMALE = @"female";
NSString *UNKNOWN = @"unknown";

@implementation RNFirebaseAdMob
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _interstitials = [[NSMutableDictionary alloc] init];
        _rewardedVideos = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(initialize:
    (NSString *) appId) {
    [GADMobileAds configureWithApplicationID:appId];
}

RCT_EXPORT_METHOD(openDebugMenu:
    (NSString *) appId) {
    GADDebugOptionsViewController *debugOptionsViewController = [GADDebugOptionsViewController debugOptionsViewControllerWithAdUnitID:appId];
    UIWindow *window = [UIApplication sharedApplication].keyWindow;

    [[window rootViewController] presentViewController:debugOptionsViewController animated:YES completion:nil];
}

RCT_EXPORT_METHOD(interstitialLoadAd:
    (NSString *) adUnit
            request:
            (NSDictionary *) request) {
    RNFirebaseAdMobInterstitial *interstitial = [self getOrCreateInterstitial:adUnit];
    [interstitial loadAd:request];
}

RCT_EXPORT_METHOD(interstitialShowAd:
    (NSString *) adUnit) {
    RNFirebaseAdMobInterstitial *interstitial = [self getOrCreateInterstitial:adUnit];
    [interstitial show];
}

RCT_EXPORT_METHOD(rewardedVideoLoadAd:
    (NSString *) adUnit
            request:
            (NSDictionary *) request) {
    RNFirebaseAdMobRewardedVideo *rewardedVideo = [self getOrCreateRewardedVideo:adUnit];
    [rewardedVideo loadAd:request];
}

RCT_EXPORT_METHOD(rewardedVideoSetCustomData:
    (NSString *) adUnit
            customData:
            (NSString *) customData) {
    RNFirebaseAdMobRewardedVideo *rewardedVideo = [self getOrCreateRewardedVideo:adUnit];
    [rewardedVideo setCustomData:customData];
}

RCT_EXPORT_METHOD(rewardedVideoShowAd:
    (NSString *) adUnit) {
    RNFirebaseAdMobRewardedVideo *rewardedVideo = [self getOrCreateRewardedVideo:adUnit];
    [rewardedVideo show];
}

RCT_EXPORT_METHOD(clearInterstitial:
    (NSString *) adUnit) {
    if (_interstitials[adUnit]) [_interstitials removeObjectForKey:adUnit];
}

- (RNFirebaseAdMobInterstitial *)getOrCreateInterstitial:(NSString *)adUnit {
    if (_interstitials[adUnit]) {
        return _interstitials[adUnit];
    }

    _interstitials[adUnit] = [[RNFirebaseAdMobInterstitial alloc] initWithProps:adUnit delegate:self];
    return _interstitials[adUnit];
}

- (RNFirebaseAdMobRewardedVideo *)getOrCreateRewardedVideo:(NSString *)adUnit {
    if (_rewardedVideos[adUnit]) {
        return _rewardedVideos[adUnit];
    }

    _rewardedVideos[adUnit] = [[RNFirebaseAdMobRewardedVideo alloc] initWithProps:adUnit delegate:self];
    return _rewardedVideos[adUnit];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ADMOB_INTERSTITIAL_EVENT, ADMOB_REWARDED_VIDEO_EVENT];
}

+ (GADRequest *)buildRequest:(NSDictionary *)request {
    GADRequest *builder = [GADRequest request];

    if (request[@"tagForChildDirectedTreatment"]) [builder tagForChildDirectedTreatment:(BOOL) request[@"tagForChildDirectedTreatment"]];
    if (request[@"contentUrl"]) builder.contentURL = request[@"contentUrl"];
    if (request[@"requestAgent"]) builder.requestAgent = request[@"requestAgent"];
    if (request[@"keywords"]) builder.keywords = request[@"keywords"];

    if (request[@"testDevices"]) {
        NSArray *devices = request[@"testDevices"];
        NSMutableArray *testDevices = [[NSMutableArray alloc] init];

        for (id device in devices) {
            if ([device isEqual:@"DEVICE_ID_EMULATOR"]) {
                [testDevices addObject:kGADSimulatorID];
            } else {
                [testDevices addObject:device];
            }
        }

        builder.testDevices = testDevices;
    }

    if (request[@"gender"]) {
        NSString *gender = [request[@"gender"] stringValue];

        if (gender == MALE) {
            builder.gender = kGADGenderMale;
        } else if (gender == FEMALE) {
            builder.gender = kGADGenderFemale;
        } else if (gender == UNKNOWN) {
            builder.gender = kGADGenderUnknown;
        }
    }

    return builder;
}

+ (GADVideoOptions *)buildVideoOptions:(NSDictionary *)options {
    GADVideoOptions *builder = [[GADVideoOptions alloc] init];
    builder.startMuted = (BOOL) options[@"startMuted"];
    return builder;
}

+ (NSDictionary *)errorCodeToDictionary:(NSError *)error {
    NSString *code;
    NSString *message;

    switch (error.code) {
        default:
        case kGADErrorServerError:
        case kGADErrorInternalError:
        case kGADErrorInvalidArgument:
        case kGADErrorMediationDataError:
        case kGADErrorMediationAdapterError:
            code = @"admob/error-code-internal-error ";
            message = @"Something happened internally; for instance, an invalid response was received from the ad server.";
            break;
        case kGADErrorMediationInvalidAdSize:
            code = @"admob/error-code-invalid-request";
            message = @"The ad requested has an invalid size.";
            break;
        case kGADErrorInvalidRequest:
        case kGADErrorReceivedInvalidResponse:
            code = @"admob/error-code-invalid-request";
            message = @"The ad request was invalid; for instance, the ad unit ID was incorrect.";
            break;
        case kGADErrorNoFill:
        case kGADErrorMediationNoFill:
            code = @"admob/error-code-no-fill";
            message = @"The ad request was successful, but no ad was returned due to lack of ad inventory.";
            break;
        case kGADErrorNetworkError:
            code = @"admob/error-code-network-error";
            message = @"The ad request was unsuccessful due to network connectivity.";
            break;
        case kGADErrorOSVersionTooLow:
            code = @"admob/os-version-too-low";
            message = @"The current device’s OS is below the minimum required version.";
            break;
    }

    return @{
            @"code": code,
            @"message": message,
    };
}

+ (GADAdSize)stringToAdSize:(NSString *)value {
    NSError *error = nil;
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"([0-9]+)x([0-9]+)" options:0 error:&error];
    NSArray *matches = [regex matchesInString:value options:0 range:NSMakeRange(0, [value length])];

    for (NSTextCheckingResult *match in matches) {
        NSString *matchText = [value substringWithRange:[match range]];
        if (matchText) {
            NSArray *values = [matchText componentsSeparatedByString:@"x"];
            CGFloat width = (CGFloat) [values[0] intValue];
            CGFloat height = (CGFloat) [values[1] intValue];
            return GADAdSizeFromCGSize(CGSizeMake(width, height));
        }
    }

    value = [value uppercaseString];

    if ([value isEqualToString:@"BANNER"]) {
        return kGADAdSizeBanner;
    } else if ([value isEqualToString:@"LARGE_BANNER"]) {
        return kGADAdSizeLargeBanner;
    } else if ([value isEqualToString:@"MEDIUM_RECTANGLE"]) {
        return kGADAdSizeMediumRectangle;
    } else if ([value isEqualToString:@"FULL_BANNER"]) {
        return kGADAdSizeFullBanner;
    } else if ([value isEqualToString:@"LEADERBOARD"]) {
        return kGADAdSizeLeaderboard;
    } else if ([value isEqualToString:@"SMART_BANNER"]) {
        return kGADAdSizeSmartBannerPortrait;
    } else if ([value isEqualToString:@"SMART_BANNER_LANDSCAPE"]) {
        return kGADAdSizeSmartBannerLandscape;
    } else {
        return kGADAdSizeBanner;
    }
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else

@implementation RNFirebaseAdMob
@end

#endif
