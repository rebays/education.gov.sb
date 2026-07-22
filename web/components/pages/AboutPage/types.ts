import type { Page } from '../Page/types';

type Image = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
};

export type AboutPage = Page & {
  __typename: 'AboutPage';
  lead: string;
  purposeHeading: string;
  purposeBody: string;
  purposeImage: Image | null;
  pillarOneTitle: string;
  pillarOneText: string;
  pillarTwoTitle: string;
  pillarTwoText: string;
  pillarThreeTitle: string;
  pillarThreeText: string;
  supportHeading: string;
  supportBody: string;
  supportEmail: string;
};
