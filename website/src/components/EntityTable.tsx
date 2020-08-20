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

function EntityTable({ entities }: Props) {
  return (
    <div className="my-4 bg-gray-100 rounded p-4 shadow-lg">
      <Ul className="leading-loose">
        {entities.map(entity => (
          <li className="truncate no-whitespace-no-wrap">
            <Link to={`#${entity.hash}`}>{entity.name}</Link>
          </li>
        ))}
      </Ul>
    </div>
  );
}

export { EntityTable };
