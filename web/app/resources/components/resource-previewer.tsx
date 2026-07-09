"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CurriculumResource } from "../../lib/curriculum";

type PreviewKind = "pdf" | "slides" | "video" | "generic";
type Stage = "loading" | "embed-fallback" | "failed" | "ready";

function getPreviewKind(format: string): PreviewKind {
  const f = format.toUpperCase();
  if (f === "PDF") return "pdf";
  if (f === "PPTX" || f === "PPT") return "slides";
  if (f === "MP4") return "video";
  return "generic";
}

function Frame({
  children,
  dark,
  className,
}: {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border sm:aspect-video",
        dark ? "bg-deep" : "bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex animate-pulse flex-col items-center justify-center gap-3 bg-surface" aria-hidden>
      <div className="h-10 w-10 rounded-full bg-surface-2" />
      <div className="h-3 w-48 rounded bg-surface-2" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function EmbedFallbackMessage({ resource }: { resource: CurriculumResource }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      <Icon name="document" className="h-10 w-10 text-muted" />
      <p className="text-sm text-muted">This preview couldn&apos;t load — the file may still be downloaded below.</p>
      {resource.previewUrl && (
        <a
          href={resource.previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Open in a new tab
          <Icon name="external" className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

/** Small round icon button overlaid on the preview surface's top-right corner. */
function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="View full screen"
      className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-deep/70 text-white backdrop-blur transition-colors hover:bg-deep lg:hidden"
    >
      <Icon name="expand" className="h-4 w-4" />
    </button>
  );
}

/**
 * Renders the right preview surface for a curriculum resource's file format:
 * an embedded iframe for PDFs and slide decks (falling back to an <embed>,
 * then a static message, if the iframe can't load), a video placeholder,
 * or a static thumbnail for anything else. A safety timeout covers iframes
 * that never fire load/error at all — school connections aren't always
 * reliable, and browsers can't reliably report an X-Frame-Options block.
 *
 * On mobile, a corner button expands the same surface into a full-screen
 * sheet — the inline card is comfortable for glancing at a cover or a
 * couple of slides, but reading a full document on a phone needs the
 * whole viewport.
 */
export function ResourcePreviewer({ resource }: { resource: CurriculumResource }) {
  const kind = getPreviewKind(resource.format);
  const [stage, setStage] = useState<Stage>("loading");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (kind === "generic" || kind === "video") {
      const t = setTimeout(() => setStage("ready"), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => (s === "loading" ? "embed-fallback" : s)), 8000);
    return () => clearTimeout(t);
  }, [kind, resource.id]);

  let body: React.ReactNode;
  let dark = false;

  if (kind === "pdf" || kind === "slides") {
    const url = resource.previewUrl;
    const label = kind === "pdf" ? "document" : "slide deck";

    if (!url || stage === "failed") {
      body = <EmbedFallbackMessage resource={resource} />;
    } else {
      body = (
        <>
          {stage === "loading" && <Skeleton label={`Loading ${label} preview…`} />}
          {stage === "embed-fallback" ? (
            <embed
              src={url}
              type="application/pdf"
              className="h-full w-full"
              onLoad={() => setStage("ready")}
              onError={() => setStage("failed")}
            />
          ) : (
            <iframe
              src={url}
              title={`Preview of ${resource.title}`}
              className="h-full w-full"
              onLoad={() => setStage((s) => (s === "loading" ? "ready" : s))}
              onError={() => setStage("embed-fallback")}
            />
          )}
        </>
      );
    }
  } else if (kind === "video") {
    dark = true;
    body =
      stage === "loading" ? (
        <Skeleton label="Loading video preview…" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
            <Icon name="video" className="h-7 w-7" />
          </span>
        </div>
      );
  } else {
    body =
      stage === "loading" ? (
        <Skeleton label="Loading preview…" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Icon name="document" className="h-10 w-10 text-muted" />
          <p className="text-sm text-muted">No inline preview for {resource.format} files — download to view.</p>
        </div>
      );
  }

  return (
    <>
      <Frame dark={dark}>
        {body}
        <ExpandButton onClick={() => setFullscreen(true)} />
      </Frame>

      <Sheet open={fullscreen} onOpenChange={setFullscreen}>
        <SheetContent side="full" className="gap-0 p-0">
          <SheetTitle className="sr-only">{resource.title} — full screen preview</SheetTitle>
          <div className="flex h-full flex-col p-4 pt-20">
            <Frame dark={dark} className="aspect-auto min-h-0 flex-1 rounded-xl sm:aspect-auto">
              {body}
            </Frame>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
