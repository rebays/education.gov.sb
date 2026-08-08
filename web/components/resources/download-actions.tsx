import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/**
 * Download stays a styled stand-in (no real file store wired up yet, so
 * no onClick).
 */
export function DownloadActions({
  resource,
}: {
  resource: { format: string; size: string };
}) {
  return (
    <Button size="lg" className="w-full">
      <Icon name="download" className="h-4 w-4" />
      Download {resource.format}
      <span className="font-normal opacity-75">· {resource.size}</span>
    </Button>
  );
}
