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
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.analytics);
      app.analytics().logEvent.should.be.a.Function();
      app.analytics().emitter.should.be.a.Object();
    });

    it('throws if non default app arg provided to firebase.analytics(APP)', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        firebase.analytics(app);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });

    it('throws if analytics access from a non default app', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        app.analytics();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });

    // TODO in app/registry/namespace.js - if (!hasCustomUrlOrRegionSupport)
    xit('throws if args provided to firebase.app().analytics(ARGS)', () => {
      try {
        firebase.app().analytics('foo', 'arg2');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });
  });

  describe('logEvent()', () => {
    it('errors if name is not a string', () => {
      try {
        firebase.analytics().logEvent(123);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'name' expected a string value");
        return Promise.resolve();
      }
    });

    it('errors if params is not an object', () => {
      try {
        firebase.analytics().logEvent('invertase_event', 'foobar');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' expected an object value");
        return Promise.resolve();
      }
    });

    it('errors on using a reserved name', () => {
      try {
        firebase.analytics().logEvent('session_start');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql(
          "'name' the event name 'session_start' is reserved and can not be used",
        );
        return Promise.resolve();
      }
    });

    it('errors if name not alphanumeric', () => {
      try {
        firebase.analytics().logEvent('!@£$%^&*');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'name' invalid event name '!@£$%^&*'");
        return Promise.resolve();
      }
    });

    it('errors if more than 25 params provided', () => {
      try {
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1)));
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' maximum number of parameters exceeded (25)");
        return Promise.resolve();
      }
    });

    it('errors if params contains invalid types', () => {
      try {
        firebase.analytics().logEvent('invertase', {
          foo: 'bar',
          bar: {
            baz: 123,
          },
        });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' value for parameter 'bar' is invalid");
        return Promise.resolve();
      }
    });

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
  });

  describe('setAnalyticsCollectionEnabled()', () => {
    it('throws if not a boolean', () => {
      try {
        firebase.analytics().setAnalyticsCollectionEnabled('foo');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'enabled' expected a boolean value");
        return Promise.resolve();
      }
    });

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
    it('calls logEvent', async () => {
      await firebase.analytics().logAddPaymentInfo();
    });
  });

  describe('logAddToCart()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logAddToCart();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddToCart({
          item_id: 'foo',
          item_name: 'foo',
          item_category: 'foo',
          quantity: 1,
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logAddToCart', async () => {
      await firebase.analytics().logAddToCart({
        item_id: 'foo',
        item_name: 'foo',
        item_category: 'foo',
        quantity: 1,
        item_location_id: 'foo',
        start_date: '2019-01-01',
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddToWishlist()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logAddToWishlist();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logAddToWishlist({
          item_id: 'foo',
          item_name: 'foo',
          item_category: 'foo',
          quantity: 1,
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logAddToWishlist', async () => {
      await firebase.analytics().logAddToWishlist({
        item_id: 'foo',
        item_name: 'foo',
        item_category: 'foo',
        quantity: 1,
        item_location_id: 'foo',
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

  describe('logEcommercePurchase()', () => {
    it('calls logEcommercePurchase with no params', async () => {
      await firebase.analytics().logEcommercePurchase();
    });

    it('calls logEcommercePurchase', async () => {
      await firebase.analytics().logEcommercePurchase({
        currency: 'USD',
        value: 123,
      });
    });
  });

  describe('logGenerateLead()', () => {
    it('calls logGenerateLead with no params', async () => {
      await firebase.analytics().logEcommercePurchase();
    });

    it('calls logGenerateLead', async () => {
      await firebase.analytics().logEcommercePurchase({
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

  describe('logPresentOffer()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logPresentOffer();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logPresentOffer({
          item_id: 'foo',
          item_name: 'foo',
          item_category: 'foo',
          quantity: 1,
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logPresentOffer', async () => {
      await firebase.analytics().logPresentOffer({
        item_id: '123',
        item_name: '123',
        item_category: '123',
        quantity: 123,
      });
    });
  });

  describe('logPurchaseRefund()', () => {
    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logPurchaseRefund({
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logPurchaseRefund with no params', async () => {
      await firebase.analytics().logPurchaseRefund();
    });

    it('calls logPurchaseRefund', async () => {
      await firebase.analytics().logPurchaseRefund({
        transaction_id: '123',
      });
    });
  });

  describe('logRemoveFromCart()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logRemoveFromCart();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logRemoveFromCart({
          item_id: 'foo',
          item_name: 'foo',
          item_category: 'foo',
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logRemoveFromCart', async () => {
      await firebase.analytics().logRemoveFromCart({
        item_id: 'foo',
        item_name: 'foo',
        item_category: 'foo',
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

  describe('logSelectContent()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logSelectContent();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logSelectContent', async () => {
      await firebase.analytics().logSelectContent({
        content_type: 'foo',
        item_id: 'foo',
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
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logViewItem();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('errors when compound values are not set', async () => {
      try {
        await firebase.analytics().logViewItem({
          item_id: 'foo',
          item_name: 'foo',
          item_category: 'foo',
          value: 123,
        });
      } catch (e) {
        e.message.should.containEql('parameter, you must also supply the');
      }
    });

    it('calls logUnlockAchievement', async () => {
      await firebase.analytics().logViewItem({
        item_id: 'foo',
        item_name: 'foo',
        item_category: 'foo',
      });
    });
  });

  describe('logViewItemList()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logViewItemList();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logViewItemList', async () => {
      await firebase.analytics().logViewItemList({
        item_category: 'foo',
      });
    });
  });

  describe('logViewSearchResults()', () => {
    it('errors when no parameters are set', async () => {
      try {
        await firebase.analytics().logViewSearchResults();
      } catch (e) {
        e.message.should.containEql('The supplied arg must be an object of key/values');
      }
    });

    it('calls logViewSearchResults', async () => {
      await firebase.analytics().logViewSearchResults({
        search_term: 'foo',
      });
    });
  });
});
