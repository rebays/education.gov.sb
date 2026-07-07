import Image from "next/image";
import { cn } from "@/lib/utils";
import { publicationRef, type Publication } from "../lib/content";

/**
 * Designed stand-in for a publication's cover — deep-blue panel, gold rule,
 * coat of arms, serif title, and a mono registry footer. Used on the
 * publications index and each publication record; becomes the fallback once
 * the CMS supplies real cover images.
 */
export default function PublicationCover({
  publication,
  className,
}: {
  publication: Publication;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex aspect-[3/4] flex-col rounded-xl bg-deep p-7 shadow-xl ring-1 ring-black/10",
        className,
      )}
    >
      <span className="h-1 w-12 rounded-full bg-accent" />
      <Image
        src="/coa-si.webp"
        alt=""
        width={44}
        height={44}
        className="mt-7 h-11 w-auto self-start"
      />
      <p className="mt-auto font-serif text-xl leading-snug text-white">
        {publication.title}
      </p>
      <p className="mt-4 border-t border-white/15 pt-4 font-mono text-[10px] uppercase tracking-wider text-white/50">
        {publicationRef(publication)}
        <br />
        Solomon Islands Government
      </p>
    </div>
  );
}
