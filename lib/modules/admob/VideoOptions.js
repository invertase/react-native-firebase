export default class VideoOptions {
  constructor() {
    this._props = {
      startMuted: true,
    };
  }

  build() {
    return this._props;
  }

  setStartMuted(muted: boolean = true) {
    this._props.startMuted = muted;
    return this;
  }
}
