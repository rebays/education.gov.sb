import Link from "next/link";
import Image from "next/image";
import PageHeader from "../components/page-header";
import PublicationCover from "../components/publication-cover";
import TraditionalWatermark from "../components/traditional-watermark";
import { publications } from "../lib/content";
import AccordionDemo from "./accordion-demo";
import CategoryTabs from "./category-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon, icons } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResourceCard } from "@/components/ui/resource-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  Config — the ONLY thing that differs between the two systems.      */
/*  Markup below is identical for both; colours and fonts resolve      */
/*  from the `data-theme` wrapper via tokens in globals.css.           */
/* ------------------------------------------------------------------ */

export type Swatch = {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
  /** border the chip when the fill is very light */
  ring?: boolean;
  /** text colour rendered on top of the swatch for contrast */
  on?: "light" | "dark";
};

export type ShowcaseConfig = {
  themeKey: "classic";
  name: string;
  tagline: string;
  chips: string[];
  colorIntro: string;
  typographyIntro: string;
  principles: string[];
  fonts: { display: string; body: string; mono: string };
  neutrals: Swatch[];
  brand: Swatch[];
  semantic: Swatch[];
  typeSpecs: Record<
    "display" | "h1" | "h2" | "h3" | "lead" | "body" | "small" | "eyebrow",
    string
  >;
  deep: string;
};

/* ------------------------------------------------------------------ */
/*  Static scales — shared, identical across both systems             */
/* ------------------------------------------------------------------ */

const spacing = [
  ["1", "4"], ["2", "8"], ["3", "12"], ["4", "16"], ["5", "20"],
  ["6", "24"], ["8", "32"], ["10", "40"], ["12", "48"], ["16", "64"], ["24", "96"],
];

const radii = [
  { name: "sm", cls: "rounded-sm", px: "2px" },
  { name: "md", cls: "rounded-md", px: "6px" },
  { name: "lg", cls: "rounded-lg", px: "8px" },
  { name: "xl", cls: "rounded-xl", px: "12px" },
  { name: "2xl", cls: "rounded-2xl", px: "16px" },
  { name: "full", cls: "rounded-full", px: "∞" },
];

const elevation = [
  { name: "shadow-sm", cls: "shadow-sm", note: "Resting cards" },
  { name: "shadow-md", cls: "shadow-md", note: "Hover lift" },
  { name: "shadow-lg", cls: "shadow-lg", note: "Popovers" },
  { name: "shadow-xl", cls: "shadow-xl", note: "Card hover, modals" },
];

const breakpoints = [
  { prefix: "–", range: "0–639px", label: "mobile (primary)" },
  { prefix: "sm:", range: "640–767px", label: "large phone" },
  { prefix: "md:", range: "768–1023px", label: "tablet" },
  { prefix: "lg:", range: "1024–1279px", label: "desktop" },
  { prefix: "xl:", range: "1280px +", label: "wide" },
];

const anchors = [
  ["colors", "Colors", "Foundations"],
  ["typography", "Typography", "Foundations"],
  ["foundations", "Spacing & shape", "Foundations"],
  ["motifs", "Traditional designs", "Foundations"],
  ["controls", "Controls & forms", "Components"],
  ["search", "Search & filters", "Components"],
  ["navigation", "Navigation & structure", "Components"],
  ["records", "Cards & records", "Components"],
  ["editorial", "Editorial & news", "Components"],
  ["iconography", "Iconography", "Reference"],
  ["accessibility", "Accessibility", "Reference"],
] as const;

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-14 first:border-t-0 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>}
      <div className="mt-10">{children}</div>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
      {children}
    </h3>
  );
}

function SwatchCard({ s }: { s: Swatch }) {
  const textColor = s.on === "dark" ? "text-foreground" : "text-white";
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div
        className={`flex h-24 items-end p-3 ${s.ring ? "ring-1 ring-inset ring-border" : ""}`}
        style={{ backgroundColor: s.hex }}
      >
        <span className={`font-serif text-lg ${textColor}`}>{s.name}</span>
      </div>
      <div className="space-y-1 p-3">
        <p className="font-mono text-xs uppercase text-foreground">{s.hex}</p>
        <p className="font-mono text-[11px] text-muted">{s.rgb}</p>
        <p className="pt-1 text-[13px] leading-snug text-muted">{s.usage}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The showcase — identical markup for every theme                   */
/* ------------------------------------------------------------------ */

export default function SystemShowcase({ config }: { config: ShowcaseConfig }) {
  const typeRows = [
    { label: "Display / Hero", spec: config.typeSpecs.display, cls: "font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl", sample: "A brighter future through learning." },
    { label: "H1", spec: config.typeSpecs.h1, cls: "font-serif text-4xl leading-tight tracking-tight sm:text-5xl", sample: "Find what you need, by category." },
    { label: "H2", spec: config.typeSpecs.h2, cls: "font-serif text-3xl leading-tight", sample: "Reports & data across the sector" },
    { label: "H3", spec: config.typeSpecs.h3, cls: "font-serif text-xl", sample: "National Education Action Plan 2022–2026" },
    { label: "Lead", spec: config.typeSpecs.lead, cls: "text-lg leading-8 text-muted", sample: "The central hub for policies, reports, videos, and learning resources from the Ministry of Education." },
    { label: "Body", spec: config.typeSpecs.body, cls: "text-[15px] leading-relaxed text-muted", sample: "Every document on the hub is published by the Ministry. We record the source office, publication date, and file format so you always know what you are reading." },
    { label: "Small", spec: config.typeSpecs.small, cls: "text-[13px] leading-5 text-muted", sample: "Published 3 days ago · PDF · 2.4 MB" },
    { label: "Eyebrow", spec: config.typeSpecs.eyebrow, cls: "text-xs font-semibold uppercase tracking-[0.2em] text-primary", sample: "Browse the hub" },
  ];

  return (
    <div data-theme={config.themeKey} className="flex flex-1 flex-col bg-background">
      {/* ---------- Sticky header ---------- */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-8xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/coat-of-arms.png"
              alt="Solomon Islands coat of arms"
              width={48}
              height={48}
              className="h-12 w-auto shrink-0"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-foreground">education.gov.sb</span>
              <span className="text-xs text-muted">Design System</span>
            </span>
          </Link>
        </div>
      </header>

      {/* ---------- Intro — the shared page title band ---------- */}
      <PageHeader
        id={`wm-ds-${config.themeKey}`}
        title="Design System"
        lead={config.tagline}
        crumbs={[{ label: "Design System" }]}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {config.chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
            >
              {c}
            </span>
          ))}
        </div>
      </PageHeader>

      {/* ---------- Category panels: rail + one category at a time ---------- */}
      <CategoryTabs tabs={anchors}>
      {/* ---------- Colors ---------- */}
      <Section
        id="colors"
        eyebrow="Foundations"
        title="Color system"
        intro={config.colorIntro}
      >
        <SubHead>Neutrals</SubHead>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {config.neutrals.map((s) => (
            <SwatchCard key={s.name} s={s} />
          ))}
        </div>

        <div className="mt-12">
          <SubHead>Brand</SubHead>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {config.brand.map((s) => (
              <SwatchCard key={s.name} s={s} />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Semantic</SubHead>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {config.semantic.map((s) => (
              <SwatchCard key={s.name} s={s} />
            ))}
          </div>
        </div>
      </Section>

      {/* ---------- Typography ---------- */}
      <Section
        id="typography"
        eyebrow="Foundations"
        title="Typography"
        intro={config.typographyIntro}
      >
        <div className="divide-y divide-border rounded-2xl border border-border">
          {typeRows.map((t) => (
            <div key={t.label} className="grid gap-3 p-6 sm:grid-cols-[180px_1fr] sm:gap-8">
              <div className="shrink-0">
                <p className="text-sm font-semibold text-foreground">{t.label}</p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">{t.spec}</p>
              </div>
              <p className={t.cls}>{t.sample}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <SubHead>Pairing principles</SubHead>
          <ul className="grid gap-2 text-[15px] leading-relaxed text-muted sm:grid-cols-2">
            {config.principles.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------- Foundations ---------- */}
      <Section
        id="foundations"
        eyebrow="Foundations"
        title="Spacing, shape & elevation"
        intro="A 4pt base keeps rhythm consistent, paired with generous whitespace. Corners are soft; elevation is used sparingly and only to signal interaction. These scales are shared across both systems."
      >
        <SubHead>Spacing scale (px)</SubHead>
        <div className="flex flex-wrap items-end gap-4">
          {spacing.map(([step, px]) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className="rounded bg-primary" style={{ width: `${px}px`, height: `${px}px` }} />
              <span className="font-mono text-[11px] text-muted">{step}</span>
              <span className="font-mono text-[10px] text-muted/70">{px}</span>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <SubHead>Border radius</SubHead>
          <div className="flex flex-wrap gap-5">
            {radii.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-16 border border-primary/40 bg-primary/10 ${r.cls}`} />
                <span className="font-mono text-[11px] text-foreground">{r.name}</span>
                <span className="font-mono text-[10px] text-muted">{r.px}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Elevation</SubHead>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {elevation.map((e) => (
              <div key={e.name} className="flex flex-col items-center gap-3">
                <div className={`flex h-24 w-full items-center justify-center rounded-xl bg-background ${e.cls}`}>
                  <span className="font-mono text-[11px] text-muted">{e.name}</span>
                </div>
                <span className="text-[13px] text-muted">{e.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Breakpoints</SubHead>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-[15px]">
              <tbody className="divide-y divide-border">
                {breakpoints.map((b) => (
                  <tr key={b.range}>
                    <td className="w-20 px-6 py-3 font-mono text-sm text-primary">{b.prefix}</td>
                    <td className="px-6 py-3 font-mono text-sm text-foreground">{b.range}</td>
                    <td className="px-6 py-3 text-muted">{b.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Traditional watermark</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The Pacific weave motif anchored to panel corners and faded toward
            the centre — rendered at 5–6% opacity in the surface&apos;s text
            colour, behind hero bands, section backgrounds, and image-less
            fallbacks. Ambience, never content.
          </p>
          <div className="relative isolate h-56 overflow-hidden rounded-2xl border border-border bg-background">
            <TraditionalWatermark
              id="wm-ds-demo"
              corners={["top-right", "bottom-left"]}
              className="opacity-[0.12]"
            />
          </div>
        </div>
      </Section>

      {/* ---------- Traditional designs ---------- */}
      <Section
        id="motifs"
        eyebrow="Foundations"
        title="Traditional designs"
        intro="Beyond the hand-drawn SVG watermark above, four photographed and illustrated Solomon Islands motifs — woven mat patterns, and panpipe and tema silhouettes — carry the same cultural language across hero, header, footer, and section backgrounds. Same recipe every time: strip the source art's white background into the surface behind it, then fade the edges so nothing sits in a hard-edged box."
      >
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <SubHead>Hero background — Isabel mat weave</SubHead>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              Full-bleed behind the landing hero at 5% opacity, inverted so
              the illustration&apos;s white ground disappears into the navy
              and the weave reads as pale texture, radially masked to fade
              out toward the centre where the title and search sit.
            </p>
            <div className="relative isolate h-56 overflow-hidden rounded-2xl border border-border bg-deep">
              <div
                aria-hidden
                className="absolute inset-0 bg-[url('/isabel-mat-crop.jpeg')] bg-cover bg-center bg-no-repeat opacity-[0.14] [filter:invert(1)] [mask-image:radial-gradient(140%_100%_at_50%_15%,#000_0%,transparent_65%)] [-webkit-mask-image:radial-gradient(140%_100%_at_50%_15%,#000_0%,transparent_65%)]"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted">
              isabel-mat-crop.jpeg · 5% opacity · invert · radial mask
            </p>
          </div>

          <div>
            <SubHead>Page header — woven column</SubHead>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              Every inner-page title band carries this on its right side at
              14% opacity, fading to plain navy on the left via a linear
              mask so it never fights the title and lead text.
            </p>
            <div className="relative isolate h-56 overflow-hidden rounded-2xl border border-border bg-deep">
              <div
                aria-hidden
                className="absolute inset-0 bg-[url('/traditional-column-horizontal.jpeg')] bg-cover bg-right bg-no-repeat opacity-[0.2] [filter:invert(1)] [mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_35%,#000_75%)]"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted">
              traditional-column-horizontal.jpeg · 14% opacity · invert · linear mask
            </p>
          </div>

          <div>
            <SubHead>Footer border strip</SubHead>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              A tiled diamond-lattice strip dividing the footer&apos;s link
              columns from the copyright bar — the one motif meant to be
              seen plainly rather than sensed, at 20% opacity.
            </p>
            <div className="relative isolate flex h-56 items-center overflow-hidden rounded-2xl border border-border bg-deep">
              <div
                aria-hidden
                className="h-14 w-full bg-[url('/BFlong-strip.png')] bg-repeat-x opacity-20 [background-size:auto_100%] [filter:invert(1)]"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted">
              BFlong-strip.png · 20% opacity · invert · tiled
            </p>
          </div>

          <div>
            <SubHead>Section accent — tema</SubHead>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">
              A single tema silhouette anchors the landing page&apos;s
              Latest Publications section, bottom-right and rotated 180°,
              at 6% opacity against the light surface tone — no invert
              needed here, since the source&apos;s own near-white
              background already matches.
            </p>
            <div className="relative isolate h-56 overflow-hidden rounded-2xl border border-border bg-surface">
              <div
                aria-hidden
                className="absolute -bottom-6 right-4 h-44 w-44 rotate-180 bg-[url('/tema.jpeg')] bg-contain bg-bottom-right bg-no-repeat opacity-[0.14]"
              />
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted">
              tema.jpeg · 6% opacity · rotate-180 · no invert
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <SubHead>Recipe</SubHead>
          <ul className="grid gap-2 text-[15px] leading-relaxed text-muted sm:grid-cols-2">
            <li>· Source art is black line-work on a white/near-white ground.</li>
            <li>· On dark surfaces, filter: invert(1) flips it to pale-on-navy so the white ground disappears.</li>
            <li>· On light surfaces matching the source&apos;s own ground, no invert is needed.</li>
            <li>· A mask-image gradient — radial, linear, or none — replaces hard rectangular edges with a fade.</li>
            <li>· Opacity stays low, 5–20%, scaled to whether the motif is ambience or a deliberate accent.</li>
            <li>· Every instance is aria-hidden and pointer-events-none — decoration, never content.</li>
          </ul>
        </div>
      </Section>

      {/* ---------- Components ---------- */}
      {/* ---------- Controls & forms ---------- */}
      <Section
        id="controls"
        eyebrow="Components"
        title="Controls &amp; forms"
        intro="Buttons, inputs, badges, and confirmation actions — every control is built from the same role tokens, so the whole set re-skins together."
      >
        <SubHead>Buttons — variants</SubHead>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">
            <Icon name="download" className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="secondary">Preview</Button>
          <Button variant="ghost">
            <Icon name="share" className="h-4 w-4" />
            Share
          </Button>
          <Button variant="accent">
            Apply for a scholarship
            <Icon name="external" className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12">
          <SubHead>Buttons — sizes & states</SubHead>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Text inputs</SubHead>
          <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="ds-name" className="mb-1.5 text-foreground">Full name</Label>
              <Input id="ds-name" placeholder="e.g. Joshua Zobule" />
            </div>
            <div>
              <Label htmlFor="ds-email" className="mb-1.5 text-foreground">Email</Label>
              <Input id="ds-email" type="email" placeholder="you@education.gov.sb" />
            </div>
            <div>
              <Label htmlFor="ds-category" className="mb-1.5 text-foreground">Select category</Label>
              <Select defaultValue="Early Childhood">
                <SelectTrigger id="ds-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Early Childhood">Early Childhood</SelectItem>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Junior Secondary">Junior Secondary</SelectItem>
                  <SelectItem value="Senior Secondary">Senior Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ds-phone" className="mb-1.5 text-foreground">Phone</Label>
              <Input id="ds-phone" aria-invalid placeholder="+677 …" />
              <span role="alert" className="mt-1.5 block text-[13px] text-error">
                A valid Solomon Islands number is required.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Badges & status</SubHead>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">
              <Icon name="check" className="h-3.5 w-3.5" />
              Published
            </Badge>
            <Badge variant="primary">Policy</Badge>
            <Badge variant="accent">New · 2 days</Badge>
            <Badge variant="warning">Pending review</Badge>
            <Badge variant="error">Archived</Badge>
            <Badge variant="neutral">PDF · 2.4 MB</Badge>
          </div>
        </div>

      </Section>

      {/* ---------- Search & filters ---------- */}
      <Section
        id="search"
        eyebrow="Components"
        title="Search &amp; filters"
        intro="The hub's two search treatments and the in-place filtering patterns that narrow listings without leaving the page."
      >
        <div>
          <SubHead>Search — hero pill</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The flagship search, shared by the landing hero, the search
            results band, and the 404 page: a full pill on white with the
            curriculum-level scope inline behind a hairline divider, and a
            gold icon-and-label submit. On mobile the submit drops the label
            and collapses to a circular icon-only button. Dark surfaces only.
          </p>
          <div className="relative isolate overflow-hidden rounded-2xl bg-deep p-10">
            <div className="mx-auto flex h-14 w-full max-w-2xl items-center rounded-full border border-white/20 bg-white/95 pl-6 pr-1.5">
              <span className="min-w-0 flex-1 truncate text-base text-muted">
                Search documents, reports, videos…
              </span>
              <span className="hidden h-8 items-center gap-1.5 border-l border-border pl-4 pr-2 text-sm font-medium text-muted sm:flex">
                All levels
                <Icon name="chevron" className="size-4 rotate-90" />
              </span>
              <span className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground sm:w-auto sm:gap-2 sm:px-5">
                <Icon name="search" className="size-[18px]" />
                <span className="hidden sm:inline">Search</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Search — header field</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The workaday variant in the inner-page header: a compact
            rounded-lg field on the surface tone with the icon inset left. The
            same treatment scopes listings in filter bars.
          </p>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="relative max-w-md">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <div className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm leading-10 text-muted">
                Search documents, reports, videos…
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Filter bar — chips & scoped search</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The in-place filter row used on the publications register and the
            newsroom: type chips (active chip fills primary) with a scoped
            search input at the right end that recomposes the listing live.
          </p>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-border pb-4">
              {["All", "Policies", "Reports", "Guidelines"].map((label, i) => (
                <span
                  key={label}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground"
                  }`}
                >
                  {label}
                </span>
              ))}
              <div className="relative ml-auto w-full sm:w-64">
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <div className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm leading-10 text-muted/60">
                  Search publications
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Glass pills — suggested searches</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Frosted-glass suggestion chips under the hero search bar: white at
            10% with backdrop blur and a soft border, brightening on hover.
            Dark surfaces only.
          </p>
          <div className="relative isolate overflow-hidden rounded-2xl bg-deep p-10">
            <TraditionalWatermark
              id="wm-ds-glass"
              corners={["bottom-left"]}
              className="text-white opacity-[0.05]"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              {["English", "Mathematics", "Science", "Social Studies"].map(
                (s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- Navigation & structure ---------- */}
      <Section
        id="navigation"
        eyebrow="Components"
        title="Navigation &amp; structure"
        intro="How pages open and move: the site header, the deep-blue title band, and structural interactions."
      >
        <div>
          <SubHead>Navigation — header</SubHead>
          <div className="space-y-4">
            {/* solid — inner pages carry an inline search field */}
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="flex items-center justify-between gap-4 bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <Image src="/coat-of-arms.png" alt="" width={48} height={48} className="h-12 w-auto shrink-0" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-semibold text-foreground">education.gov.sb</span>
                    <span className="text-xs text-muted">MEHRD</span>
                  </span>
                </div>
                <div className="relative hidden max-w-56 flex-1 lg:block">
                  <Icon
                    name="search"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  />
                  <div className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm leading-9 text-muted">
                    Search…
                  </div>
                </div>
                <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
                  <span className="text-primary">Resources</span>
                  <span className="hover:text-primary">Publications</span>
                  <span className="hover:text-primary">News</span>
                  <span className="hover:text-primary">About</span>
                </nav>
              </div>
            </div>
            {/* transparent over hero */}
            <div className="overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between gap-4 bg-deep px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <Image src="/coat-of-arms.png" alt="" width={48} height={48} className="h-12 w-auto shrink-0" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-base font-semibold">education.gov.sb</span>
                    <span className="text-xs text-white/70">MEHRD</span>
                  </span>
                </div>
                <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
                  <span className="text-white">Resources</span>
                  <span className="hover:text-accent">Publications</span>
                  <span className="hover:text-accent">News</span>
                  <span className="hover:text-accent">About</span>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Page title band</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The deep-blue band that opens every inner page: breadcrumb trail,
            serif title, optional lead, and slot content (e.g. a search form),
            over corner watermarks. Rendered live from the shared component.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <PageHeader
              id="wm-ds-pageheader"
              title="The Ministry's official record."
              lead="National policies, sector performance reports, and guidelines — every entry carries a registry reference."
              crumbs={[{ label: "Publications" }]}
            />
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Page not found (404)</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The 404 page reuses the title band as a recovery surface: an
            apologetic serif title, the hero search pill, glass quick-link
            pills to the four main sections, and a quiet mono error code.
            Below the band, the page offers the &ldquo;browse instead&rdquo;
            category cards shared with empty search results.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <PageHeader
              id="wm-ds-404"
              title="We can't find that page."
              lead="The link may be outdated, or the page may have been moved. Try a search, or start again from one of the sections below."
              crumbs={[{ label: "Page not found" }]}
            >
              <div className="mt-8 flex h-14 w-full max-w-2xl items-center rounded-full border border-white/20 bg-white/95 pl-6 pr-1.5">
                <span className="min-w-0 flex-1 truncate text-base text-muted">
                  Search documents, reports, videos…
                </span>
                <span className="hidden h-8 items-center gap-1.5 border-l border-border pl-4 pr-2 text-sm font-medium text-muted sm:flex">
                  All levels
                  <Icon name="chevron" className="size-4 rotate-90" />
                </span>
                <span className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground sm:w-auto sm:gap-2 sm:px-5">
                  <Icon name="search" className="size-[18px]" />
                  <span className="hidden sm:inline">Search</span>
                </span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {["Resources", "Publications", "News", "About"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-8 font-mono text-xs text-white/50">Error 404</p>
            </PageHeader>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Accordion — services</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The selection accordion from the About page: hairline-ruled rows
            with serif titles, a rotating chevron, and a smooth grid-rows
            height animation. One panel is always open — it&apos;s a selector,
            not a toggle — and on the About page the open row also drives a
            companion image. Live component — try it.
          </p>
          <div className="max-w-2xl rounded-2xl border border-border bg-background px-6 pb-1 pt-2">
            <AccordionDemo />
          </div>
        </div>
      </Section>

      {/* ---------- Cards & records ---------- */}
      <Section
        id="records"
        eyebrow="Components"
        title="Cards &amp; records"
        intro="The library's content surfaces — cards, tiles, register rows, covers, and the data panels that describe official records."
      >
        <div>
          <SubHead>Resource cards</SubHead>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              variant="document"
              icon="document"
              badges={[
                { label: "Policy", tone: "primary" },
                { label: "Published", tone: "success", icon: "check" },
              ]}
              title="National Education Action Plan 2022–2026"
              description="The Ministry's medium-term strategy for access, quality, and management across the sector."
              meta="Published 12 Mar 2026 · PDF · 3.1 MB"
              actions={[
                { label: "Download", icon: "download", variant: "primary" },
                { label: "Preview", variant: "ghost" },
              ]}
            />

            <ResourceCard
              variant="report"
              icon="report"
              badges={[
                { label: "Report", tone: "accent" },
                { label: "New · 2 days", tone: "accent" },
              ]}
              title="Performance Assessment Report 2025"
              description="Enrolment, completion, and literacy indicators across all nine provinces and Honiara."
              meta="Published 28 Jun 2026 · PDF · 8.7 MB"
              actions={[
                { label: "Download", icon: "download", variant: "primary" },
                { label: "Preview", variant: "ghost" },
              ]}
            />

            <ResourceCard
              variant="video"
              duration="12:04"
              badges={[{ label: "Video", tone: "primary" }]}
              title="Teacher training: the new primary curriculum"
              description="A recorded session for teachers rolling out the updated Standard 1–3 materials."
              meta="Recorded 05 May 2026 · 12 min"
            />
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Category tile — curriculum levels</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The landing page&apos;s level tiles: portrait photo under a
            brand-blue scrim that runs solid through the title zone and clears
            by the tile&apos;s midpoint; serif title bottom-left, with the
            Browse action revealed on hover (always visible on touch).
          </p>
          <div className="max-w-60">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-sm">
              <Image
                src="/svc-teachers.jpg"
                alt=""
                fill
                sizes="240px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--deep)_0%,var(--deep)_10%,rgba(13,31,60,0.92)_17%,rgba(13,31,60,0.78)_24%,rgba(13,31,60,0.6)_31%,rgba(13,31,60,0.4)_38%,rgba(13,31,60,0.2)_44%,rgba(13,31,60,0)_50%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h4 className="font-serif text-2xl leading-snug text-white">
                  Primary
                </h4>
                <span className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4">
                  Browse <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Register row — publications index</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The gazette-style entry used on the publications register: a mono
            registry code (data, never decoration), a type badge, a serif
            title, and a direct download action — grouped under large serif
            year markers.
          </p>
          <div className="rounded-2xl border border-border bg-background px-6">
            <div className="grid gap-4 border-b border-border py-6 last:border-0 sm:grid-cols-[160px_1fr] lg:grid-cols-[160px_1fr_auto] lg:gap-8">
              <div>
                <p className="font-mono text-xs text-muted">MEHRD/2026/03</p>
                <Badge variant="primary" className="mt-2">Policy</Badge>
              </div>
              <div className="min-w-0">
                <h4 className="font-serif text-xl leading-snug text-foreground">
                  National Education Action Plan 2026–2030
                </h4>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                  The Ministry&apos;s five-year strategy for improving access,
                  quality, and equity across the education sector.
                </p>
                <p className="mt-2 text-xs text-muted">
                  12 May 2026 · Strategic Support Unit
                </p>
              </div>
              <div className="flex items-start gap-2 lg:flex-col lg:items-end">
                <Button variant="secondary" size="sm" className="h-9 px-3 text-xs">
                  <Icon name="download" className="size-3.5" />
                  PDF
                  <span className="font-mono font-normal text-muted">3.2 MB</span>
                </Button>
                <span className="inline-flex h-9 items-center gap-1 px-1 text-xs font-semibold text-primary">
                  Summary <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Document cover — publications</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The designed stand-in for a publication&apos;s cover: deep panel,
            gold rule, coat of arms, serif title, mono registry footer. Anchors
            the publications index, each publication record, and the landing
            page&apos;s cover shelf; becomes the fallback once the CMS supplies
            real cover art.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <PublicationCover
              publication={publications[0]}
              className="w-[240px]"
            />
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Fact sheet — record sidebar</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The spec table on resource and publication records: uppercase
            labels left, mono values right, hairline-ruled rows. Mono is for
            data — never decoration.
          </p>
          <div className="max-w-sm rounded-2xl border border-border bg-surface p-6">
            <dl className="space-y-3.5">
              {(
                [
                  ["Reference", "MEHRD/2026/05"],
                  ["Type", "Policy"],
                  ["Published", "12 May 2026"],
                  ["Format", "PDF · 3.2 MB"],
                  ["Source office", "Strategic Support Unit"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 last:border-0 last:pb-0"
                >
                  <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="text-right font-mono text-sm text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>At a glance — key points</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Check-marked key points shown above a publication&apos;s body —
            the skimmable summary before the full text.
          </p>
          <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">
              At a glance
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Three goals: equitable access, quality teaching and learning, and stronger system management.",
                "Developed through consultations across all nine provinces.",
                "Annual work plans, with a mid-term review scheduled for 2028.",
              ].map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-sm leading-6 text-foreground"
                >
                  <Icon
                    name="check"
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------- Editorial & news ---------- */}
      <Section
        id="editorial"
        eyebrow="Components"
        title="Editorial &amp; news"
        intro="Newsroom patterns: text-only briefs and the voices set apart inside articles."
      >
        <div>
          <SubHead>News briefs</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The text-only briefs column: mono date, category tag, serif
            headline, one-line excerpt. Used behind a hairline column rule on
            the news index (as part of its lead band) and on the landing
            page&apos;s newsroom section — it carries minor stories with no
            image dependence.
          </p>
          <div className="max-w-md rounded-2xl border border-border bg-background px-6 py-1">
            <ul className="divide-y divide-border">
              <li className="py-5">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-muted">2 May 2026</span>
                  <span className="text-xs font-semibold text-primary">Announcement</span>
                </p>
                <h4 className="mt-1.5 font-serif text-lg leading-snug text-foreground">
                  2026 national examination timetable released
                </h4>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  Timetables for SISE, SISC, and SINF examinations are now
                  available for schools and candidates.
                </p>
              </li>
              <li className="py-5">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-muted">22 Jan 2026</span>
                  <span className="text-xs font-semibold text-primary">Announcement</span>
                </p>
                <h4 className="mt-1.5 font-serif text-lg leading-snug text-foreground">
                  2026 school infrastructure grant round now open
                </h4>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  Registered schools can apply through their provincial
                  education authority.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Story card</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The image-led news card: 16:10 photo, colour-coded category badge
            with mono date, serif headline, short excerpt. Stories without a
            photo fall back to the designed deep panel — watermark and coat of
            arms — so text-only announcements never break a card slot.
          </p>
          <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
            <article>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border">
                <Image
                  src="/svc-teachers.jpg"
                  alt=""
                  fill
                  sizes="360px"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant="success">Press release</Badge>
                <span className="font-mono text-xs text-muted">15 Apr 2026</span>
              </div>
              <h4 className="mt-3 font-serif text-xl leading-snug text-foreground">
                Over 300 teachers graduate from in-service programme
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                The latest cohort completed school-based professional
                development modules.
              </p>
            </article>
            <article>
              <div className="relative isolate flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-border bg-deep">
                <TraditionalWatermark
                  id="wm-ds-storycard"
                  corners={["top-right", "bottom-left"]}
                  className="z-0 text-white opacity-[0.06]"
                />
                <Image
                  src="/coat-of-arms.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-auto opacity-80"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant="primary">Announcement</Badge>
                <span className="font-mono text-xs text-muted">28 Apr 2026</span>
              </div>
              <h4 className="mt-3 font-serif text-xl leading-snug text-foreground">
                SISE 2025 results released to schools
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Candidates should contact their school principal for results.
              </p>
            </article>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Headline list</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            The &ldquo;More news&rdquo; rows below the news index&apos;s lead
            band: serif headline left, mono date and category right-aligned,
            hairline rules between rows. Absorbs any volume of older stories
            with zero image demand; loads progressively (one auto-load, then
            a button).
          </p>
          <div className="max-w-3xl rounded-2xl border border-border bg-background px-6">
            <ul className="divide-y divide-border">
              {(
                [
                  ["Education radio programme returns for term two", "1 Apr 2026", "Announcement"],
                  ["Five ICT labs open in Western Province schools", "28 Mar 2026", "Press release"],
                  ["School registration renewals due 30 April", "20 Mar 2026", "Announcement"],
                ] as [string, string, string][]
              ).map(([title, date, category]) => (
                <li key={title}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
                    <h4 className="min-w-0 font-serif text-lg leading-snug text-foreground">
                      {title}
                    </h4>
                    <span className="shrink-0 text-xs text-muted">
                      <span className="font-mono">{date}</span> · {category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <SubHead>Pull quote — news article</SubHead>
          <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            Official voices set apart in article bodies: an oversized gold
            quote mark, serif italic at 2xl, and a plain attribution line.
            Note: on dark article heroes the category chip renders in gold
            accent (the hero variant); on light surfaces categories use their
            colour-coded badge variants.
          </p>
          <div className="max-w-2xl rounded-2xl border border-border bg-background p-8">
            <figure>
              <span
                className="block font-serif text-5xl leading-none text-accent"
                aria-hidden
              >
                “
              </span>
              <blockquote className="mt-1 font-serif text-2xl italic leading-snug text-foreground">
                This plan belongs to every school, every community, and every
                child in the Solomon Islands.
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-muted">
                — Permanent Secretary, MEHRD
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>

      {/* ---------- Iconography ---------- */}
      <Section
        id="iconography"
        eyebrow="Library"
        title="Iconography"
        intro="Line only · 1.5px stroke · 24px grid · round caps and joins. Icons stay unfilled and inherit currentColor so they read correctly on any surface, in either theme."
      >
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-6 lg:grid-cols-8">
          {Object.keys(icons).map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 bg-background py-6 text-foreground">
              <Icon name={name as keyof typeof icons} className="h-6 w-6" />
              <span className="font-mono text-[10px] text-muted">{name}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <SubHead>Motion principles</SubHead>
          <ul className="grid gap-2 text-[15px] leading-relaxed text-muted sm:grid-cols-2">
            <li>· Subtle by default — 120–200ms hover, 240–320ms panels. Ease cubic-bezier(.2,.7,.3,1).</li>
            <li>· Photographs lead — hero images fade in over ~300ms with a 2% scale.</li>
            <li>· Cards lift on hover (−4px translate + shadow-xl), never on load.</li>
            <li>· Under prefers-reduced-motion, transitions drop to 0ms; nothing breaks.</li>
          </ul>
        </div>
      </Section>

      {/* ---------- Accessibility ---------- */}
      <Section
        id="accessibility"
        eyebrow="Principles"
        title="Accessibility"
        intro="The hub serves the whole public. Contrast, focus, and clear labelling are non-negotiable — and hold in both themes."
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            "All text meets WCAG 2.2 AA contrast on the canvas (ink 4.5:1+).",
            "Focus rings are a 2px primary outline with 2px offset — never removed.",
            "Tap targets are at least 44×44px on mobile (button size ≥ md).",
            "Status is never colour-only — badges always pair colour with a text label.",
            "Images carry descriptive alt text; decorative images use empty alt.",
            "Form errors are announced via role=\"alert\", not colour alone.",
          ].map((item) => (
            <li key={item} className="flex gap-3 rounded-xl border border-border bg-background p-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <span className="text-[15px] leading-relaxed text-muted">{item}</span>
            </li>
          ))}
        </ul>
      </Section>
      </CategoryTabs>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border bg-deep text-white">
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-2 px-6 py-10">
          <p className="font-serif text-lg">education.gov.sb Design System</p>
          <p className="text-sm text-white/60">
            Ministry of Education &amp; Human Resources Development, Solomon Islands Government.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 font-medium text-accent hover:text-white">
              <Icon name="arrow" className="h-4 w-4 rotate-180" />
              Back to the hub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
