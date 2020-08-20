import React from 'react';
import { Property } from '../types/reference';
import { CodeBlock, Divider, HeadingLink } from '@invertase/ui';
import { EntityTable } from '../components/EntityTable';
import { MdxRaw } from '../components/Mdx';

import { TypeGenerator } from '../components/TypeGenerator';
import { SourceLink } from '../components/SourceLink';

function Reference({ name, type }: { name: string; type: string }) {
  return (
    <CodeBlock>
      <span className="parameter">{name}</span>
      <span>{': '}</span>
      <TypeGenerator type={type} />;
    </CodeBlock>
  );
}

function Properties({ properties }: { properties: Property[] }) {
  return (
    <>
      <Divider />
      <HeadingLink id="properties" size="h3">
        Properties
      </HeadingLink>
      <EntityTable
        entities={properties.map((property) => ({
          name: property.name,
          hash: property.hash,
        }))}
      />
      {properties.map((property) => (
        <div key={property.id}>
          <div className="flex items-end">
            <HeadingLink id={property.hash} size="h4" className="flex-1">
              {property.name}
            </HeadingLink>
            <SourceLink source={property.source} />
          </div>
          <MdxRaw raw={property.description} />
          <Reference name={property.name} type={property.type} />
        </div>
      ))}
    </>
  );
}

export { Properties, Reference as ReferenceProperty };
