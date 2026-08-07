export const ACCESSIBILITY_PAGE_FRAGMENT = /* GraphQL */ `
  fragment AccessibilityPage on AccessibilityPage {
    lead
    atAGlance {
      id
      blockType
      ... on CharBlock {
        value
      }
    }
    body
    conformanceTarget
    effectiveDate
    lastReviewed
    contactEmail
  }
`;
