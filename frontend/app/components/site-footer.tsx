import Image from "next/image";
import Link from "next/link";

const partners = [
  "Australian Government",
  "UNICEF",
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#081432] text-white">
      {/* development partners */}
      <div>
        <div className="mx-auto w-full max-w-8xl px-6 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Development partners
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
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
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-12 px-6 pb-32 pt-36 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          <div className="lg:max-w-md">
          <div className="flex items-center gap-4">
            <Image
              src="/coa-si.webp"
              alt="Solomon Islands coat of arms"
              width={56}
              height={56}
              className="h-14 w-auto shrink-0"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-3xl text-white">iResource</span>
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
          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/privacy" className="hover:text-accent">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-accent">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
        </div>
      </div>

      <div className="border-t border-white/10">
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
