import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ButtonTexts, ButtonTypes, ButtonVariants } from './AppleButton.shared';


/**
 * Pure Javascript Apple Sign In button for Android.
 * Cross-compatible with native iOS version.
 */
export default AppleButton = (props) => {
  const {
    style,
    textStyle,
    cornerRadius = 5,
    buttonStyle = ButtonVariants.DEFAULT,
    buttonType = ButtonTypes.DEFAULT,
    onPress,
    leftView,
  } = props;

  const _buttonStyle = [
    buttonStyles.base,
    { borderRadius: cornerRadius },
    buttonStyles[buttonStyle],
    style,
  ];
  const _textStyle = [
    textStyles.base,
    textStyles[buttonStyle],
    textStyle,
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={_buttonStyle}>
      <View style={{ flexDirection: 'row' }}>
        {!!leftView && leftView}
        <Text style={_textStyle}>{ButtonTexts[buttonType]}</Text>
      </View>
    </TouchableOpacity>
  );
};

AppleButton.Style = ButtonVariants;
AppleButton.Type = ButtonTypes;


const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 40,
  },
  [ButtonVariants.WHITE]: {
    backgroundColor: '#fff',
  },
  [ButtonVariants.WHITE_OUTLINE]: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  [ButtonVariants.BLACK]: {
    backgroundColor: '#000',
  },
});

const textStyles = StyleSheet.create({
  base: {
    fontSize: 14,
  },
  [ButtonVariants.WHITE]: {
    color: '#000',
  },
  [ButtonVariants.WHITE_OUTLINE]: {
    color: '#000',
  },
  [ButtonVariants.BLACK]: {
    color: '#fff',
  },
});
