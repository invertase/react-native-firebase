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
 *
 */

#import <React/RCTViewManager.h>
#import "RNAppleAuthButtonView.h"

/* -------------------------
 *         White
 * ------------------------- */

#pragma mark - White - SignIn

@interface RNAppleAuthButtonViewManagerWhiteSignIn : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerWhiteSignIn
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteSignIn)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeSignIn authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhite];
}
@end

#pragma mark - White - Continue

@interface RNAppleAuthButtonViewManagerWhiteContinue : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerWhiteContinue
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteContinue)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeContinue authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhite];
}
@end


#pragma mark - White - SignUp
@interface RNAppleAuthButtonViewManagerWhiteSignUp : RCTViewManager @end
@implementation RNAppleAuthButtonViewManagerWhiteSignUp
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteSignUp)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
    ASAuthorizationAppleIDButtonType type = ASAuthorizationAppleIDButtonTypeDefault;
    if (@available(iOS 13.2, *)) {
        type = ASAuthorizationAppleIDButtonTypeSignUp;
    }
    return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:type authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhite];
}
@end

/* -------------------------
 *       WhiteOutline
 * ------------------------- */

#pragma mark - WhiteOutline - SignIn

@interface RNAppleAuthButtonViewManagerWhiteOutlineSignIn : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerWhiteOutlineSignIn
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteOutlineSignIn)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeSignIn authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhiteOutline];
}
@end

#pragma mark - WhiteOutline - Continue

@interface RNAppleAuthButtonViewManagerWhiteOutlineContinue : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerWhiteOutlineContinue
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteOutlineContinue)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeContinue authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhiteOutline];
}
@end

#pragma mark - WhiteOutline - SignUp
@interface RNAppleAuthButtonViewManagerWhiteOutlineSignUp : RCTViewManager @end
@implementation RNAppleAuthButtonViewManagerWhiteOutlineSignUp
  RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerWhiteOutlineSignUp)
  RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
  RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
    view.cornerRadius = [json floatValue];
  }

  - (UIView *)view {
      ASAuthorizationAppleIDButtonType type = ASAuthorizationAppleIDButtonTypeDefault;
      if (@available(iOS 13.2, *)) {
          type = ASAuthorizationAppleIDButtonTypeSignUp;
      }
      return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:type authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleWhiteOutline];
  }
@end


/* -------------------------
 *         Black
 * ------------------------- */

#pragma mark - Black - SignIn

@interface RNAppleAuthButtonViewManagerBlackSignIn : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerBlackSignIn
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerBlackSignIn)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeSignIn authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleBlack];
}
@end

#pragma mark - Black - Continue

@interface RNAppleAuthButtonViewManagerBlackContinue : RCTViewManager
@end

@implementation RNAppleAuthButtonViewManagerBlackContinue
RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerBlackContinue)

RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
  view.cornerRadius = [json floatValue];
}

- (UIView *)view {
  return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:ASAuthorizationAppleIDButtonTypeContinue authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleBlack];
}
@end

#pragma mark - Black - SignUp
@interface RNAppleAuthButtonViewManagerBlackSignUp : RCTViewManager @end

@implementation RNAppleAuthButtonViewManagerBlackSignUp
  RCT_EXPORT_MODULE(RNAppleAuthButtonViewManagerBlackSignUp)
  RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)
  RCT_CUSTOM_VIEW_PROPERTY(cornerRadius, NSNumber *, RNAppleAuthButtonView) {
    view.cornerRadius = [json floatValue];
  }
  - (UIView *)view {
      ASAuthorizationAppleIDButtonType type = ASAuthorizationAppleIDButtonTypeDefault;
      if (@available(iOS 13.2, *)) {
          type = ASAuthorizationAppleIDButtonTypeSignUp;
      }
      return [[RNAppleAuthButtonView alloc] initWithAuthorizationButtonType:type authorizationButtonStyle:ASAuthorizationAppleIDButtonStyleBlack];
  }
@end

