export default class IOSParameters {
  constructor(link) {
    this._link = link;
  }

  setAppStoreId(appStoreId) {
    this._appStoreId = appStoreId;
    return this._link;
  }

  setBundleId(bundleId) {
    this._bundleId = bundleId;
    return this._link;
  }

  setCustomScheme(customScheme) {
    this._customScheme = customScheme;
    return this._link;
  }

  setFallbackUrl(fallbackUrl) {
    this._fallbackUrl = fallbackUrl;
    return this._link;
  }

  setIPadBundleId(iPadBundleId) {
    this._iPadBundleId = iPadBundleId;
    return this._link;
  }

  setIPadFallbackUrl(iPadFallbackUrl) {
    this._iPadFallbackUrl = iPadFallbackUrl;
    return this._link;
  }

  setMinimumVersion(minimumVersion) {
    this._minimumVersion = minimumVersion;
    return this._link;
  }

  build() {
    if (
      (this._appStoreId ||
        this._customScheme ||
        this._fallbackUrl ||
        this._iPadBundleId ||
        this._iPadFallbackUrl ||
        this._minimumVersion) &&
      !this._bundleId
    ) {
      throw new Error('IOSParameters: Missing required `bundleId` property');
    }
    return {
      appStoreId: this._appStoreId,
      bundleId: this._bundleId,
      customScheme: this._customScheme,
      fallbackUrl: this._fallbackUrl,
      iPadBundleId: this._iPadBundleId,
      iPadFallbackUrl: this._iPadFallbackUrl,
      minimumVersion: this._minimumVersion,
    };
  }
}
