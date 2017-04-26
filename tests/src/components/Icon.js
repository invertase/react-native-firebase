import React from 'react';
import { View, TouchableHighlight } from 'react-native';
import VectorIcon from 'react-native-vector-icons/MaterialIcons';

type Props = {
  name: string,
  size?: number,
  color?: string,
  allowFontScaling?: boolean,
  style?: Object,
  rotate?: number,
  onPress?: () => void,
  underlayColor?: string,
};

// TODO Spin?
class Icon extends React.Component {

  constructor() {
    super();
    this.measured = false;
    this.state = {
      width: 0,
    };
  }

  setDimensions(e) {
    if (!this.measured) {
      this.measured = true;
      this.setState({
        width: e.nativeEvent.layout.width,
      });
    }
  }

  props: Props;

  render() {
    const { name, size = 24, color = '#757575', allowFontScaling = true, style, rotate, onPress, underlayColor } = this.props;

    const icon = (
      <View
        onLayout={(e) => this.setDimensions(e)}
        style={[
        style,
        rotate ? { transform: [{ rotate: `${rotate}deg` }] } : null,
      ]}
      >
        <VectorIcon
          name={name.toLowerCase().replace(/\s+/g, '-')}
          size={size}
          color={color}
          allowFontScaling={allowFontScaling}
        />
      </View>
    );

    if (!onPress) {
      return icon;
    }

    return (
      <TouchableHighlight
        underlayColor={underlayColor || 'rgba(0, 0, 0, 0.054)'}
        onPress={onPress}
        style={{ padding: 8, borderRadius: (this.state.width + 8) / 2 }}
      >
        {icon}
      </TouchableHighlight>
    );
  }

}

export default Icon;
