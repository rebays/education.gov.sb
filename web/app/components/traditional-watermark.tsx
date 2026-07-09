/**
 * Subtle background watermark inspired by Pacific / Melanesian traditional
 * geometric motifs (concentric diamonds with dot and chevron accents).
 *
 * Rather than filling the whole background, the motif is anchored to corners
 * and faded out toward the centre with a radial mask. Render inside a
 * `relative isolate overflow-hidden` parent; it sits behind sibling content
 * via a negative z-index.
 *
 * `id` must be unique per instance (SVG pattern ids can't collide in the DOM).
 */

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const cornerClass: Record<Corner, string> = {
  "top-left":
    "left-0 top-0 [mask-image:radial-gradient(130%_130%_at_0%_0%,#000_0%,transparent_62%)] [-webkit-mask-image:radial-gradient(130%_130%_at_0%_0%,#000_0%,transparent_62%)]",
  "top-right":
    "right-0 top-0 [mask-image:radial-gradient(130%_130%_at_100%_0%,#000_0%,transparent_62%)] [-webkit-mask-image:radial-gradient(130%_130%_at_100%_0%,#000_0%,transparent_62%)]",
  "bottom-left":
    "bottom-0 left-0 [mask-image:radial-gradient(130%_130%_at_0%_100%,#000_0%,transparent_62%)] [-webkit-mask-image:radial-gradient(130%_130%_at_0%_100%,#000_0%,transparent_62%)]",
  "bottom-right":
    "bottom-0 right-0 [mask-image:radial-gradient(130%_130%_at_100%_100%,#000_0%,transparent_62%)] [-webkit-mask-image:radial-gradient(130%_130%_at_100%_100%,#000_0%,transparent_62%)]",
};

function Weave({ patternId }: { patternId: string }) {
  return (
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={patternId} width="92" height="92" patternUnits="userSpaceOnUse">
          {/* concentric diamonds */}
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M46 3 L89 46 L46 89 L3 46 Z" />
            <path d="M46 23 L69 46 L46 69 L23 46 Z" />
          </g>
          {/* solid accents: centre, corners, edge chevrons */}
          <g fill="currentColor" stroke="none">
            <path d="M46 40 L52 46 L46 52 L40 46 Z" />
            <circle cx="0" cy="0" r="2" />
            <circle cx="92" cy="0" r="2" />
            <circle cx="0" cy="92" r="2" />
            <circle cx="92" cy="92" r="2" />
            <path d="M41 0 L46 6 L51 0 Z" />
            <path d="M41 92 L46 86 L51 92 Z" />
            <path d="M0 41 L6 46 L0 51 Z" />
            <path d="M92 41 L86 46 L92 51 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default function TraditionalWatermark({
  id,
  corners = ["bottom-left", "bottom-right"],
  className = "",
  fill = false,
}: {
  id: string;
  corners?: Corner[];
  className?: string;
  /** Tile the motif evenly across the whole parent instead of fading in
   *  from the corners — for panels where the pattern itself is the
   *  point, not a faint accent (e.g. a page-header's photo-split band). */
  fill?: boolean;
}) {
  if (fill) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 text-primary opacity-[0.06] ${className}`}
      >
        <Weave patternId={`${id}-fill`} />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 text-primary opacity-[0.06] ${className}`}
    >
      {corners.map((c) => (
        <div
          key={c}
          className={`absolute h-64 w-64 sm:h-96 sm:w-96 lg:h-[440px] lg:w-[440px] ${cornerClass[c]}`}
        >
          <Weave patternId={`${id}-${c}`} />
        </div>
      ))}
    </div>
  );
}
