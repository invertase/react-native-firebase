import React from 'react';
import { Link } from '../components/Link';

/**
 * Represents a single Sidebar Item.
 *
 * [Title, URL | ISidebarItem, Icon]
 */
export type ISidebarItem = [string, string | ISidebar, string | undefined];

export type ISidebar = ISidebarItem[];

export type ISidebarProps = {
  sidebar: ISidebar;
};

export function Sidebar({ sidebar }: ISidebarProps) {
  return (
    <div className="relative">
      <div className="sticky top-16">
        <div className="overflow-y-auto pb-16 pt-4" style={{ height: 'calc(100vh - 4rem)' }}>
          <SidebarItems sidebar={sidebar} />
        </div>
      </div>
    </div>
  );
}

function SidebarItems({ sidebar }: ISidebarProps) {
  return (
    <ul className="text-sm font-medium">
      {sidebar.map(([title, urlOrNested, icon]) => {
        if (typeof urlOrNested === 'string') {
          return (
            <li key={title}>
              <Link href={urlOrNested}>
                <a className="px-3 py-2 transition-colors duration-200 relative block hover:text-gray-900 text-gray-500">
                  {title}
                </a>
              </Link>
            </li>
          );
        }

        return (
          <li key={title}>
            <div className="px-3 py-4 font-bold flex items-center">
              {!!icon && <img src={icon} alt="" className="h-5 pr-2" />}
              {title}
            </div>
            <div className="pl-3">
              <SidebarItems sidebar={urlOrNested} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
