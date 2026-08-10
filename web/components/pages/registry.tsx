import { notFound } from 'next/navigation';
import AboutPage from '@/components/pages/AboutPage/AboutPage';
import type { AboutPage as AboutPageType } from '@/components/pages/AboutPage/types';
import AccessibilityPage from '@/components/pages/AccessibilityPage/AccessibilityPage';
import type { AccessibilityPage as AccessibilityPageType } from '@/components/pages/AccessibilityPage/types';
import NewsIndexPage from '@/components/pages/NewsIndexPage/NewsIndexPage';
import type { NewsIndexPage as NewsIndexPageType } from '@/components/pages/NewsIndexPage/types';
import NewsPage from '@/components/pages/NewsPage/NewsPage';
import type { NewsPage as NewsPageType } from '@/components/pages/NewsPage/types';
import PublicationIndexPage from '@/components/pages/PublicationIndexPage/PublicationIndexPage';
import type { PublicationIndexPage as PublicationIndexPageType } from '@/components/pages/PublicationIndexPage/types';
import ResourceIndexPage from '@/components/pages/ResourceIndexPage/ResourceIndexPage';
import type { ResourceIndexPage as ResourceIndexPageType } from '@/components/pages/ResourceIndexPage/types';

export type CmsPage =
  | AboutPageType
  | AccessibilityPageType
  | NewsIndexPageType
  | NewsPageType
  | PublicationIndexPageType
  | ResourceIndexPageType;

/**
 * Renders a CMS page by dispatching on __typename. Uses a switch (not an
 * indexed lookup) so TypeScript narrows the union to the matching variant
 * and each component receives fully-typed props. Unknown typenames — which
 * can happen if the CMS returns a page type the frontend hasn't been
 * wired for yet — trigger a 404 rather than a silent blank page.
 */
export function renderCmsPage(page: CmsPage) {
  switch (page.__typename) {
    case 'AboutPage':
      return <AboutPage page={page} />;
    case 'AccessibilityPage':
      return <AccessibilityPage page={page} />;
    case 'NewsIndexPage':
      return <NewsIndexPage page={page} />;
    case 'NewsPage':
      return <NewsPage page={page} />;
    case 'PublicationIndexPage':
      return <PublicationIndexPage page={page} />;
    case 'ResourceIndexPage':
      return <ResourceIndexPage page={page} />;
    default:
      notFound();
  }
}
