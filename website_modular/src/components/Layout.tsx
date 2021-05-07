import React from 'react';
import { Header } from './Header';
import { Sidebar, ISidebar } from './Sidebar';

export type ILayoutProps = {
  title?: string;
  description?: string;
  sidebar: ISidebar;
  children: React.ReactNode;
};

export function Layout({ title, description, children, sidebar }: ILayoutProps) {
  return (
    <div>
      <Header />
      <div className="grid grid-cols-[260px,auto] max-w-7xl mx-auto px-3">
        <Sidebar sidebar={sidebar} />
        <div className="min-w-0 w-full">
          <div className="w-full flex">
            <main className="flex-grow mb-32 px-8 pt-4 min-w-0">
              {!!title && (
                <div className="mb-8 pb-8 border-b">
                  <h2 className="inline-block text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                  {!!description && <p className="mt-3 text-lg text-gray-500">{description}</p>}
                </div>
              )}
              <div className="prose max-w-none">{children}</div>
            </main>
            <div className="flex-shrink-0 w-[200px]">Navigation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
