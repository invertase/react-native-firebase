import React from 'react';
import { View, requireNativeComponent } from 'react-native';
import PropTypes from 'prop-types';
import EventTypes, { NativeExpressEventTypes } from './EventTypes';
import { nativeToJSError } from '../../utils';

import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';

const adMobPropTypes = {
  ...View.propTypes,
  size: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  request: PropTypes.object,
  video: PropTypes.object,
}
Object.keys(EventTypes).forEach(eventType => {
  adMobPropTypes[eventType] = PropTypes.func;
});
Object.keys(NativeExpressEventTypes).forEach(eventType => {
  adMobPropTypes[eventType] = PropTypes.func;
});

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

    this.nativeView = requireNativeComponent(props.class, AdMobComponent, {
      nativeOnly: {
        onBannerEvent: true,
      },
    });
  }

  /**
   * Handle a single banner event and pass to
   * any props watching it
   * @param nativeEvent
   */
  onBannerEvent = ({ nativeEvent }) => {
    if (this.props[nativeEvent.type]) {
      if (nativeEvent.type === 'onAdFailedToLoad') {
        const { code, message } = nativeEvent.payload;
        this.props[nativeEvent.type](nativeToJSError(code, message));
      } else {
        this.props[nativeEvent.type](nativeEvent.payload || {});
      }
    }

    if (nativeEvent.type === 'onSizeChange') this.updateSize(nativeEvent.payload);
  };

  /**
   * Set the JS size of the loaded banner
   * @param width
   * @param height
   */
  updateSize = ({ width, height }) => {
    this.setState({ width, height });
  };

  /**
   * Render the native component
   * @returns {XML}
   */
  render() {
    return (
      <this.nativeView
        {...this.props}
        style={[this.props.style, { ...this.state }]}
        onBannerEvent={this.onBannerEvent}
      />
    );
  }
}

export default AdMobComponent;
