import { graphql } from 'gatsby';

# My Awesome Page
Here's a paragraph, followed by a paragraph with data!

<p>{JSON.stringify(props)}</p>

export const pageQuery = graphql`
    allReferenceClass {
      edges {
        node {
          name
        }
      }
    }
`