export const RELATED_NEWS_QUERY = /* GraphQL */ `
  query RelatedNews($first: Int!) {
    newsPages(first: $first) {
      edges {
        node {
          slug
          url
          title
          date
          category
        }
      }
    }
  }
`;

export type RelatedNewsQueryResult = {
  newsPages: {
    edges: Array<{
      node: {
        slug: string;
        url: string | null;
        title: string;
        date: string;
        category: 'announcement' | 'press_release' | 'event';
      };
    }>;
  };
};
