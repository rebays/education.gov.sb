/**
 * Browser-safe GraphQL fetcher. Posts to /api/cms which proxies to the CMS
 * server-side, keeping CMS_GRAPHQL_URL out of the client bundle.
 */
export async function cmsClientFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch('/api/cms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error ?? `CMS ${res.status}`);
  }
  return json.data as T;
}
