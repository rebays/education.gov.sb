import 'server-only';

export async function cmsFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const cmsUrl = process.env.CMS_GRAPHQL_URL;
  if (!cmsUrl) throw new Error('CMS_GRAPHQL_URL is not set');

  const res = await fetch(cmsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CMS ${res.status}: ${errorText}`);
  }

  const json = await res.json();

  if (json.errors) {
    // GraphQL allows partial success: field-level errors (e.g. a missing
    // file on disk breaking one publication's fileSize) come back alongside
    // otherwise-usable data. Log for visibility but only fail the request
    // when there's no data left to render.
    console.error('CMS GraphQL errors:', JSON.stringify(json.errors));
    if (json.data == null) {
      throw new Error('CMS query failed');
    }
  }

  return json.data as T;
}