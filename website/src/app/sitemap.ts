import { MetadataRoute } from 'next'
import glob from 'fast-glob'

export default async function sitemap(): MetadataRoute.Sitemap {
  const pages = await glob('**/*.mdx', { cwd: 'src/app' })

  return pages.map((page) => {
    const path = page
      // Replace all page.mdx with nothing
      .replace('page.mdx', '')
      // Remove the grouping folder (docs)
      .replace('(docs)/', '')
      // Remove any trailing slashes
      .replace(/\/$/, '')

    return {
      url: `https://rnfirebase.io/${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  })
}
