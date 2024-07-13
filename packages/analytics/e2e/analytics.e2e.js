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

describe('analytics() modular', function () {
  beforeEach(async function () {
    await firebase.analytics().logEvent('screen_view');
  });

  describe('firebase v8 compatibility', function () {
    describe('logEvent()', function () {
      it('log an event without parameters', async function () {
        await firebase.analytics().logEvent('invertase_event');
      });

      it('log an event with parameters', async function () {
        await firebase.analytics().logEvent('invertase_event', {
          boolean: true,
          number: 1,
          string: 'string',
        });
      });
    });

    describe('setSessionTimeoutDuration()', function () {
      it('default duration', async function () {
        await firebase.analytics().setSessionTimeoutDuration();
      });

      xit('custom duration', async function () {
        // TODO: worked on Detox v17, causes crash after transition to v18. Why?
        await firebase.analytics().setSessionTimeoutDuration(13371337);
      });
    });

    describe('getAppInstanceId()', function () {
      it('calls native fn without error', async function () {
        await firebase.analytics().getAppInstanceId();
      });
    });

    describe('getSessionId()', function () {
      it('calls native fn without error', async function () {
        await firebase.analytics().getSessionId();
      });

      it('returns a non empty session ID', async function () {
        if (Platform.other) {
          this.skip();
        }
        let sessionId = await firebase.analytics().getSessionId();
        // On iOS it can take ~ 3 minutes for the session ID to be generated
        // Otherwise, `Analytics uninitialized` error will be thrown
        const retries = 240;
        while (!sessionId && retries > 0) {
          await Utils.sleep(1000);
          sessionId = await firebase.analytics().getSessionId();
        }

        if (!sessionId) {
          return Promise.reject(
            new Error('Firebase SDK did not return a session ID after 4 minutes'),
          );
        }

        sessionId.should.not.equal(0);
      });

      it('returns a null value if session expires', async function () {
        // Set session duration to 1 millisecond
        firebase.analytics().setSessionTimeoutDuration(1);
        // Wait 100 millisecond to ensure session expires
        await Utils.sleep(100);
        const sessionId = await firebase.analytics().getSessionId();
        should.equal(sessionId, null);
      });
    });

    describe('setUserId()', function () {
      it('allows a null values to be set', async function () {
        await firebase.analytics().setUserId(null);
      });

      it('accepts string values', async function () {
        await firebase.analytics().setUserId('rn-firebase');
      });
    });

    describe('setUserProperty()', function () {
      it('allows a null values to be set', async function () {
        await firebase.analytics().setUserProperty('invertase', null);
      });

      it('accepts string values', async function () {
        await firebase.analytics().setUserProperty('invertase2', 'rn-firebase');
      });
    });

    describe('setUserProperties()', function () {
      it('allows null values to be set', async function () {
        await firebase.analytics().setUserProperties({ invertase2: null });
      });

      it('accepts string values', async function () {
        await firebase.analytics().setUserProperties({ invertase3: 'rn-firebase' });
      });
    });

    describe('logScreenView()', function () {
      it('calls logScreenView', async function () {
        await firebase
          .analytics()
          .logScreenView({ screen_name: 'invertase screen', screen_class: 'invertase class' });
      });
    });

    describe('logAddPaymentInfo()', function () {
      it('calls logAddPaymentInfo', async function () {
        await firebase.analytics().logAddPaymentInfo({
          value: 123,
          currency: 'USD',
          items: [],
        });
      });
    });

    describe('logAddToCart()', function () {
      it('calls logAddToCart', async function () {
        await firebase.analytics().logAddToCart({
          value: 123,
          currency: 'GBP',
        });
      });
    });

    describe('logAddShippingInfo()', function () {
      it('calls logAddShippingInfo', async function () {
        await firebase.analytics().logAddShippingInfo({
          value: 123,
          currency: 'GBP',
        });
      });
    });

    describe('logAddToWishlist()', function () {
      it('calls logAddToWishlist', async function () {
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

    describe('logAppOpen()', function () {
      it('calls logAppOpen', async function () {
        await firebase.analytics().logAppOpen();
      });
    });

    describe('logBeginCheckout()', function () {
      it('calls logBeginCheckout', async function () {
        await firebase.analytics().logBeginCheckout();
      });
    });

    describe('logCampaignDetails()', function () {
      it('calls logCampaignDetails', async function () {
        await firebase.analytics().logCampaignDetails({
          source: 'foo',
          medium: 'bar',
          campaign: 'baz',
        });
      });
    });

    describe('logEarnVirtualCurrency()', function () {
      it('calls logEarnVirtualCurrency', async function () {
        await firebase.analytics().logEarnVirtualCurrency({
          virtual_currency_name: 'foo',
          value: 123,
        });
      });
    });

    describe('logPurchase()', function () {
      it('calls logPurchase', async function () {
        await firebase.analytics().logPurchase({
          currency: 'USD',
          value: 123,
          affiliation: 'affiliation',
        });
      });
    });

    describe('logViewPromotion()', function () {
      it('calls logViewPromotion', async function () {
        await firebase.analytics().logViewPromotion({
          creative_name: 'creative_name',
          creative_slot: 'creative_slot',
        });
      });
    });

    describe('logGenerateLead()', function () {
      it('calls logGenerateLead', async function () {
        await firebase.analytics().logGenerateLead({
          currency: 'USD',
          value: 123,
        });
      });
    });

    describe('logJoinGroup()', function () {
      it('calls logJoinGroup', async function () {
        await firebase.analytics().logJoinGroup({
          group_id: '123',
        });
      });
    });

    describe('logLevelEnd()', function () {
      it('calls logLevelEnd', async function () {
        await firebase.analytics().logLevelEnd({
          level: 123,
          success: 'yes',
        });
      });
    });

    describe('logLevelStart()', function () {
      it('calls logLevelEnd', async function () {
        await firebase.analytics().logLevelStart({
          level: 123,
        });
      });
    });

    describe('logLevelUp()', function () {
      it('calls logLevelUp', async function () {
        await firebase.analytics().logLevelUp({
          level: 123,
          character: 'foo',
        });
      });
    });

    describe('logLogin()', function () {
      it('calls logLogin', async function () {
        await firebase.analytics().logLogin({
          method: 'facebook.com',
        });
      });
    });

    describe('logPostScore()', function () {
      it('calls logPostScore', async function () {
        await firebase.analytics().logPostScore({
          score: 123,
        });
      });
    });

    describe('logRemoveFromCart()', function () {
      it('calls logRemoveFromCart', async function () {
        await firebase.analytics().logRemoveFromCart({
          value: 123,
          currency: 'USD',
        });
      });
    });

    describe('logSearch()', function () {
      it('calls logSearch', async function () {
        await firebase.analytics().logSearch({
          search_term: 'foo',
        });
      });
    });

    describe('logSetCheckoutOption()', function () {
      it('calls logSelectContent', async function () {
        await firebase.analytics().logSetCheckoutOption({
          checkout_step: 123,
          checkout_option: 'foo',
        });
      });
    });

    describe('logSelectItem()', function () {
      it('calls logSelectItem', async function () {
        await firebase.analytics().logSelectItem({
          item_list_id: 'foo',
          item_list_name: 'foo',
          content_type: 'foo',
        });
      });
    });

    describe('logShare()', function () {
      it('calls logShare', async function () {
        await firebase.analytics().logShare({
          content_type: 'foo',
          item_id: 'foo',
          method: 'foo',
        });
      });
    });

    describe('logSignUp()', function () {
      it('calls logSignUp', async function () {
        await firebase.analytics().logSignUp({
          method: 'facebook.com',
        });
      });
    });

    describe('logSpendVirtualCurrency()', function () {
      it('calls logSpendVirtualCurrency', async function () {
        await firebase.analytics().logSpendVirtualCurrency({
          item_name: 'foo',
          virtual_currency_name: 'foo',
          value: 123,
        });
      });
    });

    describe('logTutorialBegin()', function () {
      it('calls logTutorialBegin', async function () {
        await firebase.analytics().logTutorialBegin();
      });
    });

    describe('logTutorialComplete()', function () {
      it('calls logTutorialComplete', async function () {
        await firebase.analytics().logTutorialComplete();
      });
    });

    describe('logUnlockAchievement()', function () {
      it('calls logUnlockAchievement', async function () {
        await firebase.analytics().logUnlockAchievement({
          achievement_id: 'foo',
        });
      });
    });

    describe('logViewCart()', function () {
      it('calls logViewCart', async function () {
        await firebase.analytics().logViewCart();
      });
    });

    describe('logViewItem()', function () {
      it('calls logViewItem', async function () {
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

    describe('logViewItemList()', function () {
      it('calls logViewItemList', async function () {
        await firebase.analytics().logViewItemList({
          item_list_name: 'foo',
          items: [
            {
              item_id: 'foo',
              item_name: 'foo',
              item_category: 'foo',
              item_location_id: 'foo',
              price: 123,
            },
          ],
        });
      });
    });

    describe('logRefund()', function () {
      it('calls logRefund', async function () {
        await firebase.analytics().logRefund({
          affiliation: 'affiliation',
          coupon: 'coupon',
        });
      });
    });

    describe('logSelectContent()', function () {
      it('calls logSelectContent', async function () {
        await firebase.analytics().logSelectContent({
          content_type: 'clothing',
          item_id: 'abcd',
        });
      });
    });

    describe('logSelectPromotion()', function () {
      it('calls logSelectPromotion', async function () {
        await firebase.analytics().logSelectPromotion({
          creative_name: 'string',
          creative_slot: 'string',
          location_id: 'string',
          promotion_id: 'string',
          promotion_name: 'string',
        });
      });
    });

    describe('logViewSearchResults()', function () {
      it('calls logViewSearchResults', async function () {
        await firebase.analytics().logViewSearchResults({
          search_term: 'promotion',
        });
      });
    });

    describe('setDefaultEventParameters()', function () {
      it('set null default parameter', async function () {
        await firebase.analytics().setDefaultEventParameters(null);
      });

      it('set undefined default parameter', async function () {
        await firebase.analytics().setDefaultEventParameters(undefined);
      });

      it('set default parameters', async function () {
        await firebase.analytics().setDefaultEventParameters({ number: 1, stringn: '123' });
      });
    });

    describe('setConsent()', function () {
      it('set ad_storage=true on consentSettings', async function () {
        const consentSettings = {
          ad_storage: true,
        };
        await firebase.analytics().setConsent(consentSettings);
      });

      it('set ad_storage=false and analytics_storage=true on consentSettings', async function () {
        const consentSettings = {
          ad_storage: false,
          analytics_storage: true,
        };
        await firebase.analytics().setConsent(consentSettings);
      });
    });

    // Test this one near end so all the previous hits are visible in DebugView is that is enabled
    describe('resetAnalyticsData()', function () {
      it('calls native fn without error', async function () {
        await firebase.analytics().resetAnalyticsData();
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('initiateOnDeviceConversionMeasurementWithEmailAddress()', function () {
      it('calls native API successfully', async function () {
        await firebase
          .analytics()
          .initiateOnDeviceConversionMeasurementWithEmailAddress('conversionTest@example.com');
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('on-device conversion measurement with phone', function () {
      it('calls native API successfully', async function () {
        await firebase
          .analytics()
          .initiateOnDeviceConversionMeasurementWithPhoneNumber('+14155551212');
      });

      it('handles mal-formatted phone number', async function () {
        try {
          await firebase
            .analytics()
            .initiateOnDeviceConversionMeasurementWithPhoneNumber('+notaphonenumber');
          fail('Should have returned an error for malformatted phone number');
        } catch (e) {
          // coerce the error message to a string and verify
          if (!(e + '').includes('expected a string value in E.164 format')) {
            fail('Should have returned an error for malformatted phone number');
          }
        }
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('setAnalyticsCollectionEnabled()', function () {
      it('false', async function () {
        await firebase.analytics().setAnalyticsCollectionEnabled(false);
      });

      // Enable as the last action, so the rest of the hits are visible in DebugView if enabled
      it('true', async function () {
        await firebase.analytics().setAnalyticsCollectionEnabled(true);
      });
    });
  });

  describe('modular', function () {
    describe('getAnalytics', function () {
      it('pass app as argument', function () {
        const { getAnalytics } = analyticsModular;

        const analytics = getAnalytics(firebase.app());

        analytics.constructor.name.should.be.equal('FirebaseAnalyticsModule');
      });

      it('no app as argument', function () {
        const { getAnalytics } = analyticsModular;

        const analytics = getAnalytics();

        analytics.constructor.name.should.be.equal('FirebaseAnalyticsModule');
      });
    });

    describe('logEvent()', function () {
      it('log an event without parameters', async function () {
        const { getAnalytics, logEvent } = analyticsModular;
        await logEvent(getAnalytics(), 'invertase_event');
      });

      it('log an event with parameters', async function () {
        const { getAnalytics, logEvent } = analyticsModular;
        await logEvent(getAnalytics(), 'invertase_event', {
          boolean: true,
          number: 1,
          string: 'string',
        });
      });
    });

    describe('setSessionTimeoutDuration()', function () {
      it('default duration', async function () {
        const { getAnalytics, setSessionTimeoutDuration } = analyticsModular;
        await setSessionTimeoutDuration(getAnalytics());
      });

      xit('custom duration', async function () {
        const { getAnalytics, setSessionTimeoutDuration } = analyticsModular;
        // TODO: worked on Detox v17, causes crash after transition to v18. Why?
        await setSessionTimeoutDuration(getAnalytics(), 13371337);
      });
    });

    describe('getAppInstanceId()', function () {
      it('calls native fn without error', async function () {
        const { getAnalytics, getAppInstanceId } = analyticsModular;
        await getAppInstanceId(getAnalytics());
      });
    });

    describe('getSessionId()', function () {
      it('calls native fn without error', async function () {
        const { getAnalytics, getSessionId } = analyticsModular;
        await getSessionId(getAnalytics());
      });

      it('returns a non empty session ID', async function () {
        if (Platform.other) {
          this.skip();
        }
        const { getAnalytics, getSessionId } = analyticsModular;
        let sessionId = await getSessionId(getAnalytics());
        // On iOS it can take ~ 3 minutes for the session ID to be generated
        // Otherwise, `Analytics uninitialized` error will be thrown
        const retries = 240;
        while (!sessionId && retries > 0) {
          await Utils.sleep(1000);
          sessionId = await getSessionId(getAnalytics());
        }

        if (!sessionId) {
          return Promise.reject(
            new Error('Firebase SDK did not return a session ID after 4 minutes'),
          );
        }

        sessionId.should.not.equal(0);
      });

      it('returns a null value if session expires', async function () {
        const { getAnalytics, getSessionId, setSessionTimeoutDuration } = analyticsModular;
        // Set session duration to 1 millisecond
        setSessionTimeoutDuration(getAnalytics(), 1);
        // Wait 100 millisecond to ensure session expires
        await Utils.sleep(100);
        const sessionId = await getSessionId(getAnalytics());
        should.equal(sessionId, null);
      });
    });

    describe('setUserId()', function () {
      it('allows a null values to be set', async function () {
        const { getAnalytics, setUserId } = analyticsModular;
        await setUserId(getAnalytics(), null);
      });

      it('accepts string values', async function () {
        const { getAnalytics, setUserId } = analyticsModular;
        await setUserId(getAnalytics(), 'rn-firebase');
      });
    });

    describe('setUserProperty()', function () {
      it('allows a null values to be set', async function () {
        const { getAnalytics, setUserProperty } = analyticsModular;
        await setUserProperty(getAnalytics(), 'invertase', null);
      });

      it('accepts string values', async function () {
        const { getAnalytics, setUserProperty } = analyticsModular;
        await setUserProperty(getAnalytics(), 'invertase2', 'rn-firebase');
      });
    });

    describe('setUserProperties()', function () {
      it('allows null values to be set', async function () {
        const { getAnalytics, setUserProperties } = analyticsModular;
        await setUserProperties(getAnalytics(), { invertase2: null });
      });

      it('accepts string values', async function () {
        const { getAnalytics, setUserProperties } = analyticsModular;
        await setUserProperties(getAnalytics(), { invertase3: 'rn-firebase' });
      });
    });

    describe('logScreenView()', function () {
      it('calls logScreenView', async function () {
        const { getAnalytics, logScreenView } = analyticsModular;
        await logScreenView(getAnalytics(), {
          screen_name: 'invertase screen',
          screen_class: 'invertase class',
        });
      });
    });

    describe('logAddPaymentInfo()', function () {
      it('calls logAddPaymentInfo', async function () {
        const { getAnalytics, logAddPaymentInfo } = analyticsModular;
        await logAddPaymentInfo(getAnalytics(), {
          value: 123,
          currency: 'USD',
          items: [],
        });
      });
    });

    describe('logAddToCart()', function () {
      it('calls logAddToCart', async function () {
        const { getAnalytics, logAddToCart } = analyticsModular;
        await logAddToCart(getAnalytics(), {
          value: 123,
          currency: 'GBP',
        });
      });
    });

    describe('logAddShippingInfo()', function () {
      it('calls logAddShippingInfo', async function () {
        const { getAnalytics, logAddShippingInfo } = analyticsModular;
        await logAddShippingInfo(getAnalytics(), {
          value: 123,
          currency: 'GBP',
        });
      });
    });

    describe('logAddToWishlist()', function () {
      it('calls logAddToWishlist', async function () {
        const { getAnalytics, logAddToWishlist } = analyticsModular;
        await logAddToWishlist(getAnalytics(), {
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

    describe('logAppOpen()', function () {
      it('calls logAppOpen', async function () {
        const { getAnalytics, logAppOpen } = analyticsModular;
        await logAppOpen(getAnalytics());
      });
    });

    describe('logBeginCheckout()', function () {
      it('calls logBeginCheckout', async function () {
        const { getAnalytics, logBeginCheckout } = analyticsModular;
        await logBeginCheckout(getAnalytics());
      });
    });

    describe('logCampaignDetails()', function () {
      it('calls logCampaignDetails', async function () {
        const { getAnalytics, logCampaignDetails } = analyticsModular;
        await logCampaignDetails(getAnalytics(), {
          source: 'foo',
          medium: 'bar',
          campaign: 'baz',
        });
      });
    });

    describe('logEarnVirtualCurrency()', function () {
      it('calls logEarnVirtualCurrency', async function () {
        const { getAnalytics, logEarnVirtualCurrency } = analyticsModular;
        await logEarnVirtualCurrency(getAnalytics(), {
          virtual_currency_name: 'foo',
          value: 123,
        });
      });
    });

    describe('logPurchase()', function () {
      it('calls logPurchase', async function () {
        const { getAnalytics, logPurchase } = analyticsModular;
        await logPurchase(getAnalytics(), {
          currency: 'USD',
          value: 123,
          affiliation: 'affiliation',
        });
      });
    });

    describe('logViewPromotion()', function () {
      it('calls logViewPromotion', async function () {
        const { getAnalytics, logViewPromotion } = analyticsModular;
        await logViewPromotion(getAnalytics(), {
          creative_name: 'creative_name',
          creative_slot: 'creative_slot',
        });
      });
    });

    describe('logGenerateLead()', function () {
      it('calls logGenerateLead', async function () {
        const { getAnalytics, logGenerateLead } = analyticsModular;
        await logGenerateLead(getAnalytics(), {
          currency: 'USD',
          value: 123,
        });
      });
    });

    describe('logJoinGroup()', function () {
      it('calls logJoinGroup', async function () {
        const { getAnalytics, logJoinGroup } = analyticsModular;
        await logJoinGroup(getAnalytics(), {
          group_id: '123',
        });
      });
    });

    describe('logLevelEnd()', function () {
      it('calls logLevelEnd', async function () {
        const { getAnalytics, logLevelEnd } = analyticsModular;
        await logLevelEnd(getAnalytics(), {
          level: 123,
          success: 'yes',
        });
      });
    });

    describe('logLevelStart()', function () {
      it('calls logLevelEnd', async function () {
        const { getAnalytics, logLevelStart } = analyticsModular;
        await logLevelStart(getAnalytics(), {
          level: 123,
        });
      });
    });

    describe('logLevelUp()', function () {
      it('calls logLevelUp', async function () {
        const { getAnalytics, logLevelUp } = analyticsModular;
        await logLevelUp(getAnalytics(), {
          level: 123,
          character: 'foo',
        });
      });
    });

    describe('logLogin()', function () {
      it('calls logLogin', async function () {
        const { getAnalytics, logLogin } = analyticsModular;
        await logLogin(getAnalytics(), {
          method: 'facebook.com',
        });
      });
    });

    describe('logPostScore()', function () {
      it('calls logPostScore', async function () {
        const { getAnalytics, logPostScore } = analyticsModular;
        await logPostScore(getAnalytics(), {
          score: 123,
        });
      });
    });

    describe('logRemoveFromCart()', function () {
      it('calls logRemoveFromCart', async function () {
        const { getAnalytics, logRemoveFromCart } = analyticsModular;
        await logRemoveFromCart(getAnalytics(), {
          value: 123,
          currency: 'USD',
        });
      });
    });

    describe('logSearch()', function () {
      it('calls logSearch', async function () {
        const { getAnalytics, logSearch } = analyticsModular;
        await logSearch(getAnalytics(), {
          search_term: 'foo',
        });
      });
    });

    describe('logSetCheckoutOption()', function () {
      it('calls logSelectContent', async function () {
        const { getAnalytics, logSetCheckoutOption } = analyticsModular;
        await logSetCheckoutOption(getAnalytics(), {
          checkout_step: 123,
          checkout_option: 'foo',
        });
      });
    });

    describe('logSelectItem()', function () {
      it('calls logSelectItem', async function () {
        const { getAnalytics, logSelectItem } = analyticsModular;
        await logSelectItem(getAnalytics(), {
          item_list_id: 'foo',
          item_list_name: 'foo',
          content_type: 'foo',
        });
      });
    });

    describe('logShare()', function () {
      it('calls logShare', async function () {
        const { getAnalytics, logShare } = analyticsModular;
        await logShare(getAnalytics(), {
          content_type: 'foo',
          item_id: 'foo',
          method: 'foo',
        });
      });
    });

    describe('logSignUp()', function () {
      it('calls logSignUp', async function () {
        const { getAnalytics, logSignUp } = analyticsModular;
        await logSignUp(getAnalytics(), {
          method: 'facebook.com',
        });
      });
    });

    describe('logSpendVirtualCurrency()', function () {
      it('calls logSpendVirtualCurrency', async function () {
        const { getAnalytics, logSpendVirtualCurrency } = analyticsModular;
        await logSpendVirtualCurrency(getAnalytics(), {
          item_name: 'foo',
          virtual_currency_name: 'foo',
          value: 123,
        });
      });
    });

    describe('logTutorialBegin()', function () {
      it('calls logTutorialBegin', async function () {
        const { getAnalytics, logTutorialBegin } = analyticsModular;
        await logTutorialBegin(getAnalytics());
      });
    });

    describe('logTutorialComplete()', function () {
      it('calls logTutorialComplete', async function () {
        const { getAnalytics, logTutorialComplete } = analyticsModular;
        await logTutorialComplete(getAnalytics());
      });
    });

    describe('logUnlockAchievement()', function () {
      it('calls logUnlockAchievement', async function () {
        const { getAnalytics, logUnlockAchievement } = analyticsModular;
        await logUnlockAchievement(getAnalytics(), {
          achievement_id: 'foo',
        });
      });
    });

    describe('logViewCart()', function () {
      it('calls logViewCart', async function () {
        const { getAnalytics, logViewCart } = analyticsModular;
        await logViewCart(getAnalytics());
      });
    });

    describe('logViewItem()', function () {
      it('calls logViewItem', async function () {
        const { getAnalytics, logViewItem } = analyticsModular;
        await logViewItem(getAnalytics(), {
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

    describe('logViewItemList()', function () {
      it('calls logViewItemList', async function () {
        const { getAnalytics, logViewItemList } = analyticsModular;
        await logViewItemList(getAnalytics(), {
          item_list_name: 'foo',
          items: [
            {
              item_id: 'foo',
              item_name: 'foo',
              item_category: 'foo',
              item_location_id: 'foo',
              price: 123,
            },
          ],
        });
      });
    });

    describe('logRefund()', function () {
      it('calls logRefund', async function () {
        const { getAnalytics, logRefund } = analyticsModular;
        await logRefund(getAnalytics(), {
          affiliation: 'affiliation',
          coupon: 'coupon',
        });
      });
    });

    describe('logSelectContent()', function () {
      it('calls logSelectContent', async function () {
        const { getAnalytics, logSelectContent } = analyticsModular;
        await logSelectContent(getAnalytics(), {
          content_type: 'clothing',
          item_id: 'abcd',
        });
      });
    });

    describe('logSelectPromotion()', function () {
      it('calls logSelectPromotion', async function () {
        const { getAnalytics, logSelectPromotion } = analyticsModular;
        await logSelectPromotion(getAnalytics(), {
          creative_name: 'string',
          creative_slot: 'string',
          location_id: 'string',
          promotion_id: 'string',
          promotion_name: 'string',
        });
      });
    });

    describe('logViewSearchResults()', function () {
      it('calls logViewSearchResults', async function () {
        const { getAnalytics, logViewSearchResults } = analyticsModular;
        await logViewSearchResults(getAnalytics(), {
          search_term: 'promotion',
        });
      });
    });

    describe('setDefaultEventParameters()', function () {
      it('set null default parameter', async function () {
        const { getAnalytics, setDefaultEventParameters } = analyticsModular;
        await setDefaultEventParameters(getAnalytics(), null);
      });

      it('set undefined default parameter', async function () {
        const { getAnalytics, setDefaultEventParameters } = analyticsModular;
        await setDefaultEventParameters(getAnalytics(), undefined);
      });

      it('set default parameters', async function () {
        const { getAnalytics, setDefaultEventParameters } = analyticsModular;
        await setDefaultEventParameters(getAnalytics(), { number: 1, stringn: '123' });
      });
    });

    // Test this one near end so all the previous hits are visible in DebugView is that is enabled
    describe('resetAnalyticsData()', function () {
      it('calls native fn without error', async function () {
        const { getAnalytics, resetAnalyticsData } = analyticsModular;
        await resetAnalyticsData(getAnalytics());
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('initiateOnDeviceConversionMeasurementWithEmailAddress()', function () {
      it('calls native API successfully', async function () {
        const { getAnalytics, initiateOnDeviceConversionMeasurementWithEmailAddress } =
          analyticsModular;
        await initiateOnDeviceConversionMeasurementWithEmailAddress(
          getAnalytics(),
          'conversionTest@example.com',
        );
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('on-device conversion measurement with phone', function () {
      it('calls native API successfully', async function () {
        const { getAnalytics, initiateOnDeviceConversionMeasurementWithPhoneNumber } =
          analyticsModular;
        await initiateOnDeviceConversionMeasurementWithPhoneNumber(getAnalytics(), '+14155551212');
      });

      it('handles mal-formatted phone number', async function () {
        try {
          const { getAnalytics, initiateOnDeviceConversionMeasurementWithPhoneNumber } =
            analyticsModular;
          await initiateOnDeviceConversionMeasurementWithPhoneNumber(
            getAnalytics(),
            '+notaphonenumber',
          );
          fail('Should have returned an error for malformatted phone number');
        } catch (e) {
          // coerce the error message to a string and verify
          if (!(e + '').includes('expected a string value in E.164 format')) {
            fail('Should have returned an error for malformatted phone number');
          }
        }
      });
    });

    // Test this last so it does not stop delivery to DebugView
    describe('setAnalyticsCollectionEnabled()', function () {
      it('false', async function () {
        const { getAnalytics, setAnalyticsCollectionEnabled } = analyticsModular;
        await setAnalyticsCollectionEnabled(getAnalytics(), false);
      });

      // Enable as the last action, so the rest of the hits are visible in DebugView if enabled
      it('true', async function () {
        const { getAnalytics, setAnalyticsCollectionEnabled } = analyticsModular;
        await setAnalyticsCollectionEnabled(getAnalytics(), true);
      });
    });

    describe('setConsent()', function () {
      it('set ad_storage=true on consentSettings', async function () {
        const consentSettings = {
          ad_storage: true,
        };
        const { getAnalytics, setConsent } = analyticsModular;
        await setConsent(getAnalytics(), consentSettings);
      });

      it('set ad_storage=false and analytics_storage=true on consentSettings', async function () {
        const consentSettings = {
          ad_storage: false,
          analytics_storage: true,
        };
        const { getAnalytics, setConsent } = analyticsModular;
        await setConsent(getAnalytics(), consentSettings);
      });
    });
  });
});
