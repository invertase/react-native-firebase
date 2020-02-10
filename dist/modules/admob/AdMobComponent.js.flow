import React from 'react';
import { ViewPropTypes, requireNativeComponent, Platform } from 'react-native';
import PropTypes from 'prop-types';
import EventTypes, { NativeExpressEventTypes } from './EventTypes';
import { nativeToJSError } from '../../utils';

import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';

const adMobPropTypes = {
  ...ViewPropTypes,
  size: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  /* eslint-disable react/forbid-prop-types */
  request: PropTypes.object,
  video: PropTypes.object,
  /* eslint-enable react/forbid-prop-types */
};
Object.keys(EventTypes).forEach(eventType => {
  adMobPropTypes[eventType] = PropTypes.func;
});
Object.keys(NativeExpressEventTypes).forEach(eventType => {
  adMobPropTypes[eventType] = PropTypes.func;
});

const nativeComponents = {};

function getNativeComponent(name) {
  if (nativeComponents[name]) return nativeComponents[name];
  const component = requireNativeComponent(name, AdMobComponent, {
    nativeOnly: {
      onBannerEvent: true,
    },
  });
  nativeComponents[name] = component;
  return component;
}

class AdMobComponent extends React.Component {
  static propTypes = adMobPropTypes;

  static defaultProps = {
    request: new AdRequest().addTestDevice().build(),
    video: new VideoOptions().build(),
  };

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
    };

    this.nativeView = getNativeComponent(props.class);
  }

  /**
   * Handle a single banner event and pass to
   * any props watching it
   * @param nativeEvent
   */
  onBannerEvent = ({ nativeEvent }) => {
    const { props } = this;
    if (props[nativeEvent.type]) {
      if (nativeEvent.type === 'onAdFailedToLoad') {
        const { code, message } = nativeEvent.payload;
        props[nativeEvent.type](nativeToJSError(code, message));
      } else {
        props[nativeEvent.type](nativeEvent.payload || {});
      }
    }

    if (nativeEvent.type === 'onSizeChange') {
      this.updateSize(nativeEvent.payload);
    }

    if (nativeEvent.type === 'onAdLoaded' && Platform.OS === 'ios') {
      this.updateSize(nativeEvent.payload);
    }
  };

  /**
   * Set the JS size of the loaded banner
   * @param width
   * @param height
   */
  updateSize = ({ width, height }) => {
    if (width !== undefined && height !== undefined) {
      this.setState({ width, height });
    }
  };

  /**
   * Render the native component
   * @returns {XML}
   */
  render() {
    const { style } = this.props;
    return (
      <this.nativeView
        {...this.props}
        style={[style, { ...this.state }]}
        onBannerEvent={this.onBannerEvent}
      />
    );
  }
}

export default AdMobComponent;
