import Link from "next/link";

const partners = [
  "Australian Government",
  "New Zealand Aid Programme",
  "UNICEF",
  "The World Bank",
  "Global Partnership for Education",
];

export default function SiteFooter() {
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto grid w-full max-w-8xl gap-8 px-6 pb-16 pt-20 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-serif text-lg text-white">iResource</p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Ministry of Education &amp; Human Resources Development, Solomon
            Islands Government.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Browse</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/resources" className="hover:text-accent">
                Resource library
              </Link>
            </li>
            <li>
              <Link href="/publications" className="hover:text-accent">
                Policies &amp; publications
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-accent">
                News
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-accent">
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Ministry</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a href="https://mehrd.gov.sb" className="hover:text-accent">
                Main website ↗
              </a>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent">
                About
              </Link>
            </li>
            <li>
              <Link href="/about/contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Government</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a href="https://solomons.gov.sb" className="hover:text-accent">
                Solomon Islands Government ↗
              </a>
            </li>
            <li>
              <a
                href="https://scholarships.education.gov.sb"
                className="hover:text-accent"
              >
                Scholarships portal ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* development partners */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-8xl px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Development partners
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-12 gap-y-5">
            {partners.map((name) => (
              <span
                key={name}
                className="font-serif text-lg text-white/40 transition-colors hover:text-white/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-8xl px-6 py-5 text-xs text-white/50">
          © {new Date().getFullYear()} Ministry of Education &amp; Human
          Resources Development, Solomon Islands Government. Hosted on SIG ICT
          Services · education.gov.sb
        </div>
      </div>
    </footer>
  );
}
