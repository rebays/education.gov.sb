export const NEWS_PAGES_QUERY = /* GraphQL */ `
  query NewsPages($first: Int, $after: String, $category: NewsCategory) {
    newsPages(first: $first, after: $after, category: $category) {
      edges {
        cursor
        node {
          slug
          urlPath
          title
          date
          category
          excerpt
          image {
            url
            title
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export type NewsPagesQueryResult = {
  newsPages: {
    edges: Array<{
      cursor: string;
      node: {
        slug: string;
        urlPath: string;
        title: string;
        date: string;
        category: 'announcement' | 'press_release' | 'event';
        excerpt: string;
        image: { url: string; title: string } | null;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

export type NewsCategoryEnum = 'ANNOUNCEMENT' | 'PRESS_RELEASE' | 'EVENT';
