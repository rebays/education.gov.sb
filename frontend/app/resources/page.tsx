import type { Metadata } from "next";
import PageHeader from "../components/page-header";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { CurriculumExplorer } from "./components/curriculum-explorer";

export const metadata: Metadata = {
  title: "Curriculum Index",
  description:
    "Browse curriculum materials by subject and grade level, or drill into the full coverage map across Primary and Secondary.",
};

export default function ResourceIndexPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <PageHeader
        id="wm-resources"
        eyebrow="Curriculum Index"
        title="Every subject, every grade, in one map."
        lead="See what's published against each subject and grade level at a glance, then drill into the resources behind any cell."
        crumbs={[{ label: "Resources" }]}
      />

      <main className="flex-1 bg-background">
        <CurriculumExplorer />
      </main>

      <SiteFooter />
    </div>
  );
}
