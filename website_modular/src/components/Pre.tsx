import React from 'react';
import Highlight, { Language, defaultProps } from 'prism-react-renderer';

export function Pre(props: React.HTMLProps<HTMLPreElement>) {
  //TODO: Causes a bug in the build
  // const code = props.children.props.children;
  console.log(props);
  return (
    // <Highlight {...defaultProps} code={code} language="jsx">
    <Highlight {...defaultProps} code={''} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
