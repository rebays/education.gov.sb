/**
 * An official voice set apart inside an article body: an oversized gold
 * quote mark, serif italic quote, and a plain attribution line.
 */
function PullQuote({
  quote,
  attribution,
  className,
}: {
  quote: string
  attribution?: string
  className?: string
}) {
  return (
    <figure className={className}>
      <span
        className="block font-serif text-5xl leading-none text-accent"
        aria-hidden
      >
        “
      </span>
      <blockquote className="mt-1 font-serif text-2xl italic leading-snug text-foreground">
        {quote}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 text-sm font-semibold text-muted">
          — {attribution}
        </figcaption>
      )}
    </figure>
  )
}

export { PullQuote }
