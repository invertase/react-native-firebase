import React from 'react';
import 'tailwindcss/tailwind.css';

function MyApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

export default MyApp;
