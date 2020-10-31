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

  describe('setSessionTimeoutDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration();
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
  });

  describe('setUserProperty()', () => {
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserProperty('invertase', null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperty('invertase2', 'rn-firebase');
    });
  });

  describe('setUserProperties()', () => {
    it('allows null values to be set', async () => {
      await firebase.analytics().setUserProperties({ invertase2: null });
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperties({ invertase3: 'rn-firebase' });
    });
  });

  describe('logScreenView()', () => {
    it('calls logScreenView', async () => {
      await firebase
        .analytics()
        .logScreenView({ screen_name: 'invertase screen', screen_class: 'invertase class' });
    });
  });

  describe('logAddPaymentInfo()', () => {
    it('calls logAddPaymentInfo', async () => {
      await firebase.analytics().logAddPaymentInfo({
        value: 123,
        currency: 'USD',
        items: [],
      });
    });
  });

  describe('logAddToCart()', () => {
    it('calls logAddToCart', async () => {
      await firebase.analytics().logAddToCart({
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddShippingInfo()', () => {
    it('calls logAddShippingInfo', async () => {
      await firebase.analytics().logAddShippingInfo({
        value: 123,
        currency: 'GBP',
      });
    });
  });

  describe('logAddToWishlist()', () => {
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
  });

  describe('logCampaignDetails()', () => {
    it('calls logCampaignDetails', async () => {
      await firebase.analytics().logCampaignDetails({
        source: 'foo',
        medium: 'bar',
        campaign: 'baz',
      });
    });
  });

  describe('logEarnVirtualCurrency()', () => {
    it('calls logEarnVirtualCurrency', async () => {
      await firebase.analytics().logEarnVirtualCurrency({
        virtual_currency_name: 'foo',
        value: 123,
      });
    });
  });

  describe('logPurchase()', () => {
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
    it('calls logGenerateLead', async () => {
      await firebase.analytics().logGenerateLead({
        currency: 'USD',
        value: 123,
      });
    });
  });

  describe('logJoinGroup()', () => {
    it('calls logJoinGroup', async () => {
      await firebase.analytics().logJoinGroup({
        group_id: '123',
      });
    });
  });

  describe('logLevelEnd()', () => {
    it('calls logLevelEnd', async () => {
      await firebase.analytics().logLevelEnd({
        level: 123,
        success: 'yes',
      });
    });
  });

  describe('logLevelStart()', () => {
    it('calls logLevelEnd', async () => {
      await firebase.analytics().logLevelStart({
        level: 123,
      });
    });
  });

  describe('logLevelUp()', () => {
    it('calls logLevelUp', async () => {
      await firebase.analytics().logLevelUp({
        level: 123,
        character: 'foo',
      });
    });
  });

  describe('logLogin()', () => {
    it('calls logLogin', async () => {
      await firebase.analytics().logLogin({
        method: 'facebook.com',
      });
    });
  });

  describe('logPostScore()', () => {
    it('calls logPostScore', async () => {
      await firebase.analytics().logPostScore({
        score: 123,
      });
    });
  });

  describe('logRemoveFromCart()', () => {
    it('calls logRemoveFromCart', async () => {
      await firebase.analytics().logRemoveFromCart({
        value: 123,
        currency: 'USD',
      });
    });
  });

  describe('logSearch()', () => {
    it('calls logSearch', async () => {
      await firebase.analytics().logSearch({
        search_term: 'foo',
      });
    });
  });

  describe('logSetCheckoutOption()', () => {
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
    it('calls logShare', async () => {
      await firebase.analytics().logShare({
        content_type: 'foo',
        item_id: 'foo',
        method: 'foo',
      });
    });
  });

  describe('logSignUp()', () => {
    it('calls logSignUp', async () => {
      await firebase.analytics().logSignUp({
        method: 'facebook.com',
      });
    });
  });

  describe('logSpendVirtualCurrency()', () => {
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
    it('calls logUnlockAchievement', async () => {
      await firebase.analytics().logUnlockAchievement({
        achievement_id: 'foo',
      });
    });
  });

  describe('logViewCart()', () => {
    it('calls logViewCart', async () => {
      await firebase.analytics().logViewCart();
    });
  });

  describe('logViewItem()', () => {
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
    it('calls logRefund', async () => {
      await firebase.analytics().logRefund({
        affiliation: 'affiliation',
        coupon: 'coupon',
      });
    });
  });

  describe('logSelectContent()', () => {
    it('calls logSelectContent', async () => {
      await firebase.analytics().logSelectContent({
        content_type: 'clothing',
        item_id: 'abcd',
      });
    });
  });

  describe('logSelectPromotion()', () => {
    it('calls logSelectPromotion', async () => {
      await firebase.analytics().logSelectPromotion({
        creative_name: 'string',
        creative_slot: 'string',
        location_id: 'string',
        promotion_id: 'string',
        promotion_name: 'string',
      });
    });
  });

  describe('logViewSearchResults()', () => {
    it('calls logViewSearchResults', async () => {
      await firebase.analytics().logViewSearchResults({
        search_term: 'promotion',
      });
    });
  });
});
