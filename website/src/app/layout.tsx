import glob from 'fast-glob'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'
import { type Metadata } from 'next'
import { type Section } from '@/components/SectionProvider'

export const metadata: Metadata = {
  title: {
    template: '%s - React Native Firebase',
    default: 'React Native Firebase',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pages = await glob('**/*.mdx', { cwd: 'src/app' })
  const allSectionsEntries = (await Promise.all(
    pages.map(async (filename) => [
      '/' + filename.replace(/(^|\/)page\.mdx$/, '').replace('(docs)/', ''),
      (await import(`./${filename}`)).sections,
    ]),
  )) as Array<[string, Array<Section>]>
  const allSections = Object.fromEntries(allSectionsEntries)

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-K2S593S');`}
        </script>
        <link rel="icon" type="image/png" href="//static.invertase.io/assets/react-native-firebase-favicon.png" />
      </head>
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <Providers>
          <div className="w-full">
            <Layout allSections={allSections}>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
