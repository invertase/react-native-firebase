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

import React from 'react';
import { JumpToTop } from '@invertase/ui';
import cx from 'classnames';

function ToTop(): JSX.Element {
  return (
    <JumpToTop>
      {(distance, jump) => (
        <div
          role="button"
          onClick={() => jump()}
          className={cx(
            'fixed transition-opacity duration-200 inset-x-0 bottom-0 z-40 w-40 mx-auto mb-4 bg-gray-900 rounded-lg text-white text-center py-2 uppercase text-xs',
            {
              'opacity-0 pointer-events-none': distance < 300,
              'opacity-50 hover:opacity-100 shadow-lg pointer-events-auto': distance >= 300,
            },
          )}
        >
          Jump to top
        </div>
      )}
    </JumpToTop>
  );
}

export { ToTop };
