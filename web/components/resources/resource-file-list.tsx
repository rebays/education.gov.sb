"use client";

import { cn } from "@/lib/utils";
import type { ResourceFile } from "@/lib/hooks/use-resource-folder";

interface ResourceFileListProps {
  files: ResourceFile[];
  selectedFileId?: string;
  onSelectFile: (file: ResourceFile) => void;
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

export function ResourceFileList({
  files,
  selectedFileId,
  onSelectFile,
}: ResourceFileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() => onSelectFile(file)}
          className={cn(
            "group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all",
            selectedFileId === file.id
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted hover:border-primary/50"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">
              {getFileIcon(file.fileExtension)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">
                {file.displayLabel}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {file.fileExtension.toUpperCase()}
                {file.fileSize && <span> • {formatFileSize(file.fileSize)}</span>}
                {file.isVideo && <span> • Video</span>}
              </div>
              {file.office && (
                <div className="text-xs text-muted-foreground mt-1">
                  {file.office}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
