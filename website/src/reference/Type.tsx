import React from 'react';
import { CodeBlock, HeadingLink, Divider } from '@invertase/ui';
import { TypeGenerator } from '../components/TypeGenerator';

function Type({ type }: { type: string }) {
  return (
    <>
      <Divider />
      <HeadingLink id="type" size="h3">
        Type
      </HeadingLink>
      <CodeBlock>
        <TypeGenerator key={`type`} type={type} />
      </CodeBlock>
    </>
  );
}

export { Type };
