import type { Page } from '../Page/types';

export type ResourceIndexPage = Page & {
  __typename: 'ResourceIndexPage';
  lead: string;
};
