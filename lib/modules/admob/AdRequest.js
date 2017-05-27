export default class AdRequest {

  constructor() {
    this._props = {
      keywords: [],
      contentUrl: null,
      isDesignedForFamilies: null,
      tagForChildDirectedTreatment: null,
    };
  }

  build() {
    return this._props;
  }

  addTestDevice() {
    this._props.testDevice = true;
    return this;
  }

  addKeyword(keyword: string) {
    this._props.keywords.push(keyword);
    return this;
  }

  setBirthday() {
    // TODO
  }

  setContentUrl(url: string) {
    this._props.contentUrl = url;
  }

  setGender() {
    // TODO
  }

  setLocation() {
    // TODO
  }

  setRequestAgent() {
    // TODO
  }

  setIsDesignedForFamilies(isDesignedForFamilies: boolean) {
    this._props.isDesignedForFamilies = isDesignedForFamilies;
    return this;
  }

  tagForChildDirectedTreatment(tagForChildDirectedTreatment: boolean) {
    this._props.tagForChildDirectedTreatment = tagForChildDirectedTreatment;
    return this;
  }
}
