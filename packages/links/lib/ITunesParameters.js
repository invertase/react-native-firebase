export default class ITunesParameters {
  constructor(link) {
    this._link = link;
  }

  setAffiliateToken(affiliateToken) {
    this._affiliateToken = affiliateToken;
    return this._link;
  }

  setCampaignToken(campaignToken) {
    this._campaignToken = campaignToken;
    return this._link;
  }

  setProviderToken(providerToken) {
    this._providerToken = providerToken;
    return this._link;
  }

  build() {
    return {
      affiliateToken: this._affiliateToken,
      campaignToken: this._campaignToken,
      providerToken: this._providerToken,
    };
  }
}
