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

import React, { useState, useEffect, useReducer } from 'react';
import { View, Dimensions } from 'react-native';
import { requireNativeComponent } from 'react-native';

const initialState = [0, 0];

function BannerAd({ unitId, size, request, onAdEvent }) {
  const [dimensions, setDimensions] = useState(initialState);

  function onNativeEvent({ nativeEvent }) {
    const { width, height, type } = nativeEvent;
    // todo habdle event type/onAdEvent

    switch (type) {
      case 'onSizeChange':
        setDimensions(nativeEvent.width, nativeEvent.height);
        break;
      case 'onAdLoaded':
        onAdEvent('onAdLoaded');
        break;
    }
  }

  const style = {
    width: dimensions[0],
    height: dimensions[1],
  };

  return (
    <RNFBBannerAd
      style={style}
      unitId={''}
      size={''}
      request={{}}
      onNativeEvent={onNativeEvent}
    />
  );
}


const RNFBBannerAd = requireNativeComponent('RNFBBannerAd', BannerAd);

export default BannerAd;
