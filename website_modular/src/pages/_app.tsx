import React from 'react';
import 'tailwindcss/tailwind.css';
import '../components/html-render/highlight-theme.css';

function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

export default MyApp;
