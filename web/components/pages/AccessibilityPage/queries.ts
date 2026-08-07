import { ACCESSIBILITY_PAGE_FRAGMENT } from "./fragment";
import type { AccessibilityPage } from "./types";

/**
 * AccessibilityPage's URL is a fixed, known route (app/accessibility/page.tsx
 * owns it directly rather than going through the [...slug] catch-all), so
 * this fetches by its expected urlPath instead of pulling in GET_PAGE's full
 * fragment set for every page type.
 */
export const ACCESSIBILITY_URL_PATH = "/accessibility/";

export const GET_ACCESSIBILITY_PAGE = /* GraphQL */ `
  ${ACCESSIBILITY_PAGE_FRAGMENT}
  query GetAccessibilityPage($urlPath: String!) {
    page(urlPath: $urlPath) {
      __typename
      ... on AccessibilityPage {
        title
        ...AccessibilityPage
      }
    }
  }
`;

export type GetAccessibilityPageResult = {
  page: (AccessibilityPage & { title: string }) | null;
};
