export default class VideoOptions {
    _props: {
        startMuted: boolean;
    };
    constructor();
    build(): {
        startMuted: boolean;
    };
    setStartMuted(muted?: boolean): this;
}
