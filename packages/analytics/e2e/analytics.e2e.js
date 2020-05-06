/*
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

describe('analytics()', () => {
  describe('namespace', () => {});

  describe('logEvent()', () => {
    it('log an event without parameters', async () => {
      await firebase.analytics().logEvent('invertase_event');
    });

    it('log an event with parameters', async () => {
      await firebase.analytics().logEvent('invertase_event', {
        boolean: true,
        number: 1,
        string: 'string',
      });
    });

    it('log an event with parameters', async () => {
      await firebase.analytics().logEvent('invertase_event', {
        boolean: true,
        number: 1,
        string: 'string',
      });
    });
  });

  describe('setAnalyticsCollectionEnabled()', () => {
    it('true', async () => {
      await firebase.analytics().setAnalyticsCollectionEnabled(true);
    });

    it('false', async () => {
      await firebase.analytics().setAnalyticsCollectionEnabled(false);
    });
  });

  describe('resetAnalyticsData()', () => {
    it('calls native fn without error', async () => {
      await firebase.analytics().resetAnalyticsData();
    });
  });

  describe('setCurrentScreen()', () => {
    it('screenName only', async () => {
      await firebase.analytics().setCurrentScreen('invertase screen');
    });

    it('screenName with screenClassOverride', async () => {
      await firebase.analytics().setCurrentScreen('invertase screen', 'invertase class override');
    });

    it('errors if screenName not a string', async () => {
      try {
        await firebase.analytics().setCurrentScreen(666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'screenName' expected a string value");
      }
    });

    it('errors if screenClassOverride not a string', async () => {
      try {
        await firebase.analytics().setCurrentScreen('invertase screen', 666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'screenClassOverride' expected a string value");
      }
    });
  });

  describe('setMinimumSessionDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setMinimumSessionDuration();
    });

    it('errors if milliseconds not a number', async () => {
      try {
        await firebase.analytics().setMinimumSessionDuration('123');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a number value");
      }
    });

    it('errors if milliseconds is less than 0', async () => {
      try {
        await firebase.analytics().setMinimumSessionDuration(-100);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a positive number value");
      }
    });

    it('custom duration', async () => {
      await firebase.analytics().setMinimumSessionDuration(1337);
    });
  });

  describe('setSessionTimeoutDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration();
    });

    it('errors if milliseconds not a number', async () => {
      try {
        await firebase.analytics().setSessionTimeoutDuration('123');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a number value");
      }
    });

    it('errors if milliseconds is less than 0', async () => {
      try {
        await firebase.analytics().setSessionTimeoutDuration(-100);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a positive number value");
      }
    });

    it('custom duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration(13371337);
    });
  });

  describe('setUserId()', () => {
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserId(null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserId('rn-firebase');
    });

    it('throws if none string none null values', async () => {
      try {
        await firebase.analytics().setUserId(123);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'id' expected a string value");
      }
    });
  });

  describe('setUserProperty()', () => {
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserProperty('invertase', null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperty('invertase2', 'rn-firebase');
    });

    it('throws if name is not a string', async () => {
      try {
        await firebase.analytics().setUserProperty(1337, 'invertase');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'name' expected a string value");
      }
    });

    it('throws if value is invalid', async () => {
      try {
        await firebase.analytics().setUserProperty('invertase3', 33.3333);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'value' expected a string value");
      }
    });
  });

  describe('setUserProperties()', () => {
    it('throws if properties is not an object', async () => {
      try {
        await firebase.analytics().setUserProperties(1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'properties' expected an object of key/value pairs");
      }
    });

    it('throws if property value is invalid', async () => {
      try {
        await firebase.analytics().setUserProperties({
          test: '123',
          foo: {
            bar: 'baz',
          },
        });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'properties' value for parameter 'foo' is invalid");
      }
    });

    it('throws if value is a number', async () => {
      try {
        await firebase.analytics().setUserProperties({ invertase1: 123 });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql(
          "'properties' value for parameter 'invertase1' is invalid, expected a string.",
        );
      }
    });

    it('allows null values to be set', async () => {
      await firebase.analytics().setUserProperties({ invertase2: null });
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperties({ invertase3: 'rn-firebase' });
    });
  });

  describe('logAddPaymentInfo()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddPaymentInfo({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });
    it('calls logAddPaymentInfo', async () => {
      await firebase.analytics().logAddPaymentInfo({
        value: 123,
        currency: 'USD',
        items: [],
      });
    });
  });

  describe('logAddToCart()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddToCart({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logAddToCart', async () => {
      await firebase.analytics().logAddToCart({
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddToWishlist()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddToWishlist({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logAddToWishlist', async () => {
      await firebase.analytics().logAddToWishlist({
        items: [
          {
            item_id: 'foo',
            item_name: 'foo',
            item_category: 'foo',
            item_location_id: 'foo',
          },
        ],
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAppOpen()', () => {
    it('calls logAppOpen', async () => {
      await firebase.analytics().logAppOpen();
    });
  });

  describe('logBeginCheckout()', () => {
    it('calls logBeginCheckout', async () => {
      await firebase.analytics().logBeginCheckout();
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logBeginCheckout({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });
  });

  describe('logCampaignDetails()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logCampaignDetails();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logCampaignDetails', async () => {
      await firebase.analytics().logCampaignDetails({
        source: 'foo',
        medium: 'bar',
        campaign: 'baz',
      });
    });
  });

  describe('logEarnVirtualCurrency()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logEarnVirtualCurrency();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logEarnVirtualCurrency', async () => {
      await firebase.analytics().logEarnVirtualCurrency({
        virtual_currency_name: 'foo',
        value: 123,
      });
    });
  });

  describe('logPurchase()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logPurchase({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logPurchase', async () => {
      await firebase.analytics().logPurchase({
        currency: 'USD',
        value: 123,
        affiliation: 'affiliation',
      });
    });
  });

  describe('logViewPromotion()', () => {
    it('calls logViewPromotion', async () => {
      await firebase.analytics().logViewPromotion({
        creative_name: 'creative_name',
        creative_slot: 'creative_slot',
      });
    });
  });

  describe('logGenerateLead()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logGenerateLead({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logGenerateLead', async () => {
      await firebase.analytics().logGenerateLead({
        currency: 'USD',
        value: 123,
      });
    });
  });

  describe('logJoinGroup()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logJoinGroup();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logJoinGroup', async () => {
      await firebase.analytics().logJoinGroup({
        group_id: '123',
      });
    });
  });

  describe('logLevelEnd()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logLevelEnd();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logLevelEnd', async () => {
      await firebase.analytics().logLevelEnd({
        level: 123,
        success: 'yes',
      });
    });
  });

  describe('logLevelStart()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logLevelStart();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logLevelEnd', async () => {
      await firebase.analytics().logLevelStart({
        level: 123,
      });
    });
  });

  describe('logLevelUp()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logLevelUp();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logLevelUp', async () => {
      await firebase.analytics().logLevelUp({
        level: 123,
        character: 'foo',
      });
    });
  });

  describe('logLogin()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logLogin();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logLogin', async () => {
      await firebase.analytics().logLogin({
        method: 'facebook.com',
      });
    });
  });

  describe('logPostScore()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logPostScore();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logPostScore', async () => {
      await firebase.analytics().logPostScore({
        score: 123,
      });
    });
  });

  describe('logRemoveFromCart()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logRemoveFromCart({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logRemoveFromCart', async () => {
      await firebase.analytics().logRemoveFromCart({
        value: 123,
        currency: 'USD',
      });
    });
  });

  describe('logSearch()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logSearch();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logSearch', async () => {
      await firebase.analytics().logSearch({
        search_term: 'foo',
      });
    });
  });

  describe('logSetCheckoutOption()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logSetCheckoutOption();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logSelectContent', async () => {
      await firebase.analytics().logSetCheckoutOption({
        checkout_step: 123,
        checkout_option: 'foo',
      });
    });
  });

  describe('logSelectItem()', () => {
    it('calls logSelectItem', async () => {
      await firebase.analytics().logSelectItem({
        item_list_id: 'foo',
        item_list_name: 'foo',
        content_type: 'foo',
      });
    });
  });

  describe('logShare()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logShare();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logShare', async () => {
      await firebase.analytics().logShare({
        content_type: 'foo',
        item_id: 'foo',
        method: 'foo',
      });
    });
  });

  describe('logSignUp()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logSignUp();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logSignUp', async () => {
      await firebase.analytics().logSignUp({
        method: 'facebook.com',
      });
    });
  });

  describe('logSpendVirtualCurrency()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logSpendVirtualCurrency();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logSpendVirtualCurrency', async () => {
      await firebase.analytics().logSpendVirtualCurrency({
        item_name: 'foo',
        virtual_currency_name: 'foo',
        value: 123,
      });
    });
  });

  describe('logTutorialBegin()', () => {
    it('calls logTutorialBegin', async () => {
      await firebase.analytics().logTutorialBegin();
    });
  });

  describe('logTutorialComplete()', () => {
    it('calls logTutorialComplete', async () => {
      await firebase.analytics().logTutorialComplete();
    });
  });

  describe('logUnlockAchievement()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logUnlockAchievement();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logUnlockAchievement', async () => {
      await firebase.analytics().logUnlockAchievement({
        achievement_id: 'foo',
      });
    });
  });

  describe('logViewItem()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logViewItem({
          currency: 'GBP',
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logViewItem', async () => {
      await firebase.analytics().logViewItem({
        items: [
          {
            item_id: 'foo',
            item_name: 'foo',
            item_category: 'foo',
            item_location_id: 'foo',
          },
        ],
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logViewItemList()', () => {
    it('calls logViewItemList', async () => {
      await firebase.analytics().logViewItemList({
        item_list_name: 'foo',
      });
    });
  });

  describe('logRefund()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddPaymentInfo({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });
    it('calls logViewSearchResults', async () => {
      await firebase.analytics().logRefund({
        affiliation: 'affiliation',
        coupon: 'coupon',
      });
    });
  });

  describe('call methods, getters & setters that are deprecated, removed or not supported', () => {
    it('call methods, getters & setters that fire a console.warn() & have no return value', () => {
      const analytics = firebase.analytics();
      const logEcommercePurchaseSpy = sinon.spy(analytics, 'logEcommercePurchase');
      const logPresentOfferSpy = sinon.spy(analytics, 'logPresentOffer');
      const logPurchaseRefundSpy = sinon.spy(analytics, 'logPurchaseRefund');
      const logSelectContentSpy = sinon.spy(analytics, 'logSelectContent');
      const logViewSearchResultsSpy = sinon.spy(analytics, 'logViewSearchResults');

      analytics.logEcommercePurchase();
      analytics.logPresentOffer();
      analytics.logPurchaseRefund();
      analytics.logSelectContent();
      analytics.logViewSearchResults();

      logEcommercePurchaseSpy.should.be.calledOnce();
      logPresentOfferSpy.should.be.calledOnce();
      logPurchaseRefundSpy.should.be.calledOnce();
      logSelectContentSpy.should.be.calledOnce();
      logViewSearchResultsSpy.should.be.calledOnce();
    });
  });
});
