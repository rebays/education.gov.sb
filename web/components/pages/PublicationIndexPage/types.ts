import type { Page } from '../Page/types';

export type PublicationIndexPage = Page & {
  __typename: 'PublicationIndexPage';
  lead: string;
};
