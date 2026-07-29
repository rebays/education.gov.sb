export const NEWS_PAGE_FRAGMENT = /* GraphQL */ `
  fragment NewsPage on NewsPage {
    date
    category
    excerpt
    firstPublishedAt
    image {
      id
      title
      url
      width
      height
    }
    body {
      id
      blockType
      ... on RichTextBlock {
        value
      }
      ... on QuoteBlock {
        quote
        attribution
        role
      }
    }
  }
`;
