export default class AnalyticsParameters {
  constructor(link) {
    this._link = link;
  }

  setCampaign(campaign) {
    this._campaign = campaign;
    return this._link;
  }

  setContent(content) {
    this._content = content;
    return this._link;
  }

  setMedium(medium) {
    this._medium = medium;
    return this._link;
  }

  setSource(source) {
    this._source = source;
    return this._link;
  }

  setTerm(term) {
    this._term = term;
    return this._link;
  }

  build() {
    return {
      campaign: this._campaign,
      content: this._content,
      medium: this._medium,
      source: this._source,
      term: this._term,
    };
  }
}
