export const ABOUT_PAGE_FRAGMENT = /* GraphQL */ `
  fragment AboutPage on AboutPage {
    lead
    purposeHeading
    purposeBody
    purposeImage {
      id
      title
      url
      width
      height
    }
    pillarOneTitle
    pillarOneText
    pillarTwoTitle
    pillarTwoText
    pillarThreeTitle
    pillarThreeText
    supportHeading
    supportBody
    supportEmail
  }
`;
