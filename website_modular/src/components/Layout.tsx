import React from 'react';
import { Header } from './Header';
import { Sidebar, ISidebar } from './Sidebar';
import { TableOfContents } from '../utils/unify';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export type ILayoutProps = {
  sidebar: ISidebar;
  children: React.ReactNode;
  toc: TableOfContents;
};

export function Layout({ children, sidebar, toc }: ILayoutProps) {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-[260px,auto] max-w-7xl mx-auto px-3">
        <Sidebar sidebar={sidebar} />
        <div className="min-w-0 w-full">
          <div className="w-full flex">
            <main className="flex-grow min-w-0">
              <div>{children}</div>
              <hr />
              <Footer />
            </main>
            <div className="relative flex-shrink-0 w-[200px]">
              <Navigation toc={toc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
