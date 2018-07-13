#import "BannerComponent.h"
#import "RNFirebaseAdMob.h"
#import <React/UIView+React.h>

@implementation BannerComponent

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

- (void)initBanner:(GADAdSize)adSize {
    if (_requested) {
        [_banner removeFromSuperview];
    }
    _banner = [[GADBannerView alloc] initWithAdSize:adSize];
    _banner.rootViewController = [UIApplication sharedApplication].delegate.window.rootViewController;
    _banner.delegate = self;
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

- (void)requestAd {
    #ifndef __LP64__
        return; // prevent crash on 32bit
    #endif

    if (_unitId == nil || _size == nil || _request == nil) {
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
    [_banner loadRequest:[RNFirebaseAdMob buildRequest:_request]];
}

- (void)sendEvent:(NSString *)type payload:(NSDictionary *_Nullable)payload {
    self.onBannerEvent(@{
            @"type": type,
            @"payload": payload != nil ? payload : [NSNull null],
    });
}

- (void)adViewDidReceiveAd:(GADBannerView *)adView {
    [self sendEvent:@"onAdLoaded" payload:@{
            @"width": @(adView.bounds.size.width),
            @"height": @(adView.bounds.size.height),
            @"hasVideoContent": @NO,
    }];
}

- (void)adView:(GADBannerView *)adView didFailToReceiveAdWithError:(GADRequestError *)error {
    [self sendEvent:@"onAdFailedToLoad" payload:[RNFirebaseAdMob errorCodeToDictionary:error]];
}

- (void)adViewWillPresentScreen:(GADBannerView *)adView {
    [self sendEvent:@"onAdOpened" payload:nil];
}

- (void)adViewWillDismissScreen:(GADBannerView *)adView {
    // not in use
}

- (void)adViewDidDismissScreen:(GADBannerView *)adView {
    [self sendEvent:@"onAdClosed" payload:nil];
}

- (void)adViewWillLeaveApplication:(GADBannerView *)adView {
    [self sendEvent:@"onAdLeftApplication" payload:nil];
}

#endif

@end
