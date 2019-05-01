---
title: Search
description: Struggling to find what you're after? Our comprehensive search covers every aspect from guides to methods
---

# Search

<Search />

<StaticQuery
  query={graphql`
    {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `}
  render={(data) => (
    <div>
      <p>{data.site.siteMetadata.siteUrl}</p>
    </div>
  )}
/>