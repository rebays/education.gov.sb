"use client";

import { useState } from "react";
import { ResourceFileList } from "./resource-file-list";
import type { ResourceFile } from "@/lib/hooks/use-resource-folder";

interface ResourceFileListClientProps {
  files: ResourceFile[];
}

function getFileIcon(extension: string): string {
  const ext = extension.toLowerCase();
  if (["mp4", "webm", "m4v"].includes(ext)) return "🎬";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx", "txt"].includes(ext)) return "📝";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["ppt", "pptx", "key"].includes(ext)) return "🎥";
  if (["zip", "rar", "7z"].includes(ext)) return "📦";
  return "📎";
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceFileListClient({ files }: ResourceFileListClientProps) {
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(
    files[0] || null
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Left: File List */}
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold">Files ({files.length})</h2>
        <ResourceFileList
          files={files}
          selectedFileId={selectedFile?.id}
          onSelectFile={setSelectedFile}
        />
      </div>

      {/* Right: Preview + Download */}
      {selectedFile && (
        <div className="flex flex-col gap-6">
          {/* File Preview */}
          <div className="rounded-lg border border-border bg-muted p-6 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {getFileIcon(selectedFile.fileExtension)}
              </div>
              <div className="font-semibold mb-2">{selectedFile.displayLabel}</div>
              <div className="text-sm text-muted-foreground">
                {selectedFile.fileExtension.toUpperCase()}
                {selectedFile.fileSize && (
                  <div>{formatFileSize(selectedFile.fileSize)}</div>
                )}
                {selectedFile.pages && <div>Pages: {selectedFile.pages}</div>}
              </div>
            </div>
          </div>

          {/* File Metadata */}
          <div className="rounded-lg border border-border p-6 bg-surface">
            <h3 className="font-semibold mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{selectedFile.displayLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Format</dt>
                <dd className="font-medium">
                  {selectedFile.fileExtension.toUpperCase()}
                </dd>
              </div>
              {selectedFile.fileSize && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-medium">
                    {formatFileSize(selectedFile.fileSize)}
                  </dd>
                </div>
              )}
              {selectedFile.office && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Office</dt>
                  <dd className="font-medium">{selectedFile.office}</dd>
                </div>
              )}
              {selectedFile.publishedDate && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="font-medium">{selectedFile.publishedDate}</dd>
                </div>
              )}
              {selectedFile.pages && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pages</dt>
                  <dd className="font-medium">{selectedFile.pages}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Language</dt>
                <dd className="font-medium">{selectedFile.language || "EN"}</dd>
              </div>
            </dl>

            {/* Download Button */}
            <a
              href={selectedFile.url}
              download={selectedFile.filename}
              className="mt-6 block w-full rounded-lg bg-primary text-primary-foreground text-center py-2 font-medium hover:bg-primary/90 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
