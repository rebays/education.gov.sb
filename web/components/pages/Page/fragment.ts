export const PAGE_FRAGMENT = /* GraphQL */ `
  fragment PageBase on PageInterface {
    __typename
    id
    urlPath
    url
    title
    slug
    seoTitle
    pageType
    contentType
    searchDescription
  }
`;
