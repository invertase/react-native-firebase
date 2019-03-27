export default class AndroidParameters {
  constructor(link) {
    this._link = link;
  }

  setFallbackUrl(fallbackUrl) {
    this._fallbackUrl = fallbackUrl;
    return this._link;
  }

  setMinimumVersion(minimumVersion) {
    this._minimumVersion = minimumVersion;
    return this._link;
  }

  setPackageName(packageName) {
    this._packageName = packageName;
    return this._link;
  }

  build() {
    if ((this._fallbackUrl || this._minimumVersion) && !this._packageName) {
      throw new Error('AndroidParameters: Missing required `packageName` property');
    }
    return {
      fallbackUrl: this._fallbackUrl,
      minimumVersion: this._minimumVersion,
      packageName: this._packageName,
    };
  }
}
