/// <reference types="react" />
import * as React from 'react';
export interface AdMobComponentProps {
    request?: any;
    video?: any;
    style?: any;
    class?: any;
}
export interface AdMobComponentState {
    width: number;
    height: number;
}
declare class AdMobComponent extends React.Component<AdMobComponentProps, AdMobComponentState> {
    static propTypes: any;
    nativeView: any;
    static defaultProps: {
        request: {
            keywords?: string[];
            testDevices?: string[];
            gender?: string;
            contentUrl?: string;
            requestAgent?: string;
            isDesignedForFamilies?: boolean;
            tagForChildDirectedTreatment?: boolean;
        };
        video: {
            startMuted: boolean;
        };
    };
    constructor(props: any);
    /**
     * Handle a single banner event and pass to
     * any props watching it
     * @param nativeEvent
     */
    onBannerEvent: ({nativeEvent}: {
        nativeEvent: any;
    }) => void;
    /**
     * Set the JS size of the loaded banner
     * @param width
     * @param height
     */
    updateSize: ({width, height}: {
        width: any;
        height: any;
    }) => void;
    /**
     * Render the native component
     * @returns {XML}
     */
    render(): JSX.Element;
}
export default AdMobComponent;
