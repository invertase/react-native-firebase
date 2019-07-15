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

android.describe('firebase.invites.AndroidInvite', () => {
  describe('setAdditionalReferralParameters', () => {
    it('accepts an object with string keys & values', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;

      androidInvite.setAdditionalReferralParameters({
        a: 'b',
        c: 'd',
      });

      androidInvite._additionalReferralParameters.a.should.equal('b');
      androidInvite._additionalReferralParameters.c.should.equal('d');
    });

    it('throws if additionalReferralParameters is not an object', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      try {
        androidInvite.setAdditionalReferralParameters('im a teapot');
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'additionalReferralParameters' must be an object`);
        return Promise.resolve();
      }
    });

    it('throws if additionalReferralParameters property values are not strings', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      try {
        androidInvite.setAdditionalReferralParameters({ 1: 1 });
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'additionalReferralParameters' must be an object`);
        return Promise.resolve();
      }
    });
  });

  describe('setEmailHtmlContent', () => {
    it('sets emailHtmlContent', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      androidInvite.setEmailHtmlContent('123456');
      androidInvite._emailHtmlContent.should.equal('123456');
    });

    it('throws if emailHtmlContent is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      try {
        androidInvite.setEmailHtmlContent(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'emailHtmlContent' must be a string value`);
        return Promise.resolve();
      }
    });

    it('throws if emailHtmlContent is used when callToActionText is set', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      invite.setCallToActionText('cta');
      try {
        androidInvite.setEmailHtmlContent(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(
          `'emailHtmlContent' cannot be used alongside 'callToActionText'`,
        );
        return Promise.resolve();
      }
    });
  });

  describe('setEmailSubject', () => {
    it('sets emailSubject', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      androidInvite.setEmailSubject('123456');
      androidInvite._emailSubject.should.equal('123456');
    });

    it('throws if emailSubject is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      try {
        androidInvite.setEmailSubject(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'emailSubject' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('setGoogleAnalyticsTrackingId', () => {
    it('sets googleAnalyticsTrackingId', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      androidInvite.setGoogleAnalyticsTrackingId('123456');
      androidInvite._googleAnalyticsTrackingId.should.equal('123456');
    });

    it('throws if googleAnalyticsTrackingId is not a string value', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      try {
        androidInvite.setGoogleAnalyticsTrackingId(1234);
        return Promise.reject(new Error('Did not throw'));
      } catch (error) {
        error.message.should.containEql(`'googleAnalyticsTrackingId' must be a string value`);
        return Promise.resolve();
      }
    });
  });

  describe('build', () => {
    it('it builds', () => {
      const invite = firebase.invites().createInvitation('foo', 'bar');
      const androidInvite = invite.android;
      const androidInviteParams = {
        additionalReferralParameters: {
          a: 'b',
          c: 'd',
        },
        emailHtmlContent: 'emailHtmlContent',
        emailSubject: 'emailSubject',
        googleAnalyticsTrackingId: 'googleAnalyticsTrackingId',
      };

      androidInvite.setAdditionalReferralParameters(
        androidInviteParams.additionalReferralParameters,
      );

      androidInvite.setEmailHtmlContent(androidInviteParams.emailHtmlContent);
      androidInvite.setEmailSubject(androidInviteParams.emailSubject);
      androidInvite.setGoogleAnalyticsTrackingId(androidInviteParams.googleAnalyticsTrackingId);

      const builtInvite = invite.build().android;
      JSON.stringify(androidInviteParams).should.equal(JSON.stringify(builtInvite));
    });
  });
});
