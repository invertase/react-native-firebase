#import <React/RCTComponent.h>
#import <React/RCTBridgeModule.h>

#if __has_include(<GoogleMobileAds/GADMobileAds.h>)

#import <GoogleMobileAds/GADBannerView.h>
#import <GoogleMobileAds/GADBannerViewDelegate.h>

@interface BannerComponent : UIView <GADBannerViewDelegate>

@property GADBannerView *banner;
@property (nonatomic, assign) BOOL requested;

@property (nonatomic, copy) NSString *size;
@property (nonatomic, copy) NSString *unitId;
@property (nonatomic, copy) NSDictionary *request;

@property (nonatomic, copy) RCTBubblingEventBlock onBannerEvent;

- (void)requestAd;

@end
#else

@interface BannerComponent : NSObject {
}
@end

#endif
