import React from 'react';
import cx from 'classnames';

interface Props {
  background: string;
  foreground: string;
  children: string;
  size?: 'lg' | 'base' | 'sm';
}

function Tag({ background, foreground, children, size = 'base' }: Props) {
  return (
    <div
      className={cx('inline-block rounded opacity-75 font-thin', {
        'text-xs px-2 py-1': size === 'sm',
        'text-base px-3 py-2': size === 'base',
        'text-lg px-4 py-3': size === 'lg',
      })}
      style={{
        backgroundColor: background,
        color: foreground,
      }}
    >
      {children}
    </div>
  );
}

export { Tag };
