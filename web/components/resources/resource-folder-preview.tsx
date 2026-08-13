"use client";

import React, { useState, useMemo } from "react";
import { CMSResourcePreviewer } from "@/components/resources/cms-resource-previewer";
import { FactSheet } from "@/components/ui/fact-sheet";
import { DownloadActions } from "@/components/resources/download-actions";
import {
  formatFileSize,
  formatUpdated,
  formatYearLevelRange,
} from "@/lib/curriculum";
import type { ResourceFile } from "@/lib/hooks/use-resource-folder";

interface ResourceFolderPreviewProps {
  files: ResourceFile[];
  folderDescription?: string;
  folderName: string;
  /**
   * Curriculum classification, from the folder rather than the file — every
   * field is optional in the CMS, so each row appears only when set.
   */
  subject?: string | null;
  yearLevelLabels?: string[];
  typeLabel?: string;
  publishedDate?: string | null;
}

const ResourceFolderPreview = React.memo(function ResourceFolderPreview({
  files,
  folderDescription,
  subject,
  yearLevelLabels = [],
  typeLabel,
  publishedDate,
}: ResourceFolderPreviewProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const selectedFile = files[selectedFileIdx];
  const isMultipleFiles = files.length > 1;

  const facts: [string, string][] = useMemo(() => {
    const f: [string, string][] = [];

    // What the resource is — from the folder, shared by all its files
    if (subject) {
      f.push(["Subject", subject]);
    }

    const years = formatYearLevelRange(yearLevelLabels);
    if (years) {
      f.push(["Grade / year level", years]);
    }

    if (typeLabel) {
      f.push(["Type", typeLabel]);
    }

    if (publishedDate) {
      f.push(["Published", formatUpdated(publishedDate)]);
    }

    // Specifics of the file currently selected
    f.push(["Format", selectedFile.fileExtension.toUpperCase()]);

    if (selectedFile.fileSize) {
      f.push(["File size", formatFileSize(selectedFile.fileSize)]);
    }

    if (selectedFile.office) {
      f.push(["Office", selectedFile.office]);
    }

    if (selectedFile.pages) {
      f.push(["Pages", String(selectedFile.pages)]);
    }

    return f;
  }, [selectedFile, subject, yearLevelLabels, typeLabel, publishedDate]);

  return (
    <>
      {/* Full-width files section */}
      {isMultipleFiles && (
        <div className="border-b border-border bg-surface">
          <div className="mx-auto w-full max-w-8xl px-6 py-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
              Files ({files.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-6 mt-2">
              This resource contains multiple files. Select one below to preview and download.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file, idx) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`rounded-2xl border p-6 text-left transition-all ${
                    idx === selectedFileIdx
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:bg-surface hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-foreground">{file.displayLabel}</div>
                  <div className="text-xs text-muted-foreground mt-3 font-mono">
                    {file.fileExtension.toUpperCase()} · {formatFileSize(file.fileSize)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main grid - preview + details */}
      <div className="mx-auto grid w-full max-w-8xl gap-10 px-6 py-14 lg:grid-cols-[1fr_320px]">
        {/* preview & content */}
        <div className="min-w-0">
          {/* Preview */}
          <CMSResourcePreviewer
            filename={selectedFile.filename}
            fileExtension={selectedFile.fileExtension}
            downloadUrl={selectedFile.url}
          />

          {/* Names the file being previewed. The page's h1 is the folder
              that holds it, which for a multi-file resource says nothing
              about which of them is on screen. */}
          <h2 className="mt-8 font-serif text-2xl leading-snug text-foreground">
            {selectedFile.displayLabel}
          </h2>

          {/* Description — the folder's, so it is shared by every file. */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
              Description
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {folderDescription || "No description available."}
            </p>
          </div>
        </div>

        {/* metadata sidebar */}
        <aside className="flex flex-col gap-6 lg:pt-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-128px)]">
          {/* Details */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
              Details
            </h2>
            <FactSheet className="mt-4" facts={facts} />
          </div>

          {/* Download Actions */}
          <DownloadActions
            resource={{
              format: selectedFile.fileExtension.toUpperCase(),
              size: formatFileSize(selectedFile.fileSize),
              url: selectedFile.url,
              filename: selectedFile.displayLabel || selectedFile.filename,
            }}
          />
        </aside>
      </div>
    </>
  );
});

export { ResourceFolderPreview };
