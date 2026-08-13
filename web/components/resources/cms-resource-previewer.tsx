"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface CMSResourcePreviewerProps {
  filename: string;
  fileExtension: string;
  downloadUrl: string;
}

/**
 * `video/<ext>` is only a valid media type for some of the extensions the
 * CMS accepts — a browser skips a <source> whose declared type it doesn't
 * recognise, so `video/m4v` would silently refuse to play.
 */
const VIDEO_MIME_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  webm: "video/webm",
};

/**
 * Frame sizing follows the YouTube watch page: a 16:9 frame by default,
 * with landscape video letterboxed inside it rather than reshaping the
 * page around each file, but genuinely tall video given its own frame —
 * pillarboxing a phone-shot clip into 16:9 wastes most of the width.
 */
const DEFAULT_FRAME_RATIO = 16 / 9;
/** Floor for adapted frames, so an extreme ratio can't run off the page. */
const MIN_FRAME_RATIO = 9 / 16;
/** Share of the viewport the frame may occupy vertically. */
const MAX_FRAME_HEIGHT = "72vh";

function frameRatioFor(naturalRatio: number | null): number {
  if (!naturalRatio) return DEFAULT_FRAME_RATIO;
  if (naturalRatio >= 1) return DEFAULT_FRAME_RATIO;
  return Math.max(naturalRatio, MIN_FRAME_RATIO);
}

function getFileIcon(ext: string): string {
  const e = ext.toLowerCase();
  if (["mp4", "webm", "m4v"].includes(e)) return "🎬";
  if (["pdf"].includes(e)) return "📄";
  if (["doc", "docx", "txt"].includes(e)) return "📝";
  if (["xls", "xlsx", "csv"].includes(e)) return "📊";
  if (["ppt", "pptx"].includes(e)) return "🎥";
  if (["zip", "rar", "7z"].includes(e)) return "📦";
  return "📎";
}


type PreviewStage = "loading" | "embed-fallback" | "failed" | "ready";

function Skeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex animate-pulse flex-col items-center justify-center gap-3 bg-surface" aria-hidden>
      <div className="h-10 w-10 rounded-full bg-surface-2" />
      <div className="h-3 w-48 rounded bg-surface-2" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function CMSResourcePreviewer({
  filename,
  fileExtension,
  downloadUrl,
}: CMSResourcePreviewerProps) {
  const extension = fileExtension.toLowerCase();
  const isVideo = extension in VIDEO_MIME_TYPES;
  const isPdf = extension === "pdf";
  const [stage, setStage] = useState<PreviewStage>("loading");
  /** The video's own width/height, once it has reported its metadata. */
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  const frameRatio = frameRatioFor(naturalRatio);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm",
        // Centred so a height-capped or portrait player sits in the middle
        // of the column rather than hugging its left edge.
        isVideo && "mx-auto w-full",
      )}
      style={
        isVideo
          ? {
              aspectRatio: String(frameRatio),
              // Caps the frame by viewport height while preserving its
              // ratio — a max-height would clamp the height but leave the
              // width at 100%, reintroducing the side bars.
              maxWidth: `calc(${MAX_FRAME_HEIGHT} * ${frameRatio})`,
            }
          : undefined
      }
    >
      <div
        className={
          isVideo
            ? "h-full w-full"
            : isPdf
              ? "aspect-3/4 lg:aspect-5/4"
              : "aspect-video lg:aspect-16/7"
        }
      >
        {isPdf ? (
          <>
            <iframe
              src={downloadUrl}
              title={`Preview of ${filename}`}
              className="w-full h-full bg-surface"
              onError={() => setStage("failed")}
            />
            {stage === "failed" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
                <Icon name="document" className="h-10 w-10 text-muted" />
                <p className="text-sm text-muted">This preview couldn&apos;t load — the file may still be downloaded below.</p>
              </div>
            )}
          </>
        ) : isVideo ? (
          <video
            controls
            playsInline
            // Fetches the header only — not the body, which can be 200MB —
            // so the player can report its dimensions before playback.
            preload="metadata"
            className="w-full h-full bg-deep object-contain"
            controlsList="nodownload"
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget;
              if (videoWidth && videoHeight) {
                setNaturalRatio(videoWidth / videoHeight);
              }
            }}
          >
            <source src={downloadUrl} type={VIDEO_MIME_TYPES[extension]} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex h-full justify-center px-6 py-8 sm:px-10 sm:py-10 bg-white">
            <div className="text-center flex flex-col justify-center">
              <div className="text-6xl mb-4">{getFileIcon(fileExtension)}</div>
              <div className="font-semibold text-foreground">{filename}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {fileExtension.toUpperCase()} file
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
