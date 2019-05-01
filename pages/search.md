---
title: Search
description: Struggling to find what you're after? Our comprehensive search covers every aspect from guides to methods
---

# Search

<p>{props.data.site.siteMetadata.siteUrl}</p>

<Search />

export const pageQuery = graphql`
  site {
    siteMetadata {
      siteUrl
    }
  }
`
