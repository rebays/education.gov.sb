import Link from "next/link";
import Image from "next/image";
import PublicationCover from "../components/publication-cover";
import TraditionalWatermark from "../components/traditional-watermark";
import { publications } from "../lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon, icons } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ResourceCard } from "@/components/ui/resource-card";
import { SearchBar } from "@/components/ui/search-bar";

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
  ["colors", "Colors"],
  ["typography", "Typography"],
  ["foundations", "Foundations"],
  ["components", "Components"],
  ["iconography", "Iconography"],
  ["accessibility", "Accessibility"],
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
    <section id={id} className="scroll-mt-24 border-t border-border py-16 sm:py-20">
      <div className="mx-auto w-full max-w-8xl px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>}
        <div className="mt-10">{children}</div>
      </div>
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
    { label: "Display / Hero", spec: config.typeSpecs.display, cls: "font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl", sample: "Building a brighter future through learning." },
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
              src="/coa-si.webp"
              alt="Solomon Islands coat of arms"
              width={36}
              height={36}
              className="h-9 w-auto shrink-0"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">iResource</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Design System · {config.name}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
              {anchors.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="hover:text-primary">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ---------- Intro ---------- */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <TraditionalWatermark id={`wm-ds-${config.themeKey}`} corners={["top-right", "bottom-left"]} />
        <div className="mx-auto w-full max-w-8xl px-6 py-20 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            iResource · {config.name} system
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Design System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{config.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {config.chips.map((c) => (
              <Badge key={c} variant="neutral">{c}</Badge>
            ))}
          </div>
        </div>
      </section>

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
      </Section>

      {/* ---------- Components ---------- */}
      <Section
        id="components"
        eyebrow="Library"
        title="Components"
        intro="Buttons, inputs, badges, search, and the resource card that anchors the hub. Every control below is a real component from components/ui, built from the same tokens — swap the theme and the whole library re-skins."
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

        <div className="mt-10">
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
              <NativeSelect id="ds-category" className="w-full">
                <NativeSelectOption>Policies &amp; Documents</NativeSelectOption>
                <NativeSelectOption>Reports &amp; Data</NativeSelectOption>
                <NativeSelectOption>Videos &amp; Media</NativeSelectOption>
              </NativeSelect>
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

        <div className="mt-12">
          <SubHead>Search bar</SubHead>
          <SearchBar className="max-w-2xl" inputProps={{ "aria-label": "Search the resource hub" }} />
        </div>

        <div className="mt-12">
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
          <SubHead>Navigation — header</SubHead>
          <div className="space-y-4">
            {/* solid */}
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="flex items-center justify-between gap-4 bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <Image src="/coa-si.webp" alt="" width={32} height={32} className="h-8 w-auto" />
                  <span className="text-sm font-semibold text-foreground">iResource</span>
                </div>
                <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
                  <span className="text-primary">Resources</span>
                  <span className="hover:text-primary">Publications</span>
                  <span className="hover:text-primary">News</span>
                  <span className="inline-flex items-center gap-1.5">
                    About
                    <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
                  </span>
                </nav>
              </div>
            </div>
            {/* transparent over hero */}
            <div className="overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between gap-4 bg-deep px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <Image src="/coa-si.webp" alt="" width={32} height={32} className="h-8 w-auto" />
                  <span className="text-sm font-semibold">iResource</span>
                </div>
                <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
                  <span className="text-white">Resources</span>
                  <span className="hover:text-accent">Publications</span>
                  <span className="hover:text-accent">News</span>
                  <span className="inline-flex items-center gap-1.5">
                    About
                    <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
                  </span>
                </nav>
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
            the publications index and each publication record; becomes the
            fallback once the CMS supplies real cover art.
          </p>
          <div className="flex flex-wrap items-start gap-8">
            <PublicationCover
              publication={publications[0]}
              className="w-[240px]"
            />
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

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border bg-deep text-white">
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-2 px-6 py-10">
          <p className="font-serif text-lg">iResource · {config.name} Design System</p>
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
