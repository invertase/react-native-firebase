import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 bg-white">
      <div className="max-w-7xl mx-auto px-3">
        <div className="grid grid-cols-[260px,auto,200px] items-center h-16 ">
          <h2 className="text-lg pl-3 flex items-center">
            <img
              src="https://static.invertase.io/assets/React-Native-Firebase.svg"
              alt=""
              className="h-8 pr-2"
            />
            <span>React Native Firebase</span>
          </h2>
          <div className="">
            <input type="text" className="w-full" placeholder="Search..." />
          </div>
          <div>Actions</div>
        </div>
      </div>
    </header>
  );
}
