"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — nothing to do */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "h-9 px-3 text-xs",
      )}
    >
      <Icon name={copied ? "check" : "share"} className="size-3.5" />
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
