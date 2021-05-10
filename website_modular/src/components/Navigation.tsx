import React from 'react';
import { TableOfContents } from '../utils/unify';

export type INavigation = {
  toc: TableOfContents;
};

export function Navigation(props: INavigation) {
  return (
    <aside className="sticky top-16">
      <div className="overflow-y-auto pb-16 pt-4" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="mb-4 text-gray-500 uppercase font-bold text-base lg:text-xs tracking-wide">
          On this page
        </div>
        <div className="text-sm text-gray-600 pr-2">
          <List toc={props.toc} />
        </div>
      </div>
    </aside>
  );
}

function List(props: INavigation) {
  return (
    <ul>
      {props.toc.map(item => {
        return (
          <li key={item.value} style={{ paddingLeft: item.depth * 3 }}>
            <a
              href={`#${item.id}`}
              className="block pb-2 whitespace-no-wrap truncate opacity-100 hover:opacity-75 transition-opacity"
            >
              {item.value}
            </a>
            {!!item.children && <List toc={item.children} />}
          </li>
        );
      })}
    </ul>
  );
}
