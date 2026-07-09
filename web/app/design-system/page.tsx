import type { Metadata } from "next";
import SystemShowcase, { type ShowcaseConfig } from "./showcase";
//updated
export const metadata: Metadata = {
  title: "Design System",
  description:
    "The education.gov.sb design system — Solomon Islands blue and gold, set in Baskervville and Source Sans 3.",
};

const classic: ShowcaseConfig = {
  themeKey: "classic",
  name: "Classic",
  tagline:
    "The government-grade system: Solomon Islands blue and gold on a calm, near-white canvas, with an editorial serif for headings. Steady, formal, and unmistakably official.",
  chips: ["Baskervville + Source Sans 3", "Light theme", "4pt spacing base", "Solomon blue + gold"],
  colorIntro:
    "Sourced from the Solomon Islands national palette — deep blue and gold — on a calm, near-white canvas. Every colour is a CSS variable in globals.css, swapped by the data-theme attribute and exposed to Tailwind as a theme token.",
  typographyIntro:
    "Baskervville (serif) carries emotion in display and headings; Source Sans 3 handles everything interactive and all running copy. A monospace stack is reserved for data — file sizes, dates, and tokens.",
  principles: [
    "Serif for display & resource titles — never for UI controls.",
    "Sans for everything interactive: buttons, forms, cards, navigation.",
    "Mono only for tabular data — dates, file sizes, reference codes.",
    "Maximum two display-sized headings per screen.",
  ],
  fonts: { display: "Baskervville", body: "Source Sans 3", mono: "System mono" },
  neutrals: [
    { name: "Ink", hex: "#16202C", rgb: "22, 32, 44", usage: "Primary text, headings", on: "light" },
    { name: "Ink Muted", hex: "#5B6B7B", rgb: "91, 107, 123", usage: "Secondary text, metadata", on: "light" },
    { name: "Border", hex: "#D8DEE6", rgb: "216, 222, 230", usage: "Dividers, hairlines", on: "dark", ring: true },
    { name: "Surface 2", hex: "#E9EEF4", rgb: "233, 238, 244", usage: "Wells, chip fills", on: "dark", ring: true },
    { name: "Surface", hex: "#F4F6F9", rgb: "244, 246, 249", usage: "Section background", on: "dark", ring: true },
    { name: "Background", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Canvas / card", on: "dark", ring: true },
  ],
  brand: [
    { name: "Primary", hex: "#14529B", rgb: "20, 82, 155", usage: "SI blue — links, CTAs", on: "light" },
    { name: "Primary Hover", hex: "#0F3F78", rgb: "15, 63, 120", usage: "Pressed / hover state", on: "light" },
    { name: "Accent", hex: "#F2B705", rgb: "242, 183, 5", usage: "Gold — highlights, badges", on: "dark" },
    { name: "Ink Deep", hex: "#0D1F3C", rgb: "13, 31, 60", usage: "Footer, immersive panels", on: "light" },
  ],
  semantic: [
    { name: "Success", hex: "#2F7A4F", rgb: "47, 122, 79", usage: "Published, verified", on: "light" },
    { name: "Warning", hex: "#B8791C", rgb: "184, 121, 28", usage: "Pending, caution", on: "light" },
    { name: "Error", hex: "#A83232", rgb: "168, 50, 50", usage: "Validation, unavailable", on: "light" },
  ],
  typeSpecs: {
    display: "clamp 48–72px · Baskervville 400",
    h1: "40px / 1.1 · Baskervville 400",
    h2: "28px / 1.15 · Baskervville 400",
    h3: "20px / 1.25 · Baskervville 400",
    lead: "18px / 1.5 · Source Sans 400",
    body: "15px / 1.55 · Source Sans 400",
    small: "13px / 1.5 · Source Sans 400",
    eyebrow: "12px · caps · Source Sans 600",
  },
  deep: "#0d1f3c",
};

export default function ClassicDesignSystemPage() {
  return <SystemShowcase config={classic} />;
}
