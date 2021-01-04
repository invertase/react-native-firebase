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
import { Link } from './Link';

interface PreviousOrNextType {
  slug: string;
  title: string;
}

interface Props {
  previous: PreviousOrNextType | undefined;
  next: PreviousOrNextType | undefined;
}

function PreviousNext({ previous, next }: Props): JSX.Element {
  // Both must be present...
  if (!previous && !next) {
    return <div />;
  }

  return (
    <div className="flex items-center mt-12 text-gray-500">
      <div className="flex-1">
        {!!previous ? (
          <Link to={previous.slug}>
            <span>&laquo; {previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
      <div className="flex-1 text-right">
        {!!next ? (
          <Link to={next.slug}>
            <span>{next.title} &raquo;</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export { PreviousNext, PreviousOrNextType };
