import AboutPage from '@/components/pages/AboutPage/AboutPage';
import type { AboutPage as AboutPageType } from '@/components/pages/AboutPage/types';
import NewsIndexPage from '@/components/pages/NewsIndexPage/NewsIndexPage';
import type { NewsIndexPage as NewsIndexPageType } from '@/components/pages/NewsIndexPage/types';

export type CmsPage = AboutPageType | NewsIndexPageType;

/**
 * Renders a CMS page by dispatching on __typename. Uses a switch (not an
 * indexed lookup) so TypeScript narrows the union to the matching variant
 * and each component receives fully-typed props.
 */
export function renderCmsPage(page: CmsPage) {
  switch (page.__typename) {
    case 'AboutPage':
      return <AboutPage page={page} />;
    case 'NewsIndexPage':
      return <NewsIndexPage page={page} />;
  }
}
