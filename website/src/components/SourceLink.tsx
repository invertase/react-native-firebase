import React from 'react';
import { Link } from './Link';
import { Tooltip } from '@invertase/ui';

function SourceLink({ source }: { source: string }) {
  return (
    <Tooltip label="Jump to source">
      <Link
        to={source}
        target="_blank"
        className="flex items-center justify-center text-sm text-gray-400 hover:text-gray-500"
      >
        <span>{'<'}</span>
        <span>{'/>'}</span>
      </Link>
    </Tooltip>
  );
}

export { SourceLink };
