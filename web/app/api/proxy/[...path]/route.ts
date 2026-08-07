export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join("/");

  if (filePath.includes("..") || filePath.startsWith("/")) {
    return new Response("Invalid path", { status: 400 });
  }

  try {
    const cmsStorageUrl = process.env.NEXT_PUBLIC_CMS_STORAGE_URL;
    if (!cmsStorageUrl) {
      return new Response("Storage URL not configured", { status: 500 });
    }

    const fileUrl = `${cmsStorageUrl}/${filePath}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return new Response("File not found", { status: 404 });
    }

    const headers = new Headers(response.headers);
    headers.delete("X-Frame-Options");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Cache-Control", "public, max-age=3600, immutable");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Proxy error", { status: 500 });
  }
}
