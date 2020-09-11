/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent } from 'react-native';
import { ButtonTypes, ButtonVariants } from './AppleButton.shared';

const nativeComponentsCache = {};

/**
 * We create a native view manager for each combination of style & type (Apple API limitation)
 * so we need to require specific named components based on the provided style/type.
 */
function getNativeComponentForStyleAndType(buttonStyle, buttonType) {
  const componentName = `RNAppleAuthButtonViewManager${buttonStyle}${buttonType}`;
  if (nativeComponentsCache[componentName]) {
    return nativeComponentsCache[componentName];
  }

  const NativeComponent = requireNativeComponent(componentName);

  if (!NativeComponent) {
    throw new Error(
      `RNAppleAuth -> Native component '${componentName}' does not exist, make sure you're confirming API availability via 'isSupported' & 'isSignUpButtonSupported' before using the button component.`,
    );
  }

  nativeComponentsCache[componentName] = NativeComponent;
  return NativeComponent;
}

/**
 * Apple Button View Function Component, supports the standard onPress event.
 */
export default function AppleButton({
  buttonStyle = AppleButton.Style.DEFAULT,
  buttonType = AppleButton.Type.DEFAULT,
  ...props
}) {
  const NativeComponent = getNativeComponentForStyleAndType(buttonStyle, buttonType);
  return <NativeComponent {...props} />;
}

AppleButton.Style = ButtonVariants;
AppleButton.Type = ButtonTypes;

AppleButton.propTypes = {
  buttonStyle: PropTypes.oneOf(Object.values(AppleButton.Style)),
  buttonType: PropTypes.oneOf(Object.values(AppleButton.Type)),
  cornerRadius: PropTypes.number,
};
