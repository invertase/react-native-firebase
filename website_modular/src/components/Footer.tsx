import React from 'react';
import { Link } from './Link';

export function Footer() {
  return (
    <footer className="p-8">
      <div className="flex items-center text-xs text-gray-500">
        <div className="flex-grow">
          React Native Firebase &copy; Invertase Limited 2015-{new Date().getFullYear()}
        </div>
        <div className="space-x-2">
          <Link href="https://github.com/invertase/react-native-firebase">
            <a className="underline">GitHub</a>
          </Link>
          <Link href="https://twitter.com/rnfirebase">
            <a className="underline">Twitter</a>
          </Link>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-10 space-y-4">
        <p>
          Copyright © 2017-{new Date().getFullYear()} Invertase Limited. Except as otherwise noted,
          the content of this page is licensed under the Creative Commons Attribution 3.0 License,
          and code samples are licensed under the Apache 2.0 License. Some partial documentation,
          under the Creative Commons Attribution 3.0 License, may have been sourced from Firebase.
        </p>
        <p>
          All product names, logos, and brands are property of their respective owners. All company,
          product and service names used in this website are for identification purposes only. Use
          of these names, logos, and brands does not imply endorsement.
        </p>
      </div>
    </footer>
  );
}
