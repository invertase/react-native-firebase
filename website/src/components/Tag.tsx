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
import cx from 'classnames';

interface Props {
  background: string;
  foreground: string;
  children: string;
  size?: 'lg' | 'base' | 'sm';
}

function Tag({ background, foreground, children, size = 'base' }: Props): JSX.Element {
  return (
    <div
      className={cx('inline-block rounded opacity-75 font-thin', {
        'text-xs px-2 py-1': size === 'sm',
        'text-base px-3 py-2': size === 'base',
        'text-lg px-4 py-3': size === 'lg',
      })}
      style={{
        backgroundColor: background,
        color: foreground,
      }}
    >
      {children}
    </div>
  );
}

export { Tag };
