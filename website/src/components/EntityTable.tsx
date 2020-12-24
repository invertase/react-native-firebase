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
import styled from '@emotion/styled';
import { Link } from './Link';

interface Props {
  entities: {
    hash: string;
    name: string;
  }[];
}

const Ul = styled.ul`
  column-count: 3;
  column-gap: 1rem;
  row-gap: 2rem;
`;

function EntityTable({ entities }: Props): JSX.Element {
  return (
    <div className="my-4 bg-gray-100 rounded p-4 shadow-lg">
      <Ul className="leading-loose">
        {entities.map(entity => (
          <li className="truncate no-whitespace-no-wrap" key={entity.name}>
            <Link to={`#${entity.hash}`}>{entity.name}</Link>
          </li>
        ))}
      </Ul>
    </div>
  );
}

export { EntityTable };
