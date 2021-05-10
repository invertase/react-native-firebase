import React, { useLayoutEffect } from 'react';
import mediumZoom from 'medium-zoom';

export type IHTMLRender = {
  source: string;
};

export function HTMLRender(props: IHTMLRender) {
  useLayoutEffect(() => {
    mediumZoom('[data-id="html-render"] img');
  }, []);

  return (
    <section
      data-id="html-render"
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: props.source }}
    />
  );
}
