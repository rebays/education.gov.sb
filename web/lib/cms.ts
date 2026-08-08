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
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data as T;
}