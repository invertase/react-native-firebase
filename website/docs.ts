import { Glob } from 'bun'
import yaml from 'yaml'
import matter from 'gray-matter'
import { NavGroup, TopLevelNav } from '@/components/Navigation'

const glob = new Glob('../docs/**/*.md')

for (const file of glob.scanSync()) {
  const bunFile = Bun.file(file)
  const { content, data: frontMatter } = matter(await bunFile.text())
  let mdxFilePath = file
    .replace('.md', '/page.mdx')
    .replace('../docs/', './src/app/(docs)/')

  if (mdxFilePath.endsWith('/index/page.mdx')) {
    mdxFilePath = mdxFilePath.replace('/index/page.mdx', '/page.mdx')
  }

  const newFile = Bun.file(mdxFilePath)
  const newContent = `
{/* THIS FILE IS GENERATED, DO NOT EDIT IT */}

export const metadata = {
  title: '${frontMatter.title || ''}',
  description: '${frontMatter.description || ''}',
};

${content}`.trim()
  await Bun.write(newFile, newContent)
}

export type ISidebarItem = [string, string | ISidebar]
export type ISidebar = ISidebarItem[]

const sidebarYaml = '../docs/sidebar.yaml'
const sidebar: ISidebar = yaml.parse(await Bun.file(sidebarYaml).text())

const transformedSidebar: {
  topLevelNav: TopLevelNav[]
  navigation: NavGroup[]
} = {
  topLevelNav: [],
  navigation: [],
}

for (const [title, linkOrSidebar] of sidebar) {
  if (typeof linkOrSidebar === 'string') {
    transformedSidebar.topLevelNav.push({
      title,
      href: linkOrSidebar,
    })
  } else {
    transformedSidebar.navigation.push({
      title,
      links: linkOrSidebar.map(([title, link]) => ({
        title,
        href: link as string,
      })),
    })
  }
}

await Bun.write(
  './src/lib/sidebar.json',
  JSON.stringify(transformedSidebar, null, 2),
)

console.log('Generated docs at src/app/(docs)/')
