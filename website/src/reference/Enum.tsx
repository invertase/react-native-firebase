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
import { EnumMember } from '../types/reference';
import { Divider, HeadingLink } from '@invertase/ui';
import { MdxRaw } from '../components/Mdx';
import { SourceLink } from '../components/SourceLink';

function Enum({ members }: { members: EnumMember[] }): JSX.Element {
  return (
    <>
      <HeadingLink id="members" size="h3">
        Members
      </HeadingLink>
      <Divider />
      {members.map(member => (
        <>
          <HeadingLink id={member.name.toLowerCase()} size="h4">
            {member.name}
            <SourceLink source={member.source} />
          </HeadingLink>
          <MdxRaw raw={member.description} />
        </>
      ))}
    </>
  );
}

export { Enum };
