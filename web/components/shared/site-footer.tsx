import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { getMenu } from "@/lib/menu";
import { FALLBACK_FOOTER_NAV, isNavGroup, type NavGroup, type NavLink } from "@/lib/nav";

/** External-link marker: an SVG so mobile emoji fonts never claim it (a raw ↗ renders as an emoji on iOS/Android). */
function ExternalMark() {
  return (
    <Icon
      name="external"
      className="ml-1 inline-block h-3.5 w-3.5 align-[-0.125em]"
    />
  );
}

function FooterLink({ link }: { link: NavLink }) {
  const label = (
    <>
      {link.title}
      {link.external && <ExternalMark />}
    </>
  );
  return link.external ? (
    <a href={link.href} className="hover:text-accent" target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <Link href={link.href} className="hover:text-accent">
      {label}
    </Link>
  );
}

function FooterGroup({ group }: { group: NavGroup }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{group.title}</p>
      <ul className="mt-3 space-y-2 text-sm text-white/70">
        {group.links.map((link) => (
          <li key={link.key}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SiteFooter() {
  const items = (await getMenu("footer-nav")) ?? FALLBACK_FOOTER_NAV;
  const groups = items.filter(isNavGroup);

  return (
    <footer className="bg-deep-2 text-white">
      <div>
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-12 px-6 pb-32 pt-36 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          <div className="lg:max-w-md">
            <div className="flex items-center gap-4">
              <Image
                src="/coat-of-arms.png"
                alt="Solomon Islands coat of arms"
                width={56}
                height={56}
                className="h-14 w-auto shrink-0"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-3xl text-white">Education Resource Hub</span>
                <span className="mt-1 text-sm text-white/60">
                  Ministry of Education &amp; Human Resources Development
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/60">
              Empowering Solomon Islands classrooms with centralized access to
              the national curriculum and essential teaching tools for
              inclusive, quality learning.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:flex lg:flex-1 lg:justify-between lg:gap-12">
            {groups.map((group) => (
              <FooterGroup key={group.key} group={group} />
            ))}
          </div>
        </div>
      </div>

      {/* traditional border strip, tiled full-width above the copyright bar */}
      <div
        aria-hidden
        className="h-14 bg-[url('/BFlong-strip.png')] bg-repeat-x opacity-20 [background-size:auto_100%] [filter:invert(1)]"
      />

      <div>
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-2 px-6 py-9 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex flex-wrap items-center gap-x-6">
            <span>© {new Date().getFullYear()}</span>
            <span>
              Ministry of Education &amp; Human Resources Development
            </span>
          </span>
          <span>Hosted on SIG ICT Services</span>
        </div>
      </div>
    </footer>
  );
}
