export default class AdRequest {

  constructor() {
    this._props = {
      keywords: [],
    };
  }

  build() {
    return this._props;
  }

  addTestDevice() {
    this._props.testDevice = true;
    return this;
  }

  addKeyword(word: string) {
    this._props.keywords.push(word);
    return this;
  }
}
