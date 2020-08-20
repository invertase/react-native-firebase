declare module 'gatsby-plugin-mdx' {
  import * as React from 'react';

  // From https://mdxjs.com/advanced/typescript
  type ComponentType =
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'thematicBreak'
    | 'blockquote'
    | 'ul'
    | 'ol'
    | 'li'
    | 'table'
    | 'tr'
    | 'td'
    | 'pre'
    | 'code'
    | 'em'
    | 'strong'
    | 'delete'
    | 'inlineCode'
    | 'hr'
    | 'a'
    | 'img';

  interface MDXRendererProps {
    scope?: any;
    components?: {
      [key in ComponentType]?: React.ComponentType<{
        children: React.ReactNode;
      }>;
    };
    children: string;

    [propName: string]: any;
  }

  export class MDXRenderer extends React.Component<MDXRendererProps> {}
}
