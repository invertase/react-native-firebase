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

function PreviousNext({ previous, next }: Props) {
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
