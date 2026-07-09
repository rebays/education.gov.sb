import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * The landing page's curriculum-level tile: portrait photo under a brand-blue
 * scrim that runs solid through the title zone and clears by the tile's
 * midpoint; title bottom-left with a Browse action.
 *
 * - `editorial` (tablet and up): serif title, Browse revealed on hover
 *   (always visible on touch), lift-and-glow hover.
 * - `compact` (mobile 2×2 grid): smaller sans title, always-visible Browse,
 *   press-scale feedback.
 */
export default function CategoryTile({
  href,
  image,
  title,
  variant = "editorial",
  sizes,
}: {
  href: string;
  image: string;
  title: string;
  variant?: "editorial" | "compact";
  /** next/image `sizes` for the photo; defaults match the landing page grids. */
  sizes?: string;
}) {
  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-[0.97]"
      >
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes ?? "50vw"}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--deep)_0%,rgba(13,31,60,0.85)_32%,rgba(13,31,60,0.1)_65%,transparent_80%)]" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-sm leading-tight font-semibold text-white">
            {title}
          </h3>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-white/75">
            Browse
            <Icon name="arrow" className="h-3 w-3" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-sm transition-all hover:-translate-y-1.5 hover:border-accent hover:shadow-xl"
    >
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover"
      />
      {/* brand-blue scrim — solid title zone, fully clear by the card's midpoint */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--deep)_0%,var(--deep)_10%,rgba(13,31,60,0.92)_17%,rgba(13,31,60,0.78)_24%,rgba(13,31,60,0.6)_31%,rgba(13,31,60,0.4)_38%,rgba(13,31,60,0.2)_44%,rgba(13,31,60,0)_50%)]" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-serif text-2xl leading-snug text-white transition-colors group-hover:text-accent">
          {title}
        </h3>
        <span className="mt-1.5 inline-flex items-center gap-2 text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
          Browse
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
