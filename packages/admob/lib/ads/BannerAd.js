/*
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

import React, { useState } from 'react';
import { requireNativeComponent } from 'react-native';
import { isFunction } from '@react-native-firebase/common';
import NativeFirebaseError from '@react-native-firebase/app/lib/internal/NativeFirebaseError';

const initialState = [0, 0];

function BannerAd({ unitId, size, request, ...props }) {
  const [dimensions, setDimensions] = useState(initialState);

  function onNativeEvent({ nativeEvent }) {
    const { width, height, type } = nativeEvent;

    if (type !== 'onSizeChanged' && isFunction(props[type])) {
      let eventPayload;
      if (type === 'onAdFailedToLoad') {
        eventPayload = NativeFirebaseError.fromEvent(nativeEvent, 'admob');
      }

      props[type](eventPayload);
    }

    if (width && height && size !== 'FLUID') {
      setDimensions([width, height]);
    }
  }

  let style;
  if (size === 'FLUID') {
    style = props.style;
  } else {
    style = {
      width: dimensions[0],
      height: dimensions[1],
    };
  }

  return (
    <ReactNativeFirebaseAdMobBannerView
      size={size}
      style={style}
      unitId={unitId}
      request={request}
      onNativeEvent={onNativeEvent}
    />
  );
}

const ReactNativeFirebaseAdMobBannerView = requireNativeComponent(
  'ReactNativeFirebaseAdMobBannerView',
  BannerAd,
);

export default BannerAd;
