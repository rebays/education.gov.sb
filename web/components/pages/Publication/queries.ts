export type PublicationTypeValue = "policy" | "report" | "guideline";

export type PublicationListItem = {
  title: string;
  slug: string;
  url: string;
  fileExtension: string;
  fileSize: number | null;
  date: string;
  publicationType: PublicationTypeValue;
  office: string;
  summary: string;
};

export type PublicationKeyPoint = {
  id: string;
  blockType: "CharBlock";
  value: string;
};

export type PublicationDetail = PublicationListItem & {
  body: string;
  keyPoints: PublicationKeyPoint[];
  newerEntry: { title: string; slug: string } | null;
  relatedPublicationItems: PublicationListItem[];
};

export const PUBLICATIONS_QUERY = /* GraphQL */ `
  query Publications($publicationType: String, $office: String) {
    publications(publicationType: $publicationType, office: $office) {
      title
      slug
      url
      fileExtension
      fileSize
      date
      publicationType
      office
      summary
    }
  }
`;

export type PublicationsQueryResult = {
  publications: PublicationListItem[];
};

export const PUBLICATION_QUERY = /* GraphQL */ `
  query PublicationDetail($slug: String!) {
    publication(slug: $slug) {
      title
      slug
      url
      fileExtension
      fileSize
      date
      publicationType
      office
      summary
      body
      keyPoints {
        id
        blockType
        ... on CharBlock {
          value
        }
      }
      newerEntry {
        title
        slug
      }
      relatedPublicationItems {
        title
        slug
        url
        fileExtension
        fileSize
        date
        publicationType
        office
        summary
      }
    }
  }
`;

export type PublicationQueryResult = {
  publication: PublicationDetail | null;
};
