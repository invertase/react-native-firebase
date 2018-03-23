export default class AdRequest {
  constructor() {
    this._props = {
      keywords: [],
      testDevices: [],
    };
  }

  build() {
    return this._props;
  }

  addTestDevice(deviceId?: string) {
    this._props.testDevices.push(deviceId || 'DEVICE_ID_EMULATOR');
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
    return this;
  }

  setGender(gender: 'male | female | unknown') {
    const genders = ['male', 'female', 'unknown'];
    if (genders.includes(gender)) {
      this._props.gender = gender;
    }
    return this;
  }

  setLocation() {
    // TODO
  }

  setRequestAgent(requestAgent: string) {
    this._props.requestAgent = requestAgent;
    return this;
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
