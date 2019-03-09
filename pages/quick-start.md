---
title: Quick Start
description: Get up and running with React Native Firebase in 5 minutes
---

import { graphql } from 'gatsby';

# Getting started in 5 minutes

TODO

<p>{props.data.documentationPage.title}</p>

export const pageQuery = graphql`
  {
    documentationPage(slug: {eq: "/support"}) {
      title
      slug
    }
  }
`;
