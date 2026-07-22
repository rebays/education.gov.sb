import { PAGE_FRAGMENT } from '@/components/pages/Page/fragment';
import { ABOUT_PAGE_FRAGMENT } from '@/components/pages/AboutPage/fragment';

export const GET_PAGE = /* GraphQL */ `
  ${PAGE_FRAGMENT}
  ${ABOUT_PAGE_FRAGMENT}
  query GetPage($urlPath: String!) {
    page(urlPath: $urlPath) {
      ...PageBase
      ... on AboutPage {
        ...AboutPage
      }
    }
  }
`;

export const GET_PAGE_BY_TOKEN = /* GraphQL */ `
  ${PAGE_FRAGMENT}
  ${ABOUT_PAGE_FRAGMENT}
  query GetPageByToken($token: String!) {
    page(token: $token) {
      ...PageBase
      ... on AboutPage {
        ...AboutPage
      }
    }
  }
`;

export const GET_PAGE_META_BY_TOKEN = /* GraphQL */ `
  query GetPageMetaByToken($token: String!) {
    page(token: $token) {
      __typename
      url
      contentType
    }
  }
`;
