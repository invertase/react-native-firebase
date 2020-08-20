import React from 'react';
import { EnumMember } from '../types/reference';
import { Divider, HeadingLink } from '@invertase/ui';
import { MdxRaw } from '../components/Mdx';
import { SourceLink } from '../components/SourceLink';

function Enum({ members }: { members: EnumMember[] }) {
  return (
    <>
      <HeadingLink id="members" size="h3">
        Members
      </HeadingLink>
      <Divider />
      {members.map((member) => (
        <>
          <HeadingLink id={member.name.toLowerCase()} size="h4">
            {member.name}
            <SourceLink source={member.source} />
          </HeadingLink>
          <MdxRaw raw={member.description} />
          {/*<MdxRaw raw={member.mdx} />*/}
        </>
      ))}
    </>
  );
}

export { Enum };
