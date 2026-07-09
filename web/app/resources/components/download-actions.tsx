"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { CurriculumResource } from "../../lib/curriculum";

/**
 * Download stays a styled stand-in (no real file store wired up yet, so
 * no onClick). Copy to Drive mocks the confirmation a Google Drive picker
 * would give — there's no Drive integration behind it either.
 */
export function DownloadActions({ resource }: { resource: CurriculumResource }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" className="w-full">
        <Icon name="download" className="h-4 w-4" />
        Download {resource.format}
        <span className="font-normal opacity-75">· {resource.size}</span>
      </Button>
      <Button
        size="lg"
        variant="secondary"
        className="w-full"
        onClick={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }}
      >
        <Icon name={copied ? "check" : "bookmark"} className="h-4 w-4" />
        {copied ? "Added to Drive" : "Copy to Drive"}
      </Button>
    </div>
  );
}
