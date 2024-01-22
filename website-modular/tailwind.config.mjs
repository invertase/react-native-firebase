/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'media',
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        './src/utils/unify.ts',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/typography')],
};
