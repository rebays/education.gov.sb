import type { Page } from '../Page/types';

export type NewsIndexPage = Page & {
  __typename: 'NewsIndexPage';
  lead: string;
};
