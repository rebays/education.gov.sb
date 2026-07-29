import 'server-only';
import { cache } from 'react';
import { cmsFetch } from './cms';
import { GET_MENU } from './queries';
import type { NavGroup, NavItem, NavLink } from './nav';

/* ----------------------------- CMS raw shapes ----------------------------- */

type CmsPageRef = {
  url: string | null;
  urlPath: string;
  pageType: string;
};

type CmsPageLink = {
  id: string;
  blockType: 'PageLinkBlock';
  title: string;
  page: CmsPageRef | null;
};

type CmsExternalLink = {
  id: string;
  blockType: 'ExternalLinkBlock';
  title: string;
  url: string;
};

type CmsLinksGroup = {
  id: string;
  blockType: 'LinksGroupBlock';
  title: string;
  links: Array<CmsPageLink | CmsExternalLink>;
};

type CmsDropdown = {
  id: string;
  blockType: 'DropdownBlock';
  title: string;
  showDropdownIcon: boolean;
  page: CmsPageRef | null;
  items: Array<CmsPageLink | CmsExternalLink | CmsLinksGroup>;
};

type CmsMenuItem = CmsPageLink | CmsExternalLink | CmsLinksGroup | CmsDropdown;

type CmsMenu = {
  id: string;
  name: string;
  slug: string;
  menuItems: CmsMenuItem[];
};

/* ----------------------------- Normalisation ------------------------------ */

function pageHref(page: CmsPageRef | null): string | null {
  return page?.url ?? null;
}

function fromCmsLeaf(block: CmsPageLink | CmsExternalLink): NavLink | null {
  if (block.blockType === 'PageLinkBlock') {
    const href = pageHref(block.page);
    return href ? { key: block.id, title: block.title, href } : null;
  }
  return {
    key: block.id,
    title: block.title,
    href: block.url,
    external: true,
  };
}

function fromCmsGroup(block: CmsLinksGroup): NavGroup {
  return {
    key: block.id,
    title: block.title,
    links: block.links.map(fromCmsLeaf).filter((l): l is NavLink => l !== null),
  };
}

function fromCmsItem(item: CmsMenuItem): NavItem | null {
  switch (item.blockType) {
    case 'PageLinkBlock':
    case 'ExternalLinkBlock':
      return fromCmsLeaf(item);
    case 'LinksGroupBlock':
      return fromCmsGroup(item);
    case 'DropdownBlock':
      return {
        key: item.id,
        title: item.title,
        href: pageHref(item.page) ?? undefined,
        items: item.items
          .map((sub) => {
            if (sub.blockType === 'LinksGroupBlock') return fromCmsGroup(sub);
            return fromCmsLeaf(sub);
          })
          .filter((sub): sub is NavLink | NavGroup => sub !== null),
      };
  }
}

/* ------------------------ Server-side fetch helper ------------------------ */

/**
 * cache() dedupes within a single render tree — every SiteHeader/SiteFooter
 * that asks for the same slug during one request pays for one network call.
 */
export const getMenu = cache(async (slug: string): Promise<NavItem[] | null> => {
  try {
    const data = await cmsFetch<{ menu: CmsMenu | null }>(GET_MENU, { slug });
    if (!data.menu) return null;
    return data.menu.menuItems
      .map(fromCmsItem)
      .filter((i): i is NavItem => i !== null);
  } catch {
    return null;
  }
});
