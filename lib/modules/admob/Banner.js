import React, { PropTypes } from 'react';
import { requireNativeComponent, View } from 'react-native';
import { statics } from './';
import { nativeToJSError } from '../../utils';

class Banner extends React.Component {

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
    size: PropTypes.string,
    unitId: PropTypes.string,
    testing: PropTypes.bool,
  };

  static defaultProps = {
    size: 'SMART_BANNER',
    unitId: 'ca-app-pub-3940256099942544/6300978111', // Testing
    testing: true,
  };

  constructor() {
    super();
    this.state = {
      width: 0,
      height: 0,
    };
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
   * Handle a native onSizeChange event
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
      <RNFirebaseAdMobBanner
        {...this.props}
        style={[this.props.style, { ...this.state }]}
        bannerEvent={this.onBannerEvent}
      />
    );
  }

}

const RNFirebaseAdMobBanner = requireNativeComponent('RNFirebaseAdMobBanner', Banner);

export default Banner;
