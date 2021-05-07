import React from 'react';
import NextLink, { LinkProps } from 'next/link';

export function Link(props: React.PropsWithChildren<LinkProps>) {
  const href = props.href as string;

  if (href.startsWith('http')) {
    const element = props.children;

    // @ts-ignore
    return React.cloneElement(element, {
      href,
      target: '_blank',
      rel: 'noopener',
    });
  }

  return <NextLink {...props} />;
}
