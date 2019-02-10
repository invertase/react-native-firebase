#import "NativeExpressComponent.h"
#import "RNFirebaseAdMob.h"
#import <React/UIView+React.h>

@implementation NativeExpressComponent

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

- (void)initBanner:(GADAdSize)adSize {
    if (_requested) {
        [_banner removeFromSuperview];
    }
    _banner = [[GADNativeExpressAdView alloc] initWithAdSize:adSize];
    _banner.rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
    _banner.delegate = self;
    _banner.videoController.delegate = self;
}

- (void)setUnitId:(NSString *)unitId {
    _unitId = unitId;
    [self requestAd];
}

- (void)setSize:(NSString *)size {
    _size = size;
    [self requestAd];
}

- (void)setRequest:(NSDictionary *)request {
    _request = request;
    [self requestAd];
}

- (void)setVideo:(NSDictionary *)video {
    _video = video;
    [self requestAd];
}

- (void)requestAd {
    if (_unitId == nil || _size == nil || _request == nil || _video == nil) {
        [self setRequested:NO];
        return;
    }

    [self initBanner:[RNFirebaseAdMob stringToAdSize:_size]];
    [self addSubview:_banner];

    [self sendEvent:@"onSizeChange" payload:@{
            @"width": @(_banner.bounds.size.width),
            @"height": @(_banner.bounds.size.height),
    }];

    _banner.adUnitID = _unitId;
    [self setRequested:YES];
    [_banner setAdOptions:@[[RNFirebaseAdMob buildVideoOptions:_video]]];
    [_banner loadRequest:[RNFirebaseAdMob buildRequest:_request]];
}

- (void)sendEvent:(NSString *)type payload:(NSDictionary *_Nullable)payload {
    self.onBannerEvent(@{
            @"type": type,
            @"payload": payload != nil ? payload : [NSNull null],
    });
}

- (void)nativeExpressAdViewDidReceiveAd:(GADNativeExpressAdView *)adView {
    [self sendEvent:@"onAdLoaded" payload:@{
            @"width": @(adView.bounds.size.width),
            @"height": @(adView.bounds.size.height),
            @"hasVideoContent": @(adView.videoController.hasVideoContent),
    }];
}

- (void)nativeExpressAdView:(nonnull GADNativeExpressAdView *)nativeExpressAdView didFailToReceiveAdWithError:(nonnull GADRequestError *)error {
    [self sendEvent:@"onAdFailedToLoad" payload:[RNFirebaseAdMob errorCodeToDictionary:error]];
}

- (void)nativeExpressAdViewWillPresentScreen:(GADNativeExpressAdView *)adView {
    [self sendEvent:@"onAdOpened" payload:nil];
}

- (void)nativeExpressAdViewWillDismissScreen:(GADNativeExpressAdView *)adView {
    // not in use
}

- (void)nativeExpressAdViewDidDismissScreen:(GADNativeExpressAdView *)adView {
    [self sendEvent:@"onAdClosed" payload:nil];
}

- (void)nativeExpressAdViewWillLeaveApplication:(GADNativeExpressAdView *)adView {
    [self sendEvent:@"onAdLeftApplication" payload:nil];
}

- (void)videoControllerDidEndVideoPlayback:(nonnull GADVideoController *)videoController {
    [self sendEvent:@"onVideoEnd" payload:nil];
}

// Only one video play method?
- (void)videoControllerDidPlayVideo:(nonnull GADVideoController *)videoController {
    [self sendEvent:@"onVideoStart" payload:nil];
    [self sendEvent:@"onVideoPlay" payload:nil];
}

- (void)videoControllerDidPauseVideo:(nonnull GADVideoController *)videoController {
    [self sendEvent:@"onVideoPause" payload:nil];
}

- (void)videoControllerDidMuteVideo:(nonnull GADVideoController *)videoController {
    [self sendEvent:@"onVideoMute" payload:@{
            @"isMuted": @YES,
    }];
}

- (void)videoControllerDidUnmuteVideo:(nonnull GADVideoController *)videoController {
    [self sendEvent:@"onVideoMute" payload:@{
            @"isMuted": @NO,
    }];
}

#endif

@end
