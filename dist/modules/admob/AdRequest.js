export default class AdRequest {
  constructor() {
    this._props = {
      keywords: [],
      testDevices: []
    };
  }

  build() {
    return this._props;
  }

  addTestDevice(deviceId) {
    this._props.testDevices.push(deviceId || 'DEVICE_ID_EMULATOR');

    return this;
  }

  addKeyword(keyword) {
    this._props.keywords.push(keyword);

    return this;
  }

  setBirthday() {// TODO
  }

  setContentUrl(url) {
    this._props.contentUrl = url;
    return this;
  }

  setGender(gender) {
    const genders = ['male', 'female', 'unknown'];

    if (genders.includes(gender)) {
      this._props.gender = gender;
    }

    return this;
  }

  setLocation() {// TODO
  }

  setRequestAgent(requestAgent) {
    this._props.requestAgent = requestAgent;
    return this;
  }

  setIsDesignedForFamilies(isDesignedForFamilies) {
    this._props.isDesignedForFamilies = isDesignedForFamilies;
    return this;
  }

  tagForChildDirectedTreatment(tagForChildDirectedTreatment) {
    this._props.tagForChildDirectedTreatment = tagForChildDirectedTreatment;
    return this;
  }

}