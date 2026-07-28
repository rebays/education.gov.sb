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
    serviceHeading
    serviceIntro
    services {
      id
      blockType
      ... on ServiceBlock {
        heading
        intro
        image {
          id
          title
          url
          width
          height
        }
        badge
        text
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
