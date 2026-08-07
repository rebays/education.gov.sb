/**
 * PublicationIndexPage's URL is a fixed, known route (app/publications/page.tsx
 * owns it directly rather than going through the [...slug] catch-all), so this
 * fetches just the page-level metadata by its expected urlPath instead of
 * pulling in the full GET_PAGE fragment set.
 */
export const PUBLICATIONS_INDEX_URL_PATH = "/publications/";

export const GET_PUBLICATIONS_INDEX_META = /* GraphQL */ `
  query GetPublicationsIndexMeta($urlPath: String!) {
    page(urlPath: $urlPath) {
      __typename
      ... on PublicationIndexPage {
        title
        lead
      }
    }
  }
`;

export type PublicationsIndexMeta = {
  __typename: "PublicationIndexPage";
  title: string;
  lead: string;
};

export type PublicationsIndexMetaQueryResult = {
  page: PublicationsIndexMeta | null;
};
