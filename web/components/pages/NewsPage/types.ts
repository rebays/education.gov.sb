import type { Page } from '../Page/types';

type Image = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
};

export type NewsRichTextBlock = {
  id: string;
  blockType: 'RichTextBlock';
  value: string;
};

export type NewsQuoteBlock = {
  id: string;
  blockType: 'QuoteBlock';
  quote: string;
  attribution: string;
  role: string;
};

export type NewsBodyBlock = NewsRichTextBlock | NewsQuoteBlock;

export type NewsCategory = 'announcement' | 'press_release' | 'event';

export type NewsPage = Page & {
  __typename: 'NewsPage';
  date: string;
  category: NewsCategory;
  excerpt: string;
  firstPublishedAt: string | null;
  image: Image | null;
  body: NewsBodyBlock[];
};
