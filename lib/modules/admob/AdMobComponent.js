import React from 'react';
import { View, requireNativeComponent } from 'react-native';
import PropTypes from 'prop-types';
import { statics } from './';
import { nativeToJSError } from '../../utils';

import AdRequest from './AdRequest';
import VideoOptions from './VideoOptions';

class AdMobComponent extends React.Component {

  static propTypes = {
    ...View.propTypes,

    // TODO ehesp: cant init this outside of the component; statics isn't defined
    ...(() => {
      const eventProps = {};
      Object.keys(statics.EventTypes).forEach((key) => {
        eventProps[key] = PropTypes.func;
      });
      return eventProps;
    }),

    ...(() => {
      const eventProps = {};
      Object.keys(statics.NativeExpressEventTypes).forEach((key) => {
        eventProps[key] = PropTypes.func;
      });
      return eventProps;
    }),

    size: PropTypes.string.isRequired,
    unitId: PropTypes.string.isRequired,
    request: PropTypes.object,
    video: PropTypes.object,
  };

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
        onSizeChange: true,
      },
    });

  }

  /**
   * Handle a single banner event and pass to
   * any props watching it
   * @param nativeEvent
   */
  onBannerEvent = ({ nativeEvent }) => {
    console.log(nativeEvent)
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
    console.log(this.props)
    return (
      <this.nativeView
        {...this.props}
        style={[this.props.style, { ...this.state }]}
        bannerEvent={this.onBannerEvent}
      />
    );
  }

}

export default AdMobComponent;
