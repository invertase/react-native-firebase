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

describe('phoneNumberVerification()', function () {
  describe('modular', function () {
    it('exports all modular functions', function () {
      const {
        enableTestSession,
        getVerificationSupportInfo,
        getVerifiedPhoneNumber,
        getDigitalCredentialPayload,
        exchangeCredentialResponseForPhoneNumber,
      } = pnvModular;

      enableTestSession.should.be.a.Function();
      getVerificationSupportInfo.should.be.a.Function();
      getVerifiedPhoneNumber.should.be.a.Function();
      getDigitalCredentialPayload.should.be.a.Function();
      exchangeCredentialResponseForPhoneNumber.should.be.a.Function();
    });
  });

  describe('getVerificationSupportInfo()', function () {
    android.it('returns an array of support info with full fields', async function () {
      const { getVerificationSupportInfo } = pnvModular;
      const supportInfo = await getVerificationSupportInfo();
      supportInfo.should.be.an.Array();

      if (supportInfo.length > 0) {
        const info = supportInfo[0];
        info.should.have.property('isSupported');
        info.isSupported.should.be.a.Boolean();
        info.should.have.property('simSlot');
        info.simSlot.should.be.a.Number();
        info.should.have.property('carrierId');
        info.carrierId.should.be.a.String();
        info.should.have.property('reason');
        info.reason.should.be.a.String();
        [
          'CAPABILITY_STATUS_UNSPECIFIED',
          'CAPABLE',
          'INCAPABLE_DUE_TO_CARRIER_UNSUPPORTED',
          'INCAPABLE_DUE_TO_ANDROID_VERSION',
          'INCAPABLE_DUE_TO_SIM_STATE',
        ].should.containEql(info.reason);
      }
    });

    android.it('accepts an optional simSlot parameter', async function () {
      const { getVerificationSupportInfo } = pnvModular;
      const supportInfo = await getVerificationSupportInfo(0);
      supportInfo.should.be.an.Array();
    });
  });

  describe('only Android supported', function () {
    ios.it('rejects on iOS', async function () {
      const { getVerificationSupportInfo } = pnvModular;
      try {
        await getVerificationSupportInfo();
        throw new Error('should have thrown');
      } catch (e) {
        e.message.should.containEql('only supported on Android');
      }
    });

    it('rejects on Other platforms', async function () {
      if (Platform.android || Platform.ios) {
        this.skip();
        return;
      }
      const { getVerificationSupportInfo } = pnvModular;
      try {
        await getVerificationSupportInfo();
        throw new Error('should have thrown');
      } catch (e) {
        e.message.should.containEql('only supported on Android');
      }
    });
  });
});
