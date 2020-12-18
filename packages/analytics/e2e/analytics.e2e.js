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

describe('analytics()', function() {
  describe('namespace', function() {});

  describe('logEvent()', function() {
    it('log an event without parameters', async function() {
      await firebase.analytics().logEvent('invertase_event');
    });

    it('log an event with parameters', async function() {
      await firebase.analytics().logEvent('invertase_event', {
        boolean: true,
        number: 1,
        string: 'string',
      });
    });
  });

  describe('setAnalyticsCollectionEnabled()', function() {
    it('true', async function() {
      await firebase.analytics().setAnalyticsCollectionEnabled(true);
    });

    it('false', async function() {
      await firebase.analytics().setAnalyticsCollectionEnabled(false);
    });
  });

  describe('resetAnalyticsData()', function() {
    it('calls native fn without error', async function() {
      await firebase.analytics().resetAnalyticsData();
    });
  });

  describe('setSessionTimeoutDuration()', function() {
    it('default duration', async function() {
      await firebase.analytics().setSessionTimeoutDuration();
    });

    it('custom duration', async function() {
      await firebase.analytics().setSessionTimeoutDuration(13371337);
    });
  });

  describe('setUserId()', function() {
    it('allows a null values to be set', async function() {
      await firebase.analytics().setUserId(null);
    });

    it('accepts string values', async function() {
      await firebase.analytics().setUserId('rn-firebase');
    });
  });

  describe('setUserProperty()', function() {
    it('allows a null values to be set', async function() {
      await firebase.analytics().setUserProperty('invertase', null);
    });

    it('accepts string values', async function() {
      await firebase.analytics().setUserProperty('invertase2', 'rn-firebase');
    });
  });

  describe('setUserProperties()', function() {
    it('allows null values to be set', async function() {
      await firebase.analytics().setUserProperties({ invertase2: null });
    });

    it('accepts string values', async function() {
      await firebase.analytics().setUserProperties({ invertase3: 'rn-firebase' });
    });
  });

  describe('logScreenView()', function() {
    it('calls logScreenView', async function() {
      await firebase
        .analytics()
        .logScreenView({ screen_name: 'invertase screen', screen_class: 'invertase class' });
    });
  });

  describe('logAddPaymentInfo()', function() {
    it('calls logAddPaymentInfo', async function() {
      await firebase.analytics().logAddPaymentInfo({
        value: 123,
        currency: 'USD',
        items: [],
      });
    });
  });

  describe('logAddToCart()', function() {
    it('calls logAddToCart', async function() {
      await firebase.analytics().logAddToCart({
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddShippingInfo()', function() {
    it('calls logAddShippingInfo', async function() {
      await firebase.analytics().logAddShippingInfo({
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddToWishlist()', function() {
    it('calls logAddToWishlist', async function() {
      await firebase.analytics().logAddToWishlist({
        items: [
          {
            item_id: 'foo',
            item_name: 'foo',
            item_category: 'foo',
            item_location_id: 'foo',
            quantity: 5,
          },
        ],
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAppOpen()', function() {
    it('calls logAppOpen', async function() {
      await firebase.analytics().logAppOpen();
    });
  });

  describe('logBeginCheckout()', function() {
    it('calls logBeginCheckout', async function() {
      await firebase.analytics().logBeginCheckout();
    });
  });

  describe('logCampaignDetails()', function() {
    it('calls logCampaignDetails', async function() {
      await firebase.analytics().logCampaignDetails({
        source: 'foo',
        medium: 'bar',
        campaign: 'baz',
      });
    });
  });

  describe('logEarnVirtualCurrency()', function() {
    it('calls logEarnVirtualCurrency', async function() {
      await firebase.analytics().logEarnVirtualCurrency({
        virtual_currency_name: 'foo',
        value: 123,
      });
    });
  });

  describe('logPurchase()', function() {
    it('calls logPurchase', async function() {
      await firebase.analytics().logPurchase({
        currency: 'USD',
        value: 123,
        affiliation: 'affiliation',
      });
    });
  });

  describe('logViewPromotion()', function() {
    it('calls logViewPromotion', async function() {
      await firebase.analytics().logViewPromotion({
        creative_name: 'creative_name',
        creative_slot: 'creative_slot',
      });
    });
  });

  describe('logGenerateLead()', function() {
    it('calls logGenerateLead', async function() {
      await firebase.analytics().logGenerateLead({
        currency: 'USD',
        value: 123,
      });
    });
  });

  describe('logJoinGroup()', function() {
    it('calls logJoinGroup', async function() {
      await firebase.analytics().logJoinGroup({
        group_id: '123',
      });
    });
  });

  describe('logLevelEnd()', function() {
    it('calls logLevelEnd', async function() {
      await firebase.analytics().logLevelEnd({
        level: 123,
        success: 'yes',
      });
    });
  });

  describe('logLevelStart()', function() {
    it('calls logLevelEnd', async function() {
      await firebase.analytics().logLevelStart({
        level: 123,
      });
    });
  });

  describe('logLevelUp()', function() {
    it('calls logLevelUp', async function() {
      await firebase.analytics().logLevelUp({
        level: 123,
        character: 'foo',
      });
    });
  });

  describe('logLogin()', function() {
    it('calls logLogin', async function() {
      await firebase.analytics().logLogin({
        method: 'facebook.com',
      });
    });
  });

  describe('logPostScore()', function() {
    it('calls logPostScore', async function() {
      await firebase.analytics().logPostScore({
        score: 123,
      });
    });
  });

  describe('logRemoveFromCart()', function() {
    it('calls logRemoveFromCart', async function() {
      await firebase.analytics().logRemoveFromCart({
        value: 123,
        currency: 'USD',
      });
    });
  });

  describe('logSearch()', function() {
    it('calls logSearch', async function() {
      await firebase.analytics().logSearch({
        search_term: 'foo',
      });
    });
  });

  describe('logSetCheckoutOption()', function() {
    it('calls logSelectContent', async function() {
      await firebase.analytics().logSetCheckoutOption({
        checkout_step: 123,
        checkout_option: 'foo',
      });
    });
  });

  describe('logSelectItem()', function() {
    it('calls logSelectItem', async function() {
      await firebase.analytics().logSelectItem({
        item_list_id: 'foo',
        item_list_name: 'foo',
        content_type: 'foo',
      });
    });
  });

  describe('logShare()', function() {
    it('calls logShare', async function() {
      await firebase.analytics().logShare({
        content_type: 'foo',
        item_id: 'foo',
        method: 'foo',
      });
    });
  });

  describe('logSignUp()', function() {
    it('calls logSignUp', async function() {
      await firebase.analytics().logSignUp({
        method: 'facebook.com',
      });
    });
  });

  describe('logSpendVirtualCurrency()', function() {
    it('calls logSpendVirtualCurrency', async function() {
      await firebase.analytics().logSpendVirtualCurrency({
        item_name: 'foo',
        virtual_currency_name: 'foo',
        value: 123,
      });
    });
  });

  describe('logTutorialBegin()', function() {
    it('calls logTutorialBegin', async function() {
      await firebase.analytics().logTutorialBegin();
    });
  });

  describe('logTutorialComplete()', function() {
    it('calls logTutorialComplete', async function() {
      await firebase.analytics().logTutorialComplete();
    });
  });

  describe('logUnlockAchievement()', function() {
    it('calls logUnlockAchievement', async function() {
      await firebase.analytics().logUnlockAchievement({
        achievement_id: 'foo',
      });
    });
  });

  describe('logViewCart()', function() {
    it('calls logViewCart', async function() {
      await firebase.analytics().logViewCart();
    });
  });

  describe('logViewItem()', function() {
    it('calls logViewItem', async function() {
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

  describe('logViewItemList()', function() {
    it('calls logViewItemList', async function() {
      await firebase.analytics().logViewItemList({
        item_list_name: 'foo',
      });
    });
  });

  describe('logRefund()', function() {
    it('calls logRefund', async function() {
      await firebase.analytics().logRefund({
        affiliation: 'affiliation',
        coupon: 'coupon',
      });
    });
  });

  describe('logSelectContent()', function() {
    it('calls logSelectContent', async function() {
      await firebase.analytics().logSelectContent({
        content_type: 'clothing',
        item_id: 'abcd',
      });
    });
  });

  describe('logSelectPromotion()', function() {
    it('calls logSelectPromotion', async function() {
      await firebase.analytics().logSelectPromotion({
        creative_name: 'string',
        creative_slot: 'string',
        location_id: 'string',
        promotion_id: 'string',
        promotion_name: 'string',
      });
    });
  });

  describe('logViewSearchResults()', function() {
    it('calls logViewSearchResults', async function() {
      await firebase.analytics().logViewSearchResults({
        search_term: 'promotion',
      });
    });
  });
});
