const path = require('path');

module.exports = {
  siteMetadata: {
    siteUrl: 'https://rnfirebase.io',
  },
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-emotion`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: ['/about', 'about'],
      },
    },
    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: `GTM-K2S593S`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/../docs`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              icon: false,
            },
          },
        ],
        rehypePlugins: [require('@mapbox/rehype-prism')],
      },
    },
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-plugin-purgecss`,
      options: {
        printRejected: true, // Print removed selectors and processed file names
        develop: process.env.NODE_ENV !== 'production',
        tailwind: true, // Enable tailwindcss support
        content: [
          path.join(process.cwd(), 'src/**/!(*.d).{ts,js,jsx,tsx,md,mdx}'),
          path.join(process.cwd(), 'node_modules/@invertase/ui/dist/**/*.js'),
        ],
        ignore: [
          'prism-theme.css',
          'react-medium-image-zoom/dist/styles.css',
          // 'balloon.min.css',
          'src/styles.css',
        ],
      },
    },

    // Ensure last - creates header/redirect config for Netlify
    `gatsby-plugin-netlify`,
  ],
};
