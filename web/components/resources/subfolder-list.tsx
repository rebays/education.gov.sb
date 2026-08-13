import Link from "next/link";
import type {
  ResourceGrandchild,
  ResourceSubfolder,
} from "@/lib/hooks/use-resource-folder";

interface SubfolderListProps {
  subfolders: ResourceSubfolder[];
  /** Path of the folder these sit in, with a trailing slash. */
  basePath: string;
}

/** Beyond this, inline shortcuts crowd the row and are summarised instead. */
const MAX_INLINE_CHILDREN = 6;

/**
 * Describes a folder by whatever it actually holds. Editors organise the
 * library freely, so a folder may carry files, subfolders, or both — and
 * "0 files" would misdescribe one that only organises others.
 */
function contents(folder: {
  fileCount: number;
  childCount: number;
}): string {
  const parts: string[] = [];
  if (folder.fileCount > 0) {
    parts.push(`${folder.fileCount} file${folder.fileCount === 1 ? "" : "s"}`);
  }
  if (folder.childCount > 0) {
    parts.push(`${folder.childCount} folder${folder.childCount === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

/** An empty folder is a dead end — it would bounce the visitor to the index. */
function isPopulated(folder: { fileCount: number; childCount: number }): boolean {
  return folder.fileCount > 0 || folder.childCount > 0;
}

function InlineChildren({
  folders,
  basePath,
}: {
  folders: ResourceGrandchild[];
  basePath: string;
}) {
  const populated = folders.filter(isPopulated);
  if (populated.length === 0) return null;

  const shown = populated.slice(0, MAX_INLINE_CHILDREN);
  const remaining = populated.length - shown.length;

  return (
    // Lifted above the row's stretched link so these stay clickable.
    <div className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {shown.map((child) => (
        <Link
          key={child.id}
          href={`${basePath}${child.slug}/`}
          className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span aria-hidden className="mr-1 text-muted">
            ›
          </span>
          {child.name}
        </Link>
      ))}
      {remaining > 0 && (
        <span className="text-sm text-muted">+{remaining} more</span>
      )}
    </div>
  );
}

/**
 * Catalogue-style index of the folders in a section: typographic rows
 * rather than cards, so the visual weight stays on the resources
 * themselves, which are shelved as textbooks once you reach them.
 */
export function SubfolderList({ subfolders, basePath }: SubfolderListProps) {
  const populated = subfolders.filter(isPopulated);

  if (populated.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70">
        In this section
      </h2>
      <ul className="mt-6 border-t border-border">
        {populated.map((folder) => {
          const folderPath = `${basePath}${folder.slug}/`;
          return (
            <li
              key={folder.id}
              className="group relative border-b border-border py-6 transition-colors hover:bg-surface/60"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="font-serif text-xl leading-snug text-foreground group-hover:text-primary">
                  <Link
                    href={folderPath}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {folder.name}
                  </Link>
                </h3>
                <span className="shrink-0 font-mono text-[12px] text-muted">
                  {contents(folder)}
                </span>
              </div>

              {folder.description && (
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
                  {folder.description}
                </p>
              )}

              <InlineChildren folders={folder.children} basePath={folderPath} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
