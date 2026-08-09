"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface CMSResourcePreviewerProps {
  filename: string;
  fileExtension: string;
  downloadUrl: string;
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
  const isVideo = ["mp4", "webm", "m4v"].includes(fileExtension.toLowerCase());
  const isPdf = fileExtension.toLowerCase() === "pdf";
  const [stage, setStage] = useState<PreviewStage>("loading");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm">
      <div className={isPdf ? "aspect-3/4 lg:aspect-5/4" : "aspect-video lg:aspect-16/7"}>
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
            className="w-full h-full bg-deep"
            controlsList="nodownload"
          >
            <source src={downloadUrl} type={`video/${fileExtension.toLowerCase()}`} />
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
