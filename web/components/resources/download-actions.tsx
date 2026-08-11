import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Downloads the selected file straight from media storage. `download` asks
 * the browser to save rather than navigate, and carries the resource's own
 * label so the saved file isn't named after an opaque storage path.
 */
export function DownloadActions({
  resource,
}: {
  resource: { format: string; size: string; url: string; filename: string };
}) {
  return (
    <a
      href={resource.url}
      download={resource.filename}
      aria-label={`Download ${resource.filename} (${resource.format}${resource.size ? `, ${resource.size}` : ""})`}
      className={cn(buttonVariants({ size: "lg" }), "w-full")}
    >
      <Icon name="download" className="h-4 w-4" />
      Download {resource.format}
      {resource.size && (
        <span className="font-normal opacity-75">· {resource.size}</span>
      )}
    </a>
  );
}
