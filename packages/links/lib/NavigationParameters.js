export default class NavigationParameters {
  constructor(link) {
    this._link = link;
  }

  setForcedRedirectEnabled(forcedRedirectEnabled) {
    this._forcedRedirectEnabled = forcedRedirectEnabled;
    return this._link;
  }

  build() {
    return {
      forcedRedirectEnabled: this._forcedRedirectEnabled,
    };
  }
}
