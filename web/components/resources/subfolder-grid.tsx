import Link from "next/link";
import type { ResourceSubfolder } from "@/lib/hooks/use-resource-folder";

interface SubfolderGridProps {
  subfolders: ResourceSubfolder[];
  basePath: string;
}

export function SubfolderGrid({ subfolders, basePath }: SubfolderGridProps) {
  if (subfolders.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">
        {subfolders.length === 1 ? "Subfolder" : "Subfolders"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subfolders.map((folder) => {
          const folderPath = basePath ? `${basePath}/${folder.slug}` : folder.slug;
          return (
            <Link
              key={folder.id}
              href={`/resources/${folderPath}`}
              className="group flex flex-col rounded-lg border border-border p-6 hover:bg-muted hover:border-primary/50 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">📁</span>
                <span className="text-lg text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </span>
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {folder.description}
                </p>
              )}
              {folder.fileCount !== undefined && (
                <div className="mt-4 pt-4 border-t border-border text-xs font-medium text-muted-foreground">
                  {folder.fileCount} file{folder.fileCount !== 1 ? "s" : ""}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
