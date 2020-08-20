import React from 'react';

function BlockQuote({ children }: any) {
  return (
    <blockquote className="my-8 bg-blue-500 text-white rounded shadow-lg p-4 shadow-lg border-b-4 border-blue-900">
      {children}
    </blockquote>
  );
}

export { BlockQuote };
