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
    pillars {
      id
      blockType
      ... on PillarBlock {
        title
        text
        icon
      }
    }
    supportHeading
    supportBody
    supportEmail
    contactFormHeading
    contactFormIntro
    contactFormFields {
      id
      blockType
      ... on TextFieldBlock {
        fieldLabel
        placeholder
      }
      ... on EmailFieldBlock {
        fieldLabel
        placeholder
      }
      ... on MultilineTextFieldBlock {
        fieldLabel
        placeholder
      }
      ... on DropdownFieldBlock {
        fieldLabel
        options
      }
    }
    contactFormSubmitText
  }
`;
