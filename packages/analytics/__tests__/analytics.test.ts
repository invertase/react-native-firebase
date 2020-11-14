import { firebase } from '../lib';

describe('Analytics', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.analytics).toBeDefined();
      expect(app.analytics().app).toEqual(app);
    });

    it('throws if non default app arg provided to firebase.analytics(APP)', () => {
      const app = firebase.app('secondaryFromNative');

      const expectedError = [
        'You attempted to call "firebase.analytics(app)" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure the app provided is the default Firebase app only and not the "secondaryFromNative" app.',
      ].join('\r\n');

      // @ts-ignore test
      expect(() => firebase.analytics(app)).toThrowError(expectedError);
    });

    it('throws if analytics access from a non default app', () => {
      const app = firebase.app('secondaryFromNative');

      const expectedError = [
        'You attempted to call "firebase.app(\'secondaryFromNative\').analytics" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure you access analytics from the default application only.',
      ].join('\r\n');

      expect(() => app.analytics()).toThrowError(expectedError);
    });

    // TODO in app/registry/namespace.js - if (!hasCustomUrlOrRegionSupport)
    xit('throws if args provided to firebase.app().analytics(ARGS)', () => {
      try {
        // @ts-ignore test
        firebase.app().analytics('foo', 'arg2');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });
  });

  it('errors if milliseconds not a number', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setSessionTimeoutDuration('123')).toThrowError(
      "'milliseconds' expected a number value",
    );
  });

  it('throws if none string none null values', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setUserId(123)).toThrowError("'id' expected a string value");
  });

  it('throws if name is not a string', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setUserProperty(1337, 'invertase')).toThrowError(
      "'name' expected a string value",
    );
  });
  it('throws if value is invalid', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setUserProperty('invertase3', 33.3333)).toThrowError(
      "'value' expected a string value",
    );
  });

  it('throws if properties is not an object', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setUserProperties(1337)).toThrowError(
      "'properties' expected an object of key/value pairs",
    );
  });
  it('throws if property value is invalid', () => {
    const props = {
      test: '123',
      foo: {
        bar: 'baz',
      },
    };
    // @ts-ignore test
    expect(() => firebase.analytics().setUserProperties(props)).toThrowError(
      "'properties' value for parameter 'foo' is invalid",
    );
  });
  it('throws if value is a number', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().setUserProperties({ invertase1: 123 })).toThrowError(
      "'properties' value for parameter 'invertase1' is invalid, expected a string.",
    );
  });

  it('errors when no parameters are set', () => {
    // @ts-ignore test
    expect(() => firebase.analytics().logSearch()).toThrowError(
      'The supplied arg must be an object of key/values',
    );
  });

  describe('logEvent()', () => {
    it('errors if name is not a string', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logEvent(123)).toThrowError(
        "firebase.analytics().logEvent(*) 'name' expected a string value.",
      );
    });

    it('errors if params is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logEvent('invertase_event', 'foobar')).toThrowError(
        "firebase.analytics().logEvent(_, *) 'params' expected an object value.",
      );
    });

    it('errors on using a reserved name', () => {
      expect(() => firebase.analytics().logEvent('session_start')).toThrowError(
        "firebase.analytics().logEvent(*) 'name' the event name 'session_start' is reserved and can not be used.",
      );
    });

    it('errors if name not alphanumeric', () => {
      expect(() => firebase.analytics().logEvent('!@£$%^&*')).toThrowError(
        "firebase.analytics().logEvent(*) 'name' invalid event name '!@£$%^&*'. Names should contain 1 to 40 alphanumeric characters or underscores.",
      );
    });

    it('errors if more than 25 params provided', () => {
      expect(() =>
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1))),
      ).toThrowError(
        "firebase.analytics().logEvent(_, *) 'params' maximum number of parameters exceeded (25).",
      );
    });

    describe('logScreenView()', () => {
      it('errors if param is not an object', () => {
        // @ts-ignore test
        expect(() => firebase.analytics().logScreenView(123)).toThrowError(
          'firebase.analytics().logScreenView(*):',
        );
      });
    });

    describe('logAddPaymentInfo()', () => {
      it('errors if param is not an object', () => {
        // @ts-ignore test
        expect(() => firebase.analytics().logAddPaymentInfo(123)).toThrowError(
          'firebase.analytics().logAddPaymentInfo(*):',
        );
      });
      it('errors when compound values are not set', () => {
        expect(() =>
          firebase.analytics().logAddPaymentInfo({
            value: 123,
          }),
        ).toThrowError('firebase.analytics().logAddPaymentInfo(*):');
      });
    });
  });

  describe('logAddToCart()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logAddToCart(123)).toThrowError(
        'firebase.analytics().logAddToCart(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logAddToCart({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logAddToCart(*):');
    });
  });

  describe('logAddShippingInfo()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logAddShippingInfo(123)).toThrowError(
        'firebase.analytics().logAddShippingInfo(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logAddShippingInfo({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logAddShippingInfo(*):');
    });
  });

  describe('logAddToWishlist()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logAddToWishlist(123)).toThrowError(
        'firebase.analytics().logAddToWishlist(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logAddToWishlist({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logAddToWishlist(*):');
    });
  });

  describe('logBeginCheckout()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logBeginCheckout(123)).toThrowError(
        'firebase.analytics().logBeginCheckout(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logBeginCheckout({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logBeginCheckout(*):');
    });
  });

  describe('logGenerateLead()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logGenerateLead(123)).toThrowError(
        'firebase.analytics().logGenerateLead(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logGenerateLead({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logGenerateLead(*):');
    });
  });

  describe('logCampaignDetails()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logCampaignDetails(123)).toThrowError(
        'firebase.analytics().logCampaignDetails(*):',
      );
    });
  });

  describe('logEarnVirtualCurrency()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logEarnVirtualCurrency(123)).toThrowError(
        'firebase.analytics().logEarnVirtualCurrency(*):',
      );
    });
  });

  describe('logJoinGroup()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logJoinGroup(123)).toThrowError(
        'firebase.analytics().logJoinGroup(*):',
      );
    });
  });

  describe('logLevelEnd()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logLevelEnd(123)).toThrowError(
        'firebase.analytics().logLevelEnd(*):',
      );
    });
  });

  describe('logLevelStart()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logLevelStart(123)).toThrowError(
        'firebase.analytics().logLevelStart(*):',
      );
    });
  });

  describe('logLevelUp()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logLevelUp(123)).toThrowError(
        'firebase.analytics().logLevelUp(*):',
      );
    });
  });

  describe('logLogin()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logLogin(123)).toThrowError(
        'firebase.analytics().logLogin(*):',
      );
    });
  });

  describe('logPostScore()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logPostScore(123)).toThrowError(
        'firebase.analytics().logPostScore(*):',
      );
    });
  });

  describe('logSelectContent()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSelectContent(123)).toThrowError(
        'firebase.analytics().logSelectContent(*):',
      );
    });
  });

  describe('logSearch()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSearch(123)).toThrowError(
        'firebase.analytics().logSearch(*):',
      );
    });
  });

  describe('logSelectItem()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSelectItem(123)).toThrowError(
        'firebase.analytics().logSelectItem(*):',
      );
    });
  });

  describe('logSetCheckoutOption()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSetCheckoutOption(123)).toThrowError(
        'firebase.analytics().logSetCheckoutOption(*):',
      );
    });
  });

  describe('logShare()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logShare(123)).toThrowError(
        'firebase.analytics().logShare(*):',
      );
    });
  });

  describe('logSignUp()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSignUp(123)).toThrowError(
        'firebase.analytics().logSignUp(*):',
      );
    });
  });

  describe('logSelectPromotion()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSelectPromotion(123)).toThrowError(
        'firebase.analytics().logSelectPromotion(*):',
      );
    });
  });

  describe('logSpendVirtualCurrency()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logSpendVirtualCurrency(123)).toThrowError(
        'firebase.analytics().logSpendVirtualCurrency(*):',
      );
    });
  });

  describe('logUnlockAchievement()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logUnlockAchievement(123)).toThrowError(
        'firebase.analytics().logUnlockAchievement(*):',
      );
    });
  });

  describe('logPurchase()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logPurchase(123)).toThrowError(
        'firebase.analytics().logPurchase(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logPurchase({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logPurchase(*):');
    });
  });

  describe('logRefund()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logRefund(123)).toThrowError(
        'firebase.analytics().logRefund(*):',
      );
    });

    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logRefund({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logRefund(*):');
    });
  });

  describe('logViewCart()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logViewCart(123)).toThrowError(
        'firebase.analytics().logViewCart(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logViewCart({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logViewCart(*):');
    });
  });

  describe('logViewItem()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logViewItem(123)).toThrowError(
        'firebase.analytics().logViewItem(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logViewItem({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logViewItem(*):');
    });
  });

  describe('logViewItemList()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logViewItemList(123)).toThrowError(
        'firebase.analytics().logViewItemList(*):',
      );
    });
  });

  describe('logRemoveFromCart()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logRemoveFromCart(123)).toThrowError(
        'firebase.analytics().logRemoveFromCart(*):',
      );
    });
    it('errors when compound values are not set', () => {
      expect(() =>
        firebase.analytics().logRemoveFromCart({
          value: 123,
        }),
      ).toThrowError('firebase.analytics().logRemoveFromCart(*):');
    });
  });

  describe('logViewPromotion()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logViewPromotion(123)).toThrowError(
        'firebase.analytics().logViewPromotion(*):',
      );
    });
  });

  describe('logViewSearchResults()', () => {
    it('errors if param is not an object', () => {
      // @ts-ignore test
      expect(() => firebase.analytics().logViewSearchResults(123)).toThrowError(
        'firebase.analytics().logViewSearchResults(*):',
      );
    });
  });

  describe('setAnalyticsCollectionEnabled()', () => {
    it('throws if not a boolean', () => {
      // @ts-ignore
      expect(() => firebase.analytics().setAnalyticsCollectionEnabled('foo')).toThrowError(
        "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
      );
    });
  });
});
