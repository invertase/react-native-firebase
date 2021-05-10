import React from 'react';
import 'tailwindcss/tailwind.css';
import '../components/html-render/prism-theme.css';

function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

export default MyApp;
