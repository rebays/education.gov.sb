/**
 * Client-safe types and helpers for the site nav. Keep this file free of
 * server-only imports so it can be pulled into client components like
 * NavDropdown and MobileNav without breaking the build. The server-only
 * fetch helper lives in ./menu.
 */

export type NavLink = {
  key: string;
  title: string;
  href: string;
  external?: boolean;
};
export type NavGroup = { key: string; title: string; links: NavLink[] };
export type NavDropdown = {
  key: string;
  title: string;
  href?: string;
  items: Array<NavLink | NavGroup>;
};
export type NavItem = NavLink | NavGroup | NavDropdown;

/* Discriminators — used in the renderer's switch. */
export function isNavLink(item: NavItem): item is NavLink {
  return 'href' in item && !('items' in item) && !('links' in item);
}
export function isNavGroup(item: NavItem): item is NavGroup {
  return 'links' in item;
}
export function isNavDropdown(item: NavItem): item is NavDropdown {
  return 'items' in item;
}

export const FALLBACK_MAIN_NAV: NavItem[] = [
  { key: 'fallback-resources', title: 'Resources', href: '/resources' },
  { key: 'fallback-publications', title: 'Publications', href: '/publications' },
  { key: 'fallback-news', title: 'News', href: '/news' },
  { key: 'fallback-about', title: 'About', href: '/about' },
];

export const FALLBACK_FOOTER_NAV: NavItem[] = [
  {
    key: 'fallback-browse',
    title: 'Browse',
    links: [
      { key: 'fallback-resources', title: 'Resource library', href: '/resources' },
      { key: 'fallback-publications', title: 'Policies & publications', href: '/publications' },
      { key: 'fallback-news', title: 'News', href: '/news' },
      { key: 'fallback-search', title: 'Search', href: '/search' },
    ],
  },
  {
    key: 'fallback-ministry',
    title: 'Ministry',
    links: [
      {
        key: 'fallback-main-site',
        title: 'Main website',
        href: 'https://mehrd.gov.sb',
        external: true,
      },
      { key: 'fallback-about', title: 'About', href: '/about' },
      { key: 'fallback-contact', title: 'Contact', href: '/about/contact' },
    ],
  },
  {
    key: 'fallback-gov',
    title: 'Government',
    links: [
      {
        key: 'fallback-sig',
        title: 'Solomon Islands Government',
        href: 'https://solomons.gov.sb',
        external: true,
      },
      {
        key: 'fallback-scholarships',
        title: 'Scholarships portal',
        href: 'https://sitesa.gov.sb',
        external: true,
      },
    ],
  },
  {
    key: 'fallback-legal',
    title: 'Legal',
    links: [
      { key: 'fallback-privacy', title: 'Privacy', href: '/privacy' },
      { key: 'fallback-terms', title: 'Terms of use', href: '/terms' },
      { key: 'fallback-accessibility', title: 'Accessibility', href: '/accessibility' },
    ],
  },
];
